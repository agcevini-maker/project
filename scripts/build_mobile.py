#!/usr/bin/env python3
"""Genera la versión para celular (celular/index.html) a partir del prototipo de escritorio.

El prototipo de escritorio (prototipo/index.html) no se toca. Este script le suma:
- los estilos de celular (celular/movil.css): pestañas abajo, barra superior y todo en una columna;
- la barra superior con el menú de cuenta;
- explicaciones de palabras al tocarlas y textos de "tocá" en lugar de "pasá el mouse";
- gráficos con menos fechas en pantallas angostas.

Uso: python3 scripts/build_mobile.py
Si el prototipo cambia y algún reemplazo deja de encajar, el script avisa y no escribe nada.
"""
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "prototipo" / "index.html"
CSS = ROOT / "celular" / "movil.css"
OUT = ROOT / "celular" / "index.html"


def main():
    s = SRC.read_text(encoding="utf-8")
    css = CSS.read_text(encoding="utf-8")
    problems = []

    def rep(old, new):
        nonlocal s
        if s.count(old) != 1:
            problems.append(old[:90])
            return
        s = s.replace(old, new)

    rep('<meta name="viewport" content="width=device-width, initial-scale=1">',
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<meta name="theme-color" content="#0B2A33">\n'
        '<meta name="mobile-web-app-capable" content="yes">\n'
        '<meta name="apple-mobile-web-app-capable" content="yes">\n'
        '<meta name="apple-mobile-web-app-title" content="Sin Miedo">')
    rep("<title>Sin Miedo · prototipo</title>", "<title>Sin Miedo</title>")
    rep("</style>", "  .m-top { display: none; }\n" + css + "</style>")

    # Barra superior con el nombre y un menú (mapa del prototipo y cerrar sesión).
    rep('''  return `<div class="shell ${wide ? "wide" : ""}">
    <aside class="side">''', '''  return `<div class="shell ${wide ? "wide" : ""}">
    <header class="m-top">${logo()}<button class="m-me" data-act="mmenu" aria-label="Tu cuenta y opciones">${esc(myName())}<span class="avatar" style="background:var(--mint);color:#062018">${esc(myName()[0].toUpperCase())}</span></button></header>
    <aside class="side">''')
    rep('''    case "map": showMap(); break;''', '''    case "map": showMap(); break;
    case "mmenu": modal(`<div class="row" style="gap:12px"><div class="avatar" style="background:var(--mint);color:#062018;width:44px;height:44px;font-size:16px">${esc(myName()[0].toUpperCase())}</div><div style="min-width:0"><b>${esc(myName())}</b><div class="small muted" style="overflow:hidden;text-overflow:ellipsis">${esc(USER?.email || "")}</div></div></div>
      <p class="small muted" style="margin-top:12px">${savedLabel()}</p>
      <div class="stack" style="gap:8px;margin-top:14px"><button class="btn ghost block" data-act="map">${icon("map")}Mapa del prototipo</button><button class="btn ghost block" data-act="logout">${icon("back")}Cerrar sesión</button><button class="btn block" data-act="closeModal">Cerrar</button></div>`); break;''')
    rep("  USER = null; S = fresh();", '  USER = null; S = fresh(); modal("");')

    # En el celular no hay mouse: las palabras raras se explican al tocarlas.
    rep('''document.addEventListener("mouseover", e => { const el = e.target.closest?.(".term"); if (el) showTip(el); });''',
        '''document.addEventListener("mouseover", e => { const el = e.target.closest?.(".term"); if (el) showTip(el); });
document.addEventListener("touchstart", e => { const el = e.target.closest?.(".term"); if (el) showTip(el); else hideTip(); }, { passive: true });''')
    s = s.replace("Pasá el mouse por cualquier palabra subrayada", "Tocá cualquier palabra subrayada")
    s = s.replace("Pasá el mouse por las palabras subrayadas", "Tocá las palabras subrayadas")

    # Gráficos: menos fechas cuando el ancho es chico, y sin pisar la última.
    rep("every = Math.ceil(n / 7);", "every = Math.ceil(n / Math.max(3, Math.min(7, Math.floor((W - L - R) / 72))));")
    rep("  const xEvery = Math.ceil(labels.length / 7);",
        "  const xEvery = Math.ceil(labels.length / Math.max(3, Math.min(7, Math.floor((W - L - R) / 72))));")
    rep("${labels.map((l, i) => i % xEvery === 0 || i === n ?",
        "${labels.map((l, i) => (i % xEvery === 0 && n - i >= xEvery * 0.6) || i === n ?")

    # Ficha del activo: el encabezado se acomoda en dos renglones.
    rep('''      <div class="between" style="align-items:flex-start">
        <div><div class="row" style="gap:10px"><h2>''', '''      <div class="between asset-top" style="align-items:flex-start">
        <div><div class="row" style="gap:10px"><h2>''')

    if problems:
        print("No se pudo generar la versión para celular. Estos fragmentos del prototipo cambiaron:", file=sys.stderr)
        for p in problems:
            print("  -", p, file=sys.stderr)
        return 1
    OUT.write_text(s, encoding="utf-8")
    print(f"Listo: {OUT.relative_to(ROOT)} ({len(s) // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())

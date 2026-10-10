#!/usr/bin/env python3
"""Baja precios reales de cierre y la inflación, y los guarda dentro de la app.

Fuentes:
  - Precios de cierre diarios en pesos (BYMA) desde Yahoo Finance (tickers .BA).
  - Inflación mensual (IPC, INDEC) desde api.argentinadatos.com, con datos.gob.ar como respaldo.
  - Valor de cuotaparte de un fondo money market desde api.argentinadatos.com (CAFCI).

Salida:
  - data/mercado.json
  - index.html: reemplaza el bloque entre /*MARKET_DATA_START*/ y /*MARKET_DATA_END*/.

Si una fuente falla, sigue con las demás y lo deja anotado en "notas".
Uso: python3 scripts/update_market.py
"""
import datetime as dt
import json
import math
import os
import re
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"}

# Código en la app -> ticker en Yahoo Finance
TICKERS = {
    "AL30": "AL30.BA", "GD30": "GD30.BA",
    "SPY": "SPY.BA", "KO": "KO.BA", "AAPL": "AAPL.BA", "MELI": "MELI.BA",
    "YPFD": "YPFD.BA", "GGAL": "GGAL.BA", "PAMP": "PAMP.BA", "ALUA": "ALUA.BA",
}
REFERENCE = "GGAL"   # sus fechas de operación definen el calendario
YEARS = 3
FUND_NAME_HINTS = ["Fima Premium", "Mercado Pago", "Balanz Money Market", "Galileo Ahorro", "Santander Super Ahorro"]

notes = []


def get_json(url, tries=3):
    last = None
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(2 * (k + 1))
    raise RuntimeError(f"{url}: {last}")


def yahoo_closes(ticker):
    for host in ("query1", "query2"):
        try:
            data = get_json(f"https://{host}.finance.yahoo.com/v8/finance/chart/{ticker}?range={YEARS}y&interval=1d")
            res = data["chart"]["result"][0]
            ts = res["timestamp"]
            closes = res["indicators"]["quote"][0]["close"]
            out = {}
            for t, c in zip(ts, closes):
                if c is None or not math.isfinite(c) or c <= 0:
                    continue
                day = dt.datetime.utcfromtimestamp(t).date().isoformat()
                out[day] = round(float(c), 4)
            if out:
                return out
        except Exception as e:  # noqa: BLE001
            notes.append(f"{ticker} en {host}: {e}")
    return {}


def inflation():
    try:
        rows = get_json("https://api.argentinadatos.com/v1/finanzas/indices/inflacion")
        out = {r["fecha"][:7]: round(float(r["valor"]), 2) for r in rows if r.get("valor") is not None}
        if out:
            return out, "INDEC (vía argentinadatos.com)"
    except Exception as e:  # noqa: BLE001
        notes.append(f"inflación argentinadatos: {e}")
    try:
        data = get_json("https://apis.datos.gob.ar/series/api/series/?ids=148.3_INIVELNAL_DICI_M_26&format=json&limit=1000")
        pts = [(d[0][:7], d[1]) for d in data["data"] if d[1] is not None]
        out = {}
        for (m0, v0), (m1, v1) in zip(pts, pts[1:]):
            out[m1] = round((v1 / v0 - 1) * 100, 2)
        if out:
            return out, "INDEC (vía datos.gob.ar)"
    except Exception as e:  # noqa: BLE001
        notes.append(f"inflación datos.gob.ar: {e}")
    return {}, None


def money_market(dates):
    """Valor de cuotaparte de un fondo money market, muestreado una vez por mes e interpolado por día."""
    samples = {}
    fund = None
    months = sorted({d[:7] for d in dates})
    for m in months + ["ultimo"]:
        if m == "ultimo":
            url = "https://api.argentinadatos.com/v1/finanzas/fci/mercadoDinero/ultimo"
        else:
            # primer día hábil del mes según el calendario de precios
            first = next(d for d in dates if d.startswith(m))
            y, mo, da = first.split("-")
            url = f"https://api.argentinadatos.com/v1/finanzas/fci/mercadoDinero/{y}/{mo}/{da}"
        try:
            rows = get_json(url, tries=2)
        except Exception as e:  # noqa: BLE001
            notes.append(f"fondo {m}: {e}")
            continue
        if fund is None:
            for hint in FUND_NAME_HINTS:
                cand = [r for r in rows if hint.lower() in str(r.get("fondo", "")).lower() and r.get("vcp")]
                if cand:
                    fund = cand[0]["fondo"]
                    break
        row = next((r for r in rows if r.get("fondo") == fund and r.get("vcp")), None)
        if row:
            samples[str(row.get("fecha", ""))[:10] or m] = float(row["vcp"])
    if not fund or len(samples) < 6:
        return None, None
    pts = sorted((d, v) for d, v in samples.items() if re.match(r"\d{4}-\d{2}-\d{2}", d))
    out = []
    for d in dates:
        before = [p for p in pts if p[0] <= d]
        after = [p for p in pts if p[0] > d]
        if not before:
            out.append(None); continue
        if not after:
            out.append(round(before[-1][1], 4)); continue
        (d0, v0), (d1, v1) = before[-1], after[0]
        t0, t1, t = (dt.date.fromisoformat(x).toordinal() for x in (d0, d1, d))
        out.append(round(v0 * (v1 / v0) ** ((t - t0) / (t1 - t0)), 4))
    return fund, out


def main():
    closes = {k: yahoo_closes(t) for k, t in TICKERS.items()}
    if not closes.get(REFERENCE):
        print("No se pudo bajar el calendario de referencia; no se cambia nada.", file=sys.stderr)
        print("\n".join(notes), file=sys.stderr)
        return 1
    dates = sorted(closes[REFERENCE])
    series = {}
    for k, c in closes.items():
        if len(c) < len(dates) * 0.8:
            notes.append(f"{k}: pocos datos ({len(c)}), se omite")
            continue
        vals, last = [], None
        for d in dates:
            last = c.get(d, last)
            vals.append(last)
        first = next(v for v in vals if v is not None)
        series[k] = [v if v is not None else first for v in vals]

    infl, infl_src = inflation()
    fund, mm = money_market(dates)
    if mm:
        first = next(v for v in mm if v is not None)
        series["MM"] = [v if v is not None else first for v in mm]

    payload = {
        "asOf": dates[-1],
        "updated": dt.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
        "dates": dates,
        "series": series,
        "inflation": dict(sorted(infl.items())[-48:]),
        "fund": fund,
        "sources": {
            "precios": "BYMA, precios de cierre diarios en pesos (vía Yahoo Finance)",
            "inflacion": infl_src,
            "fondo": f"{fund}, valor de cuotaparte (CAFCI vía argentinadatos.com)" if fund else None,
        },
        "notas": notes[-20:],
    }
    os.makedirs(os.path.join(ROOT, "data"), exist_ok=True)
    with open(os.path.join(ROOT, "data", "mercado.json"), "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))

    html_path = os.path.join(ROOT, "index.html")
    html = open(html_path, encoding="utf-8").read()
    block = "/*MARKET_DATA_START*/const MARKET_DATA = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";/*MARKET_DATA_END*/"
    new_html, n = re.subn(r"/\*MARKET_DATA_START\*/.*?/\*MARKET_DATA_END\*/", lambda _: block, html, flags=re.S)
    if n != 1:
        print("No encontré el bloque MARKET_DATA en index.html", file=sys.stderr)
        return 1
    open(html_path, "w", encoding="utf-8").write(new_html)
    print(f"Datos al {payload['asOf']}: {len(dates)} días, activos {sorted(series)}, inflación {len(infl)} meses, fondo {fund}")
    for n_ in notes:
        print("nota:", n_)
    return 0


if __name__ == "__main__":
    sys.exit(main())

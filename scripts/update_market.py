#!/usr/bin/env python3
"""Baja precios reales de cierre y la inflación, y los guarda dentro de la app.

Fuentes:
  - Precios de cierre diarios en pesos (BYMA): data912.com; si falla, Yahoo Finance (yfinance o la API directa).
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
KIND = {"AL30": "bonds", "GD30": "bonds", "SPY": "cedears", "KO": "cedears", "AAPL": "cedears", "MELI": "cedears"}  # el resto: stocks
REFERENCE = "GGAL"   # sus fechas de operación definen el calendario
YEARS = 3
FUND_NAME_HINTS = ["Fima Premium", "Mercado Pago", "Balanz Money Market", "Galileo Ahorro", "Santander Super Ahorro"]

notes = []


def log(*a):
    print(*a, flush=True)


def get_json(url, tries=2):
    last = None
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(2)
    raise RuntimeError(f"{url}: {last}")


def parse_rows(rows):
    """Lista de dicts con fecha y cierre, en el formato que venga."""
    out = {}
    for r in rows if isinstance(rows, list) else []:
        if not isinstance(r, dict):
            continue
        d = r.get("date") or r.get("fecha") or r.get("d")
        c = r.get("c", r.get("close", r.get("cierre")))
        try:
            c = float(c)
        except (TypeError, ValueError):
            continue
        if d and math.isfinite(c) and c > 0:
            out[str(d)[:10]] = round(c, 4)
    return out


def data912_closes(code):
    kind = KIND.get(code, "stocks")
    url = f"https://data912.com/historical/{kind}/{code}"
    try:
        rows = get_json(url)
        out = parse_rows(rows)
        if not out:
            log(f"{code} data912: sin datos reconocibles; ejemplo: {str(rows)[:200]}")
        cut = (dt.date.today() - dt.timedelta(days=365 * YEARS)).isoformat()
        out = {d: v for d, v in out.items() if d >= cut}
        if out:
            log(f"{code} data912: {len(out)} cierres, último {max(out)} = {out[max(out)]}")
        return out
    except Exception as e:  # noqa: BLE001
        notes.append(f"{code} data912: {e}")
        log(f"{code} data912: falló ({e})")
        return {}


def yfinance_closes(ticker):
    try:
        import yfinance as yf  # se instala en el workflow
        hist = yf.Ticker(ticker).history(period=f"{YEARS}y", interval="1d", auto_adjust=False)
        out = {i.date().isoformat(): round(float(c), 4) for i, c in hist["Close"].items() if c == c and c > 0}
        if out:
            log(f"{ticker} yfinance: {len(out)} cierres")
        return out
    except Exception as e:  # noqa: BLE001
        notes.append(f"{ticker} yfinance: {e}")
        log(f"{ticker} yfinance: falló ({e})")
        return {}


def closes_for(code, ticker):
    for fn in (lambda: data912_closes(code), lambda: yfinance_closes(ticker), lambda: yahoo_closes(ticker)):
        out = fn()
        if len(out) > 100:
            return out
    return {}


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
                log(f"{ticker}: {len(out)} cierres")
                return out
        except Exception as e:  # noqa: BLE001
            notes.append(f"{ticker} en {host}: {e}")
            log(f"{ticker} en {host}: falló ({e})")
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
    fails = 0
    months = sorted({d[:7] for d in dates})
    for m in months + ["ultimo"]:
        if m == "ultimo":
            url = "https://api.argentinadatos.com/v1/finanzas/fci/mercadoDinero/ultimo"
        else:
            # primer día hábil del mes según el calendario de precios
            first = next(d for d in dates if d.startswith(m))
            y, mo, da = first.split("-")
            url = f"https://api.argentinadatos.com/v1/finanzas/fci/mercadoDinero/{y}/{mo}/{da}"
        if fails >= 4 and not samples:
            notes.append("fondo: la fuente no responde, se omite")
            break
        try:
            rows = get_json(url, tries=1)
        except Exception as e:  # noqa: BLE001
            notes.append(f"fondo {m}: {e}")
            log(f"fondo {m}: falló ({e})")
            fails += 1
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
            log(f"fondo {m}: {fund} = {row['vcp']}")
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


def clean(code, vals, dates):
    """Corrige errores puntuales y ajusta splits o cambios de ratio de CEDEAR hacia atrás."""
    v = list(vals)
    # 1) Saltos que se revierten en pocos días: error de carga, se mantiene el precio anterior.
    for i in range(1, len(v)):
        r = v[i] / v[i - 1] - 1
        if abs(r) > 0.4:
            for j in range(i + 1, min(i + 4, len(v))):
                if abs(v[j] / v[i - 1] - 1) < 0.15:
                    for k in range(i, j):
                        v[k] = v[i - 1]
                    notes.append(f"{code}: dato raro corregido el {dates[i]}")
                    break
    # 2) Saltos de más del 50% que no se revierten: split o cambio de ratio; se ajusta la historia previa.
    for i in range(1, len(v)):
        f = v[i] / v[i - 1]
        if f < 0.5 or f > 2:
            for k in range(i):
                v[k] = round(v[k] * f, 4)
            notes.append(f"{code}: ajuste por split o cambio de ratio el {dates[i]} (x{f:.4f})")
    return v


def main():
    infl, infl_src = inflation()
    log(f"inflación: {len(infl)} meses ({infl_src})")
    closes = {k: closes_for(k, t) for k, t in TICKERS.items()}
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
        series[k] = clean(k, [v if v is not None else first for v in vals], dates)

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
            "precios": "BYMA, precios de cierre diarios en pesos (vía data912.com / Yahoo Finance)",
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

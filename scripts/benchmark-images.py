"""Render the benchmark images in the site's own look, from the same data as /benchmarks.

    python3 scripts/benchmark-images.py   (from the repo root, after npm install; needs Node 24 and Python playwright)

Writes public/benchmarks/{t1,t2m,t3,podsumowanie}.png (2x, for Slack and posts) and public/og-benchmarks.png
(1200x630, the link preview of /benchmarks). Rerun after changing src/benchmarks.ts.
"""
import html
import json
import subprocess
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "benchmarks"
FONTS = ROOT / "node_modules" / "@fontsource-variable"
TARGETS = json.loads(subprocess.check_output(
    ["node", "-e", 'import("./src/benchmarks.ts").then((m) => console.log(JSON.stringify(m.TARGETS)))'], cwd=ROOT))
DATE = "27-28 października 2026"
URL = "security-audit.dev/benchmarks"
e = html.escape


def num(v, d):
    return f"{v:.{d}f}".replace(".", ",")


def mark(r, total):
    o = r["outcome"]
    if o["kind"] == "broken":
        return f'<span class="mark off">przerwany</span><span class="why">{e(o["why"].split(": ", 1)[-1])}</span>'
    cls = "ok" if o["found"] == total else "part" if o["found"] else "miss"
    sym = {"ok": "✓", "part": "◐", "miss": "✗"}[cls]
    return f'<span class="mark {cls}">{sym} {o["found"]}/{total}</span>'


def bar(v, top, text):
    if v is None:
        return '<span class="na">—</span>'
    return f'<span class="bar"><span class="track"><span class="fill" style="width:{max(2, v / top * 100):.1f}%"></span></span><span class="val">{text}</span></span>'


def rows(t, compact=False):
    top_m = max(r.get("minutes") or 0 for r in t["rows"])
    top_c = max(r.get("costUsd") or 0 for r in t["rows"])
    decoys = any("decoyFp" in r for r in t["rows"])
    head = "<span>Model</span><span>Wynik</span>" + ("<span>Pułapki</span>" if decoys else "") + \
        "<span>Czas, min</span><span>Koszt, USD</span>"
    out = [f'<div class="row head {"d" if decoys else ""}">{head}</div>']
    for r in t["rows"]:
        broken = r["outcome"]["kind"] == "broken"
        name = f'{r["agent"]} · {r["model"]}' if compact and r["agent"] == "Claude Code" else r["model"]
        model = f'<span class="model">{e(name)}</span>' + ("" if compact else f'<span class="agent">{e(r["agent"])}</span>')
        cells = [f"<div>{model}</div>", f"<div>{mark(r, t['total'])}</div>"]
        if decoys:
            cells.append(f'<div class="mono">{r["decoyFp"]}</div>' if "decoyFp" in r else '<span class="na">—</span>')
        m, c = r.get("minutes"), r.get("costUsd")
        cells.append(bar(m, top_m, num(m, 1) if m is not None else ""))
        cells.append(bar(c, top_c, ("~" if r.get("costApprox") else "") + num(c, 2) if c is not None else ""))
        out.append(f'<div class="row {"d" if decoys else ""} {"broken" if broken else ""}">{"".join(cells)}</div>')
    return "".join(out)


def brand():
    return f'<div class="top"><span class="brand"><b>/</b>security-audit</span><span class="meta">benchmark modeli · {DATE}</span></div>'


FOOT = (f'<div class="foot"><span>Ten sam skill i prompt. Ścisły scorer: liczy się plik i linie z poprawki (±2). '
        f'Jeden przebieg na model. ~ koszt wyliczony z tokenów i cennika dostawcy.</span><b>{URL}</b></div>')


def target_card(t):
    return (f'<section class="card" id="{t["id"]}">{brand()}<h1>{e(t["name"])}</h1><p class="what">{e(t["what"])}</p>'
            f'<p class="take">{e(t["takeaway"])}</p><div class="table">{rows(t)}</div>{FOOT}</section>')


def summary_card():
    parts = "".join(f'<div class="sum"><h2><span class="tid">{e(t["name"].split(":")[0])}</span>{e(t["name"].split(": ", 1)[1])}</h2>'
                    f'<div class="table">{rows(t, compact=True)}</div></div>' for t in TARGETS)
    return (f'<section class="card" id="podsumowanie">{brand()}<h1>Ten sam skill, różne modele</h1>'
            f'<p class="what">/security-audit w&nbsp;Claude Code i&nbsp;w&nbsp;OpenCode z&nbsp;pięcioma modelami, '
            f'na prawdziwych advisory i&nbsp;na aplikacji testowej.</p>{parts}{FOOT}</section>')


def og_card():
    tiles = "".join(f'<div class="tile"><span class="tid">{e(t["name"].split(":")[0])}</span>'
                    f'<b>{e(t["name"].split(": ", 1)[1])}</b><span>{e(t["glance"])}</span></div>' for t in TARGETS)
    return (f'<section class="og" id="og">{brand()}<h1>Benchmarki modeli</h1>'
            f'<p class="what">Ten sam skill /security-audit: Claude Code i&nbsp;5 modeli w&nbsp;OpenCode. '
            f'Wynik, czas i&nbsp;koszt.</p><div class="tiles">{tiles}</div><b class="url">{URL}</b></section>')


CSS = f"""
@font-face {{ font-family: Archivo; src: url("{(FONTS / 'archivo/files/archivo-latin-ext-wdth-normal.woff2').as_uri()}"); font-weight: 100 900; font-stretch: 62% 125%; }}
@font-face {{ font-family: Archivo; src: url("{(FONTS / 'archivo/files/archivo-latin-wdth-normal.woff2').as_uri()}"); font-weight: 100 900; font-stretch: 62% 125%; }}
@font-face {{ font-family: Mono; src: url("{(FONTS / 'jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2').as_uri()}"); font-weight: 100 800; }}
:root {{ --paper:#f5f6f9; --surface:#fff; --ink:#0d1321; --ink-2:#485266; --ink-3:#5f6a7e; --rule:#dce0e8;
  --accent:#2438e6; --accent-strong:#1727b4; --accent-tint:#eceefd; --safe:#1f7a4d; --crit:#b3261e; }}
* {{ box-sizing: border-box; margin: 0; }}
body {{ background: #888; font: 400 17px/1.5 Archivo, sans-serif; color: var(--ink); font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; }}
.card, .og {{ width: 1200px; background: var(--paper); padding: 48px 56px 40px; }}
.top {{ display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 18px; border-bottom: 1px solid var(--rule); }}
.brand {{ font: 600 19px Mono, monospace; }} .brand b {{ color: var(--accent); }}
.meta {{ color: var(--ink-3); font-size: 15px; }}
h1 {{ margin-top: 30px; font-size: 44px; font-weight: 700; font-stretch: 112%; letter-spacing: -0.02em; line-height: 1.1; }}
.what {{ margin-top: 12px; color: var(--ink-2); font-size: 19px; max-width: 64ch; }}
.take {{ margin-top: 22px; padding-left: 16px; border-left: 3px solid var(--accent); font-size: 21px; line-height: 1.45; max-width: 62ch; }}
.table {{ margin-top: 30px; background: var(--surface); border-radius: 14px; box-shadow: 0 0 0 1px var(--rule); padding: 6px 24px; }}
.row {{ display: grid; grid-template-columns: 300px 130px 1fr 1fr; gap: 24px; align-items: center; padding: 14px 0; border-top: 1px solid var(--rule); }}
.row.d {{ grid-template-columns: 300px 120px 80px 1fr 1fr; }}
.row.head {{ border-top: 0; color: var(--ink-3); font-size: 14px; padding: 12px 0 8px; }}
.model {{ display: block; font-weight: 650; font-size: 18px; line-height: 1.3; }}
.agent {{ display: block; color: var(--ink-3); font-size: 14px; }}
.broken .model {{ color: var(--ink-2); }}
.mark {{ font: 600 18px Mono, monospace; white-space: nowrap; }}
.ok {{ color: var(--safe); }} .part {{ color: var(--ink); }} .miss {{ color: var(--crit); }}
.off {{ color: var(--ink-3); font: 500 16px Archivo, sans-serif; }}
.why {{ display: block; color: var(--ink-3); font-size: 13px; line-height: 1.3; }}
.mono {{ font: 500 17px Mono, monospace; color: var(--ink-2); }}
.bar {{ display: grid; grid-template-columns: minmax(0, 1fr) 76px; gap: 10px; align-items: center; }}
.fill {{ display: block; height: 14px; background: var(--accent); border-radius: 0 4px 4px 0; }}
.val {{ font: 500 17px Mono, monospace; white-space: nowrap; }}
.na {{ color: var(--ink-3); }}
.foot {{ margin-top: 28px; display: flex; justify-content: space-between; gap: 32px; align-items: end; color: var(--ink-3); font-size: 14px; }}
.foot span {{ max-width: 70ch; }} .foot b {{ color: var(--accent-strong); font: 600 16px Mono, monospace; white-space: nowrap; }}
.sum {{ margin-top: 34px; }}
.sum h2 {{ font-size: 24px; font-weight: 700; font-stretch: 108%; letter-spacing: -0.01em; }}
.sum .table {{ margin-top: 14px; }} .sum .row {{ padding: 10px 0; }}
.tid {{ font: 600 0.8em Mono, monospace; color: var(--accent-strong); margin-right: 12px; }}
.og {{ height: 630px; display: flex; flex-direction: column; }}
.og h1 {{ font-size: 76px; margin-top: 44px; }}
.og .what {{ font-size: 24px; }}
.tiles {{ margin-top: auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }}
.tile {{ background: var(--surface); border-radius: 14px; box-shadow: 0 0 0 1px var(--rule); padding: 18px 20px; display: grid; gap: 6px; align-content: start; }}
.tile b {{ font-size: 19px; line-height: 1.25; }} .tile span:last-child {{ color: var(--ink-2); font-size: 16px; line-height: 1.35; }}
.tile .tid {{ font-size: 17px; }}
.url {{ margin-top: 22px; color: var(--accent-strong); font: 600 18px Mono, monospace; }}
"""

page = (f"<!doctype html><html lang=pl><meta charset=utf-8><style>{CSS}</style><body>"
        + "".join(target_card(t) for t in TARGETS) + summary_card() + og_card() + "</body></html>")
OUT.mkdir(parents=True, exist_ok=True)
src = OUT.parent.parent / "node_modules" / ".benchmark-images.html"  # file:// so the local fonts load
src.write_text(page, encoding="utf-8")

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    for scale, ids in ((2, [t["id"] for t in TARGETS] + ["podsumowanie"]), (1, ["og"])):
        pg = b.new_page(viewport={"width": 1300, "height": 900}, device_scale_factor=scale)
        pg.goto(src.as_uri())
        pg.evaluate("document.fonts.ready")
        if scale == 1:  # the preview alone at the top, so its box is exactly 1200x630
            pg.evaluate("document.querySelectorAll('.card').forEach((c) => c.remove())")
        for i in ids:
            dest = ROOT / "public" / "og-benchmarks.png" if i == "og" else OUT / f"{i}.png"
            pg.locator(f"#{i}").screenshot(path=str(dest))
            print(dest.relative_to(ROOT))
    b.close()

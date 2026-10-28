"""Render the "how the skill works" diagram (16:9, for videos and posts) in the site's look.

    python3 scripts/skill-diagram.py   (from the repo root, after npm install; needs Python playwright)

Writes public/jak-dziala.png (3840x2160). Phases follow Phases.astro, the 12 areas and their checkpoint counts
follow Coverage.astro (the skill's audit-checklist.md): change them there first, then here.
"""
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "node_modules" / "@fontsource-variable"

PHASES = [
    ("Wstępny skan", "bez modelu: skanery i skrypty", ["punkty wejścia i ranking ryzyka", "znane CVE w zależnościach", "sekrety w całej historii gita"], "prepass.md"),
    ("Mapa aplikacji", "1 agent", ["stack i punkty wejścia", "gdzie naprawdę są sprawdzane uprawnienia"], "recon.md"),
    ("Audyt po obszarach", "do 5 audytorów równolegle", ["12 obszarów, 90 punktów kontrolnych", "od najbardziej ryzykownych miejsc"], "findings/"),
    ("Niezależna weryfikacja", "osobny agent", ["czyta kod drugi raz, odrzuca fałszywe alarmy", "łączy znaleziska w łańcuchy", "test regresji przy poważnych"], "zweryfikowane + tests/"),
    ("Raport", "z oceną testów projektu", ["do naprawy, w kolejności", "bezpieczne, z dowodem", "nie sprawdzone"], "report.html"),
]
AREAS = [
    ("Uwierzytelnianie i autoryzacja", 16), ("Wstrzyknięcia (SQL, XSS, SSTI, polecenia)", 16), ("Kryptografia i tokeny", 12),
    ("Upload plików", 8), ("Logika biznesowa", 7), ("Zależności", 6), ("Współbieżność i wyścigi", 6),
    ("Ekspozycja danych i sekrety", 5), ("Nagłówki, CORS, transport", 4), ("Limity i nadużycia", 4),
    ("Logowanie i monitoring", 4), ("Zgodność dokumentacji z kodem", 2),
]
STRENGTHS = [
    ("Dowody, nie opinie", "każde znalezisko ma plik:linię, fragment kodu i to, kto może zrobić coś, czego nie powinien"),
    ("Druga para oczu", "osobny agent sprawdza każde znalezisko i odrzuca to, czego nie potwierdzi w kodzie"),
    ("Test, który dziś nie przechodzi", "przy poważnych błędach dowód jest testem, a nie opisem"),
    ("Mówi, czego nie sprawdził", "„nie znaleziono” nigdy nie udaje „sprawdzono”"),
    ("Mierzony", "aplikacje z zasianymi błędami i prawdziwe advisory: 26/26 na Ledgerly"),
]

# Parallel Mode: the auditors split the 12 areas by domain and run at the same time.
LANES = '<div class="lanes">' + "".join(f"<span>{x}</span>" for x in ["auth", "wstrzyknięcia", "infra", "…"]) + "</div>"
phases = "".join(
    f'<div class="ph{" key" if i == 3 else ""}"><span class="n">{i + 1:02d}</span><h3>{name}</h3><p class="who">{who}</p>'
    f'<ul>{"".join(f"<li>{x}</li>" for x in items)}</ul>{LANES if i == 2 else ""}<code>{out}</code></div>'
    + ('<span class="arrow" aria-hidden="true"></span>' if i < len(PHASES) - 1 else "")
    for i, (name, who, items, out) in enumerate(PHASES))
areas = "".join(f'<li><span class="an">{i + 1:02d}</span><span class="at">{name}</span><span class="ac">{n}</span></li>'
                for i, (name, n) in enumerate(AREAS))
strengths = "".join(f"<li><b>{t}</b><span>{d}</span></li>" for t, d in STRENGTHS)

CSS = f"""
@font-face {{ font-family: Archivo; src: url("{(FONTS / 'archivo/files/archivo-latin-ext-wdth-normal.woff2').as_uri()}"); font-weight: 100 900; font-stretch: 62% 125%; }}
@font-face {{ font-family: Archivo; src: url("{(FONTS / 'archivo/files/archivo-latin-wdth-normal.woff2').as_uri()}"); font-weight: 100 900; font-stretch: 62% 125%; }}
@font-face {{ font-family: Mono; src: url("{(FONTS / 'jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2').as_uri()}"); font-weight: 100 800; }}
:root {{ --paper:#f5f6f9; --surface:#fff; --ink:#0d1321; --ink-2:#485266; --ink-3:#5f6a7e; --rule:#dce0e8;
  --accent:#2438e6; --accent-strong:#1727b4; --accent-tint:#eceefd; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{ font: 400 18px/1.4 Archivo, sans-serif; color: var(--ink); -webkit-font-smoothing: antialiased; }}
#d {{ width: 1920px; height: 1080px; background: var(--paper); padding: 56px 72px 48px; display: grid;
  grid-template-rows: auto auto 1fr auto; gap: 34px; position: relative; overflow: hidden; }}
#d::before {{ content: ""; position: absolute; right: -180px; top: -260px; width: 720px; height: 720px; border-radius: 50%;
  border: 120px solid var(--accent-tint); z-index: 0; }}
#d > * {{ position: relative; z-index: 1; }}
.top {{ display: flex; justify-content: space-between; align-items: end; position: relative; }}
.brand {{ font: 600 22px Mono, monospace; }} .brand b {{ color: var(--accent); }}
h1 {{ font-size: 66px; font-weight: 750; font-stretch: 118%; letter-spacing: -0.03em; line-height: 1; margin-top: 18px; }}
.sub {{ margin-top: 14px; font-size: 24px; color: var(--ink-2); }}
.tag {{ font: 500 17px Mono, monospace; color: var(--accent-strong); background: var(--accent-tint); padding: 10px 16px; border-radius: 999px; }}

.flow {{ display: grid; grid-template-columns: 1fr 34px 1fr 34px 1.15fr 34px 1.15fr 34px 1fr; align-items: stretch; position: relative; }}
.ph {{ background: var(--surface); border-radius: 16px; box-shadow: 0 0 0 1.5px var(--rule); padding: 20px 20px 18px; display: flex; flex-direction: column; gap: 6px; }}
.ph .n {{ font: 600 15px Mono, monospace; color: var(--accent-strong); }}
.ph h3 {{ font-size: 23px; font-weight: 700; font-stretch: 108%; letter-spacing: -0.01em; line-height: 1.15; }}
.ph .who {{ font-size: 15px; color: var(--ink-3); }}
.ph ul {{ list-style: none; margin-top: 8px; display: grid; gap: 5px; font-size: 16px; color: var(--ink-2); line-height: 1.3; }}
.ph li::before {{ content: "— "; color: var(--ink-3); }}
.ph code {{ margin-top: auto; padding-top: 12px; font: 500 14px Mono, monospace; color: var(--ink-3); }}
.ph.key {{ background: var(--accent); box-shadow: none; color: #fff; }}
.ph.key .n, .ph.key .who, .ph.key ul, .ph.key li::before, .ph.key code {{ color: #dfe3ff; }}
.lanes {{ margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px; }}
.lanes span {{ font: 500 13.5px Mono, monospace; color: var(--accent-strong); background: var(--accent-tint); border-radius: 6px; padding: 4px 10px; }}
.arrow {{ align-self: center; height: 3px; background: var(--ink); position: relative; margin: 0 4px; }}
.arrow::after {{ content: ""; position: absolute; right: -2px; top: -6px; border: 7.5px solid transparent; border-left: 11px solid var(--ink); border-right: 0; }}

.low {{ display: grid; grid-template-columns: 1.55fr 1fr; gap: 28px; min-height: 0; }}
.areas {{ background: var(--surface); border-radius: 16px; box-shadow: 0 0 0 1.5px var(--rule); padding: 24px 28px; display: flex; flex-direction: column; }}
.low h2 {{ font-size: 25px; font-weight: 700; font-stretch: 108%; display: flex; justify-content: space-between; align-items: baseline; }}
.low h2 small {{ font: 500 15px Mono, monospace; color: var(--ink-3); }}
.areas ol {{ list-style: none; margin-top: 16px; flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); align-content: space-between; gap: 10px 18px; }}
.areas li {{ display: grid; grid-template-columns: 34px 1fr auto; align-items: baseline; gap: 8px; padding: 9px 0; border-top: 1px solid var(--rule); font-size: 18px; line-height: 1.25; }}
.an {{ font: 600 14px Mono, monospace; color: var(--accent-strong); }}
.ac {{ font: 500 14px Mono, monospace; color: var(--ink-3); }}
.strong {{ background: var(--ink); color: #fff; border-radius: 16px; padding: 24px 28px; }}
.strong h2 small {{ color: #9aa3b5; }}
.strong ul {{ list-style: none; margin-top: 14px; display: grid; gap: 11px; }}
.strong li {{ display: grid; gap: 2px; padding-left: 18px; position: relative; }}
.strong li::before {{ content: ""; position: absolute; left: 0; top: 9px; width: 8px; height: 8px; background: var(--accent); border-radius: 2px; }}
.strong b {{ font-size: 19px; font-weight: 650; }}
.strong span {{ font-size: 15.5px; color: #b9c0cf; line-height: 1.3; }}

.foot {{ display: flex; justify-content: space-between; align-items: center; color: var(--ink-3); font-size: 17px; }}
.foot b {{ font: 600 22px Mono, monospace; color: var(--accent-strong); }}
"""

page = f"""<!doctype html><html lang=pl><meta charset=utf-8><style>{CSS}</style><body><section id="d">
<div class="top"><div><span class="brand"><b>/</b>security-audit</span><h1>Jak działa audyt</h1>
<p class="sub">Skill do Claude Code i&nbsp;OpenCode. Jedno polecenie, pięć faz, każda zostawia pliki dla następnej.</p></div>
<span class="tag">open source · MIT</span></div>
<div class="flow">{phases}</div>
<div class="low">
<div class="areas"><h2>12 obszarów <small>liczba punktów kontrolnych, razem 90</small></h2><ol>{areas}</ol></div>
<div class="strong"><h2>Mocne strony</h2><ul>{strengths}</ul></div>
</div>
<div class="foot"><span>Każdy punkt kończy się znaleziskiem, obszarem bezpiecznym z&nbsp;dowodem albo wpisem „nie sprawdzone”.</span><b>security-audit.dev</b></div>
</section></body></html>"""

src = ROOT / "node_modules" / ".skill-diagram.html"  # file:// so the local fonts load
src.write_text(page, encoding="utf-8")
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg = b.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=2)
    pg.goto(src.as_uri())
    pg.evaluate("document.fonts.ready")
    over = pg.evaluate("""[...document.querySelectorAll('#d *')].some((el) => { const r = el.getBoundingClientRect(); return r.bottom > 1080.5 || r.right > 1920.5; })
      || document.querySelector('.low').getBoundingClientRect().bottom > document.querySelector('.foot').getBoundingClientRect().top
      || [...document.querySelectorAll('.areas li')].some((li) => li.getBoundingClientRect().bottom > document.querySelector('.areas').getBoundingClientRect().bottom)""")
    pg.locator("#d").screenshot(path=str(ROOT / "public" / "jak-dziala.png"))
    b.close()
print("public/jak-dziala.png", "OVERFLOW" if over else "fits")

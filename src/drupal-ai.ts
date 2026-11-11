// Drupal AI 1.5.1 benchmark: the same models with and without the skill on eight published advisories.
// Data in src/data/drupal-ai.json comes from the benchmark's results.jsonl; findings outside the key are counts only.
import DATA from "./data/drupal-ai.json";

export type Run = (typeof DATA.runs)[number];

export const CONTENDERS = [
  { id: "plain-opus", name: "Claude Opus 5.5", setup: "sam model, prompt „sprawdź bezpieczeństwo”" },
  { id: "plain-fable", name: "Claude Fable 5.2", setup: "sam model, prompt „sprawdź bezpieczeństwo”" },
  { id: "skill-opus", name: "Claude Opus 5.5", setup: "skill /security-audit" },
  { id: "skill-fable", name: "Claude Fable 5.2", setup: "skill /security-audit" },
  { id: "skill-mix", name: "Opus 5.5 + Fable 5.2", setup: "skill: audytorzy Opus, weryfikator Fable" },
] as const;

// [number, CVE, what it is, reachable in the tarball, drupal.org risk level]
export const ADVISORIES = [
  ["266", "CVE-2026-118545", "tooltip wstawia atrybut data jako HTML (DOM XSS)", true, "umiarkowanie krytyczne"],
  ["267", "CVE-2026-118546", "szerokość i wysokość bloku chatbota trafiają do strony bez escapowania (XSS)", true, "umiarkowanie krytyczne"],
  ["268", "CVE-2026-118548", "filtr hostów przepuszcza adresy /\\host i \\\\host", true, "umiarkowanie krytyczne"],
  ["269", "CVE-2026-118549", "filtr linków Markdown oparty na regexie da się obejść (XSS bez uprawnień)", true, "krytyczne"],
  ["270", "CVE-2026-118550", "wyniki AI Search trafiają do wspólnego cache mimo sprawdzania dostępu", false, "umiarkowanie krytyczne"],
  ["271", "CVE-2026-118551", "speech-to-text zapisuje każde nagranie do jednego wspólnego pliku", true, "mniej krytyczne"],
  ["272", "CVE-2026-118552", "filtr hostów zostawia atrybuty hx-* i data-hx-* (XSS przez HTMX)", true, "umiarkowanie krytyczne"],
  ["273", "CVE-2026-118553", "automatory zapisują tekst w formacie, którego zapisujący nie może używać", true, "umiarkowanie krytyczne"],
] as const;

export const SA = (n: string) => `https://www.drupal.org/sa-contrib-2026-${n}`;
export const RELEASE = (v: string) => `https://www.drupal.org/project/ai/releases/${v}`;
export const README = "https://github.com/bartek-filipiuk/security-audit-skill/tree/main/benchmark/real";
export const TOTAL = ADVISORIES.length;

export const RUNS = DATA.runs;
export const target = (id: string) => RUNS.find((r) => r.contender === id && r.version === "1.5.1")!;
export const hit = (id: string, n: string) => DATA.hits.some((h) => h.contender === id && h.advisory === n && h.found === 1);
const onTarget = (setup: "skill" | "plain") => RUNS.filter((r) => r.setup === setup && r.version === "1.5.1");
export const best = (setup: "skill" | "plain") => Math.max(...onTarget(setup).map((r) => r.found));
export const worst = (setup: "skill" | "plain") => Math.min(...onTarget(setup).map((r) => r.found));
const avg = (setup: "skill" | "plain", k: "cost_usd" | "minutes") => onTarget(setup).reduce((s, r) => s + r[k], 0) / onTarget(setup).length;
// How many times more the skill costs than the bare model, on average over the target runs.
export const ratio = (k: "cost_usd" | "minutes") => Math.round(avg("skill", k) / avg("plain", k));
export const controlFp = RUNS.filter((r) => r.version === "1.5.2").reduce((s, r) => s + r.decoy_fp, 0);
export const controls = RUNS.filter((r) => r.version === "1.5.2");
export const nobody = ADVISORIES.filter(([n]) => !CONTENDERS.some((c) => hit(c.id, n)));

export const pl = (n: number, d = 0) => n.toLocaleString("pl-PL", { minimumFractionDigits: d, maximumFractionDigits: d });
export const usd = (n: number) => `${pl(n, 2)} USD`;

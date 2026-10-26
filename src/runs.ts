// Public log of benchmark runs on real modules (R30 and later).
// Publication policy:
// - Only results matched against published, already fixed advisories are shown by name.
// - Verified findings that match no advisory are published as a count only ("w przeglądzie"):
//   no file, line, description or class. They go to the maintainers privately first.
// - Nothing about current or live module versions beyond what is already public: a control run on a
//   fixed release shows only the advisory-matched decoy count and the unmatched count.
// Numbers come from the scorer output (benchmark/score.mjs) and must match RealWorld.astro and
// benchmark/real/README.md in the skill repo.
export type Found = "found" | "found-secondary" | "dropped" | "missed";
export type Advisory = { id: string; url: string; found: Found };
export type Run = {
  date: string;
  module: string;
  moduleUrl: string;
  ecosystem: string;
  version: string;
  role: "target" | "control";
  label: string;
  skillSha: string;
  advisories: Advisory[];
  total: number;
  decoyFp: number;
  unmatched: number;
  costUsd: number;
  minutes: number;
  note?: string;
};

const SA = (n: string) => ({ id: `SA-CONTRIB-2026-${n}`, url: `https://www.drupal.org/sa-contrib-2026-${n}` });
// Advisories scored on miniorange_saml 3.1.3, in answer-key order.
const MO_KEYS = ["031", "145", "141", "143", "142", "148", "147", "150", "151", "144", "149"] as const;
const mo = (status: Partial<Record<(typeof MO_KEYS)[number], Found>>): Advisory[] =>
  MO_KEYS.map((n) => ({ ...SA(n), found: status[n] ?? "missed" }));

const MO = { module: "miniorange_saml", moduleUrl: "https://www.drupal.org/project/miniorange_saml", ecosystem: "drupal" };

export const RUNS: Run[] = [
  {
    ...MO, date: "2026-10-26", version: "3.1.3", role: "target", label: "powtórka 2", skillSha: "1cee60d",
    advisories: mo({ "031": "found", "145": "found", "141": "found", "143": "found", "142": "found" }),
    total: 11, decoyFp: 0, unmatched: 0, costUsd: 2.01, minutes: 24.9,
    note: "Pierwszy raz znalezione SA-CONTRIB-2026-145 (algorytm podpisu z odpowiedzi SAML). Za to tym razem bez SSRF ze 151.",
  },
  {
    ...MO, date: "2026-10-25", version: "3.1.3", role: "target", label: "powtórka 1", skillSha: "077bec2",
    advisories: mo({ "031": "found", "141": "found", "143": "found", "142": "found", "151": "found" }),
    total: 11, decoyFp: 0, unmatched: 2, costUsd: 2.34, minutes: 6.2,
    note: "SA-CONTRIB-2026-141 tym razem przeszło weryfikację. XSS ze 147 nie wróciło.",
  },
  {
    ...MO, date: "2026-10-19", version: "3.2.0", role: "control", label: "R30, przebieg B", skillSha: "7f956ef",
    advisories: [],
    total: 0, decoyFp: 1, unmatched: 7, costUsd: 3.15, minutes: 8,
    note: "Żadne naprawione advisory nie wróciło. Jedno trafienie w pułapkę jest w przeglądzie.",
  },
  {
    ...MO, date: "2026-10-19", version: "3.1.3", role: "target", label: "R30, przebieg A", skillSha: "7f956ef",
    advisories: mo({ "031": "found", "143": "found", "142": "found", "147": "found-secondary", "141": "dropped", "148": "dropped" }),
    total: 11, decoyFp: 0, unmatched: 1, costUsd: 2.37, minutes: 6,
    note: "SA-CONTRIB-2026-031 najwyżej w raporcie.",
  },
];

// Counted toward recall: found and found through a secondary location.
export const recall = (r: Run) => r.advisories.filter((a) => a.found === "found" || a.found === "found-secondary").length;

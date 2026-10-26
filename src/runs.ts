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

const GH = (id: string, repo?: string): Omit<Advisory, "found"> => ({
  id,
  url: repo ? `https://github.com/${repo}/security/advisories/${id}` : `https://github.com/advisories/${id}`,
});
const adv = (list: Omit<Advisory, "found">[], found: string[]): Advisory[] =>
  list.map((a) => ({ ...a, found: found.includes(a.id) ? "found" : "missed" }));

// goshs v2.1.4: eight advisories fixed in v2.1.5, in answer-key order.
const GOSHS_KEYS = [
  GH("GHSA-6m5c-fv2q-jrj2", "goshs-labs/goshs"), GH("GHSA-966r-mw4j-rv64", "goshs-labs/goshs"),
  GH("GHSA-6wwv-mx7w-35jx", "goshs-labs/goshs"), GH("GHSA-rc9g-fmpg-c6pp", "goshs-labs/goshs"),
  GH("GHSA-wg2q-39h6-66x9"), GH("GHSA-964w-f6gj-5236"),
  GH("GHSA-4wh5-87mw-whxf", "goshs-labs/goshs"), GH("GHSA-mqvv-v9g7-4h3j", "goshs-labs/goshs"),
];
// fast-jwt 6.2.4: three High advisories fixed in 6.3.1.
const FASTJWT_KEYS = [GH("GHSA-5hjw-83fp-phq9"), GH("GHSA-g3jj-5cmm-3hxx"), GH("GHSA-8wpc-h4q6-8fxv")];
const GOSHS = { module: "goshs", moduleUrl: "https://github.com/goshs-labs/goshs", ecosystem: "go" };
const FASTJWT = { module: "fast-jwt", moduleUrl: "https://www.npmjs.com/package/fast-jwt", ecosystem: "npm" };

export const RUNS: Run[] = [
  {
    ...FASTJWT, date: "2026-10-26", version: "6.3.1", role: "control", label: "R31", skillSha: "eefbb83",
    advisories: [],
    total: 0, decoyFp: 0, unmatched: 2, costUsd: 1.58, minutes: 4.8,
    note: "Żadne z trzech naprawionych advisory nie wróciło.",
  },
  {
    ...FASTJWT, date: "2026-10-26", version: "6.2.4", role: "target", label: "R31", skillSha: "eefbb83",
    advisories: adv(FASTJWT_KEYS, ["GHSA-5hjw-83fp-phq9"]),
    total: 3, decoyFp: 0, unmatched: 1, costUsd: 1.5, minutes: 4.3,
    note: "Znalezione: tablica jako payload omija walidację claimów. Pominięte oba błędy wyboru klucza (JWK jako sekret HMAC, pusty klucz z listą algorytmów).",
  },
  {
    ...GOSHS, date: "2026-10-26", version: "v2.1.4", role: "target", label: "R31", skillSha: "eefbb83",
    advisories: adv(GOSHS_KEYS, ["GHSA-6m5c-fv2q-jrj2", "GHSA-966r-mw4j-rv64", "GHSA-6wwv-mx7w-35jx", "GHSA-rc9g-fmpg-c6pp", "GHSA-wg2q-39h6-66x9", "GHSA-964w-f6gj-5236"]),
    total: 8, decoyFp: 0, unmatched: 38, costUsd: 16.7, minutes: 32.4,
    note: "Oba Critical znalezione, obejście basic auth jako najważniejsze znalezisko raportu. Duży serwer plików w Go (~18 tys. linii, HTTP, WebDAV, FTP, SFTP, SMB), stąd koszt. Pierwotnie scorer pokazał 0/8, bo nie rozpoznawał plików .go; poprawione w skillu (#33), wynik po ponownym przeliczeniu tego samego raportu.",
  },
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

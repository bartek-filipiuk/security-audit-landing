// Model comparison on the same skill (audit-model-bench, 2026-10-27 and 2026-10-28).
// Numbers come from the bench scorer (latest line per run in results/results.jsonl); one run per
// model and target. Same publication policy as runs.ts: advisories by name only when published and
// fixed, every other verified finding as a count only.
export type Outcome =
  | { kind: "scored"; found: number }
  | { kind: "broken"; why: string };
export type Row = {
  model: string;
  agent: string;
  outcome: Outcome;
  decoyFp?: number; // undefined: the key of this target has no decoys
  unmatched?: number;
  testProofs?: number;
  verified?: number;
  minutes?: number;
  costUsd?: number;
  costApprox?: boolean; // computed from recorded tokens and the provider price list, not billed per run
  note?: string;
};
export type Target = {
  id: string;
  name: string;
  what: string;
  key: string;
  total: number;
  links: { label: string; url: string }[];
  takeaway: string;
  glance: string;
  rows: Row[];
  notes: string[];
};

const OC = "OpenCode 2.1.4";
const CX = "Codex CLI 0.155.1";

export const TARGETS: Target[] = [
  {
    id: "t1",
    name: "T1: zdalne wykonanie kodu w module Drupala",
    what: "ffmpeg_image_toolkit 1.0.2, moduł Drupala (PHP, 19 plików). Wstrzyknięcie polecenia systemowego przez ścieżkę pliku, naprawione w 1.0.3.",
    key: "1 advisory. Klucz to linie zmienione przez poprawkę w src/Ffmpeg.php. Bez pułapek.",
    total: 1,
    links: [{ label: "SA-CONTRIB-2026-220", url: "https://www.drupal.org/sa-contrib-2026-220" }],
    glance: "4 z 6 konfiguracji wskazało linie poprawki",
    takeaway: "Cztery z sześciu konfiguracji wskazały właściwe linie. Kimi i Grok opisały wstrzyknięcie, ale przypięły je do sygnatury metody (linia 20), a poprawka jest w liniach 25-30, więc ścisły scorer liczy to jako nietrafione.",
    rows: [
      { model: "Opus 5.5", agent: "Claude Code", outcome: { kind: "scored", found: 1 }, unmatched: 1, minutes: 3.3, costUsd: 1.35 },
      { model: "Gemma 4 31B", agent: `${OC}, OpenRouter`, outcome: { kind: "scored", found: 1 }, unmatched: 1, minutes: 6.7, costUsd: 0.05 },
      { model: "DeepSeek V4 Pro", agent: `${OC}, API DeepSeek`, outcome: { kind: "scored", found: 1 }, unmatched: 0, minutes: 5.7, costUsd: 0.2 },
      { model: "Hinoki Offensive One", agent: `${OC}, hinoki.security`, outcome: { kind: "scored", found: 1 }, unmatched: 1, minutes: 25.6, costUsd: 1.27, costApprox: true },
      { model: "Kimi K3.1 Pro", agent: `${OC}, OpenRouter`, outcome: { kind: "scored", found: 0 }, unmatched: 2, minutes: 13.2, costUsd: 0.94 },
      { model: "Grok 4.7", agent: `${OC}, OpenRouter`, outcome: { kind: "scored", found: 0 }, unmatched: 1, minutes: 8.0, costUsd: 1.31 },
    ],
    notes: [
      "Hinoki był najdokładniejszy w przebiegu (217 wywołań narzędzi, 3 pliki testów), ale też najwolniejszy.",
      "Hinoki płaci za ten sam typ pracy więcej niż DeepSeek, bo czyta z cache kilka razy więcej tokenów: na T1 9,7 mln wobec 2,9 mln.",
    ],
  },
  {
    id: "t2m",
    name: "T2m: LiteLLM, serwer MCP i autoryzacja",
    what: "LiteLLM 1.83.3 (Python), zakres litellm/proxy/_experimental/mcp_server i litellm/proxy/auth. Dwa advisory naprawione w 1.83.7.",
    key: "2 advisory. Klucz to linie z poprawek. Bez pułapek.",
    total: 2,
    links: [
      { label: "GHSA-v4p8-mg3p-g94g", url: "https://github.com/BerriAI/litellm/security/advisories/GHSA-v4p8-mg3p-g94g" },
      { label: "GHSA-r75f-5x8p-qvmc", url: "https://github.com/BerriAI/litellm/security/advisories/GHSA-r75f-5x8p-qvmc" },
    ],
    glance: "1 z 2 advisory: DeepSeek i Hinoki, drugie poza zakresem",
    takeaway: "GHSA-v4p8 znalazły DeepSeek i Hinoki. GHSA-r75f nie znalazł nikt: miejsce, które naprawia poprawka (proxy/utils.py), leży poza zakresem tego przebiegu. Hinoki zgłosił najwięcej znalezisk spoza klucza pracował ponad cztery razy dłużej niż DeepSeek i kosztował prawie dziesięć razy więcej.",
    rows: [
      { model: "DeepSeek V4 Pro", agent: `${OC}, API DeepSeek`, outcome: { kind: "scored", found: 1 }, unmatched: 6, minutes: 24.9, costUsd: 1.04 },
      { model: "Hinoki Offensive One", agent: `${OC}, hinoki.security`, outcome: { kind: "scored", found: 1 }, unmatched: 34, testProofs: 5, verified: 37, minutes: 105.5, costUsd: 10.29, costApprox: true },
      { model: "Kimi K3.1 Pro", agent: `${OC}, OpenRouter`, outcome: { kind: "scored", found: 0 }, unmatched: 9, minutes: 29.7, costUsd: 4.87 },
      { model: "Grok 4.7", agent: `${OC}, OpenRouter`, outcome: { kind: "broken", why: "przerwany przed raportem: skończyły się kredyty OpenRouter" }, costUsd: 24.13 },
    ],
    notes: [
      "Kimi opisał GHSA-v4p8, ale wskazał wspólną funkcję pomocniczą poza liniami poprawki, więc ścisły scorer liczy to jako nietrafione.",
      "Grok zużył 2,3 raza więcej tokenów niż DeepSeek, a odczyt z cache kosztuje u niego około 6 razy więcej. Bez raportu przebieg się nie liczy.",
      "Tego celu nie puszczaliśmy w Claude Code.",
    ],
  },
  {
    id: "t3",
    name: "T3: Ledgerly, pełny audyt aplikacji",
    what: "Ledgerly, nasza aplikacja testowa (Next.js, TypeScript) z 26 zasianymi podatnościami i 16 pułapkami: miejscami, które wyglądają groźnie, a są poprawne.",
    key: "26 podatności i 16 pułapek. Trafienie w pułapkę to fałszywy alarm.",
    total: 26,
    links: [{ label: "benchmark/app", url: "https://github.com/bartek-filipiuk/security-audit-skill/tree/main/benchmark/app" }],
    glance: "26/26: Claude Code i Hinoki w OpenCode",
    takeaway: "Wszystkie 26 podatności znalazły Claude Code i Hinoki w OpenCode. Claude Code miał mniej fałszywych alarmów (2 wobec 5), potwierdził testem 21 z 40 znalezisk i skończył ponad dwa razy szybciej. Hinoki zweryfikował wszystkie 59 znalezisk tylko analizą kodu, za mniej niż połowę kosztu. Powtórka w Claude Code z 2 listopada, po zmianach w skillu, dała 25/26.",
    rows: [
      { model: "Opus 5.5 + subagenty Sonnet 5.5", agent: "Claude Code", outcome: { kind: "scored", found: 26 }, decoyFp: 2, unmatched: 4, testProofs: 21, verified: 40, minutes: 33, costUsd: 18 },
      { model: "Opus 5.5 + subagenty Sonnet 5.5 (2 lis)", agent: "Claude Code", outcome: { kind: "scored", found: 25 }, decoyFp: 1, minutes: 22, costUsd: 12.8 },
      { model: "Hinoki Offensive One", agent: `${OC}, hinoki.security`, outcome: { kind: "scored", found: 26 }, decoyFp: 5, unmatched: 12, testProofs: 0, verified: 59, minutes: 71.4, costUsd: 8.22, costApprox: true },
      { model: "DeepSeek V4 Pro", agent: `${OC}, API DeepSeek`, outcome: { kind: "broken", why: "przerwany przed raportem: skończyło się saldo u dostawcy" }, costUsd: 1.87 },
      { model: "gpt-6-astra + 9 subagentów", agent: `${CX}, plan ChatGPT`, outcome: { kind: "scored", found: 21 }, decoyFp: 1, unmatched: 2, testProofs: 0, verified: 25, minutes: 20.6 },
    ],
    notes: [
      "To pierwszy pełny przebieg Ledgerly w OpenCode. Zanim DeepSeek się zatrzymał, częściowe znaleziska dawały 26/26 bez trafień w pułapki, ale bez raportu przebieg się nie liczy.",
      "Wszystkie trafienia w pułapki, u obu modeli, to znaleziska o innym problemie w tych samych liniach (współbieżność, brak rotacji kluczy API, role w organizacji, brak logów bezpieczeństwa). Żadne nie twierdzi, że chroniona kontrola jest zepsuta.",
      "Codex CLI (30 października 2026, jeden przebieg) szedł na planie ChatGPT, więc nie ma kosztu per przebieg; zużył ok. 10 mln tokenów wejścia, prawie wszystko z cache. Szedł z hookiem strażnika i bez sieci: osv-scanner i gitleaks się nie uruchomiły, stąd dwa z czterech pudeł (podatna wersja Next.js, sekret w historii gita). Pozostałe dwa: skrypt instalacyjny pobierający zdalny skrypt i HTML z odpowiedzi modelu. Testów nie dało się uruchomić (brak vitest bez sieci), więc wszystkie dowody są z analizy kodu.",
      "Przebieg Claude Code z 2 listopada 2026 to kontrola, czy zmiany w skillu (m.in. R32) nie obniżyły wyniku. 25/26, jedno trafienie przez drugą wskazaną lokalizację. Pudło: podatna wersja Next.js, bo na maszynie nie było osv-scannera. Pułapka: brak odstępu między e-mailami z przypomnieniami AI. Przebiegi bazowe z 25 i 26 października: 25/26 i 0–1 trafień w pułapki.",
      "Ledgerly jest publiczny od października 2026, a skill powstawał na nim. Wynik pokazuje, że skill pokrywa te klasy błędów. Nie mówi, jak model radzi sobie z nieznanym kodem.",
    ],
  },
  {
    id: "t4",
    name: "T4: py-clinic, profil Python",
    what: "py-clinic, nasza aplikacja testowa w Pythonie (Django, FastAPI i Flask, 48 plików) z 18 zasianymi podatnościami i 18 pułapkami.",
    key: "18 podatności i 18 pułapek. Trafienie w pułapkę to fałszywy alarm.",
    total: 18,
    links: [{ label: "benchmark/py-clinic", url: "https://github.com/bartek-filipiuk/security-audit-skill/tree/main/benchmark/py-clinic" }],
    glance: "18/18 w Claude Code, 17/18 w Codex CLI bez strażnika",
    takeaway: "Claude Code znalazł wszystkie 18 podatności z jednym trafieniem w pułapkę, w 6 minut. Bez hooka strażnika Codex znalazł 17 z 18 podatności bez fałszywych alarmów. W obu przebiegach ze strażnikiem znalazł 12. Większość brakujących to znaleziska, które są w raporcie, ale wskazują początek funkcji zamiast linii z błędem (3-4 linie wcześniej), więc ścisły scorer ich nie liczy.",
    rows: [
      { model: "Opus 5.5 + subagenty Sonnet 5.5", agent: "Claude Code", outcome: { kind: "scored", found: 18 }, decoyFp: 1, minutes: 5.9, costUsd: 1.89 },
      { model: "gpt-6-astra, bez strażnika", agent: `${CX}, plan ChatGPT`, outcome: { kind: "scored", found: 17 }, decoyFp: 0, unmatched: 0, testProofs: 0, verified: 18, minutes: 7.7 },
      { model: "gpt-6-astra, strażnik v1", agent: `${CX}, plan ChatGPT`, outcome: { kind: "scored", found: 12 }, decoyFp: 1, unmatched: 6, testProofs: 0, verified: 19, minutes: 7.2 },
      { model: "gpt-6-astra, strażnik v2", agent: `${CX}, plan ChatGPT`, outcome: { kind: "scored", found: 12 }, decoyFp: 0, unmatched: 6, testProofs: 0, verified: 19, minutes: 8.3 },
    ],
    notes: [
      "Claude Code: jeden przebieg z 2 listopada 2026, pierwszy punktowany przebieg profilu Python. Pułapka: brak ograniczenia prób logowania.",
      "Codex: trzy przebiegi z 30 października 2026, po jednym na konfigurację. Plan ChatGPT, więc bez kosztu per przebieg: 0,8–1,6 mln tokenów wejścia, ponad 90% z cache.",
      "Strażnik v2 poprawia fałszywe blokady z v1. Najważniejsza: audyt znowu dopisuje .security-audit/ do .gitignore.",
      "W Codex, bez sieci i bez Django w środowisku, testy się nie uruchomiły, wszystkie dowody są z analizy kodu.",
      "py-clinic jest publiczny od października 2026 i powstał razem z profilem Python. Wynik pokazuje, że profil pokrywa te klasy błędów. Nie mówi, jak model radzi sobie z nieznanym kodem.",
    ],
  },
  {
    id: "t5",
    name: "T5: php-tickets, profil PHP",
    what: "php-tickets, nasza aplikacja testowa w PHP: helpdesk w Laravelu, serwis rozliczeń w Symfony i własny moduł Drupala. 13 zasianych podatności i 14 pułapek.",
    key: "13 podatności i 14 pułapek. Trafienie w pułapkę to fałszywy alarm.",
    total: 13,
    links: [{ label: "benchmark/php-tickets", url: "https://github.com/bartek-filipiuk/security-audit-skill/tree/main/benchmark/php-tickets" }],
    glance: "13/13 w Claude Code, 1 trafienie w pułapkę",
    takeaway: "Claude Code znalazł wszystkie 13 podatności w 12 minut. Jedno znalezisko trafiło w pułapkę, ale opisuje inny problem niż ten, który pułapka sprawdza.",
    rows: [
      { model: "Opus 5.5 + subagenty Sonnet 5.5", agent: "Claude Code", outcome: { kind: "scored", found: 13 }, decoyFp: 1, minutes: 11.9, costUsd: 3.59 },
    ],
    notes: [
      "Jeden przebieg z 2 listopada 2026, pierwszy punktowany przebieg profilu PHP.",
      "Pułapka: weryfikacja podpisu webhooka poczty przepuszcza żądanie, gdy sekret jest pusty. To inny problem w liniach pułapki.",
      "php-tickets jest publiczny od października 2026 i powstał razem z profilem PHP. Wynik pokazuje, że profil pokrywa te klasy błędów. Nie mówi, jak model radzi sobie z nieznanym kodem.",
    ],
  },
  {
    id: "t6",
    name: "T6: supabase-notes, profil Supabase i Firebase",
    what: "supabase-notes, nasza aplikacja testowa: Next.js na Supabase, tablice w Firestore. 10 zasianych podatności i 12 pułapek.",
    key: "10 podatności i 12 pułapek. Trafienie w pułapkę to fałszywy alarm.",
    total: 10,
    links: [{ label: "benchmark/supabase-notes", url: "https://github.com/bartek-filipiuk/security-audit-skill/tree/main/benchmark/supabase-notes" }],
    glance: "10/10 w Claude Code, 9/10 w Codex CLI",
    takeaway: "Claude Code znalazł wszystkie 10 podatności z jednym trafieniem w pułapkę. Codex znalazł 9 bez fałszywych alarmów. Pominął politykę RLS, która pozwala zmienić notatnik każdemu zalogowanemu, bez sprawdzenia właściciela.",
    rows: [
      { model: "Opus 5.5 + subagenty Sonnet 5.5", agent: "Claude Code", outcome: { kind: "scored", found: 10 }, decoyFp: 1, minutes: 6.9, costUsd: 2.26 },
      { model: "gpt-6-astra, strażnik", agent: `${CX}, plan ChatGPT`, outcome: { kind: "scored", found: 9 }, decoyFp: 0, minutes: 5 },
    ],
    notes: [
      "Po jednym przebiegu z 2 listopada 2026, pierwsze punktowane przebiegi profilu Supabase i Firebase. Codex szedł na planie ChatGPT, więc bez kosztu per przebieg.",
      "Pułapka w Claude Code: usunięcie konta zostawia pliki w Storage i tablice w Firebase.",
      "supabase-notes jest publiczny od października 2026 i powstał razem z profilem. Wynik pokazuje, że profil pokrywa te klasy błędów. Nie mówi, jak model radzi sobie z nieznanym kodem.",
    ],
  },
];

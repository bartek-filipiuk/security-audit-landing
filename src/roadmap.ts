// Public roadmap. Mirrors ROADMAP.md in the skill repo: same ids, same order, no dates.
// shipped: the item stays in its lane, marked done with a link to the pull request that delivered it.
// inProgress: code is in an open pull request (usually waiting for the benchmark run).
export type Item = { id: string; name: string; code?: string; value: string; done: string; shipped?: { date: string; pr: string }; inProgress?: { pr: string } };
export type Lane = { key: string; name: string; note: string; items: Item[] };

export const LANES: Lane[] = [
  {
    key: "now", name: "Teraz", note: "W pracy.",
    items: [
      { id: "R01", name: "Audyt przyrostowy", code: "--since <commit>", value: "Audytowane są tylko wejścia, których kod zmienił się od ostatniego audytu albo od wskazanego commita. Reszta raportu przenosi się z poprzedniego przebiegu.", done: "Ponowny audyt małej zmiany na aplikacji testowej kosztuje ułamek pełnego, w tokenach i minutach.", shipped: { date: "4 października 2026", pr: "https://github.com/bartek-filipiuk/security-audit-skill/pull/1" } },
      { id: "R02", name: "Profil Supabase i Firebase", value: "Reguły RLS, polityki storage, klucze service-role w kliencie, reguły Firestore. Najczęstszy stack obok Next.js.", done: "Profil ma własną aplikację testową z ukrytymi błędami i wynik na niej.", inProgress: { pr: "https://github.com/bartek-filipiuk/security-audit-skill/pull/12" } },
      { id: "R03", name: "Dokładniejsza ocena benchmarku", value: "Dopasowanie znalezisk do klucza odpowiedzi po pliku i linii, nie po słowach kluczowych.", done: "Każde dopasowanie na aplikacji testowej jest dokładne.", shipped: { date: "5 października 2026", pr: "https://github.com/bartek-filipiuk/security-audit-skill/pull/2" } },
    ],
  },
  {
    key: "next", name: "Następne", note: "Zaraz po tym, co wyżej.",
    items: [
      { id: "R04", name: "Wykrywanie stacku i flaga", code: "--stack", value: "Raport mówi, który profil zastosowano i czego ten profil nie obejmuje. Flaga wymusza profil.", done: "Aplikacja testowa, projekt PHP i projekt Python są rozpoznawane poprawnie.", shipped: { date: "8 października 2026", pr: "https://github.com/bartek-filipiuk/security-audit-skill/pull/4" } },
      { id: "R05", name: "Profil PHP: Laravel, Symfony, Drupal", value: "Wejścia z routingu, zapytania Eloquent i Doctrine bez zakresu, composer audit, taint w Psalm.", done: "Własna aplikacja testowa i wynik na niej.", inProgress: { pr: "https://github.com/bartek-filipiuk/security-audit-skill/pull/12" } },
      { id: "R06", name: "Profil Python: Django, FastAPI, Flask", value: "Zapytania ORM bez zakresu, bandit, pip-audit.", done: "Własna aplikacja testowa i wynik na niej.", inProgress: { pr: "https://github.com/bartek-filipiuk/security-audit-skill/pull/12" } },
      { id: "R07", name: "Narzędzia deterministyczne we wstępnym skanie", value: "semgrep z regułami pod stack, zizmor dla GitHub Actions, hadolint i trivy dla Dockerfile i obrazów. Ich wyniki są kandydatami dla audytorów, nigdy znaleziskami bez weryfikacji w kodzie.", done: "Każde narzędzie działa natywnie albo przez docker, uczciwie zgłasza „nie uruchomione”, a jego trafienia pojawiają się jako kandydaci.", inProgress: { pr: "https://github.com/bartek-filipiuk/security-audit-skill/pull/12" } },
      { id: "R08", name: "Więcej sprawdzeń", value: "CSRF, CI/CD (sekrety w logach, pull_request_target, nieprzypięte akcje), Docker i IaC, łańcuch dostaw (skrypty instalacyjne, integralność lockfile).", done: "Każde ma punkty na checkliście i co najmniej jeden ukryty błąd w aplikacji testowej.", shipped: { date: "8 października 2026", pr: "https://github.com/bartek-filipiuk/security-audit-skill/pull/6" } },
      { id: "R21", name: "Sprawdzenia LLM i agentów", value: "Prompt injection do narzędzi i agentów, wynik modelu trafiający do HTML, SQL, powłoki albo URL, wywołania narzędzi bez autoryzacji, nadużycie kosztów i tokenów.", done: "Punkty na checkliście, wzorce i co najmniej dwa ukryte błędy w aplikacji testowej, z wynikiem.", shipped: { date: "8 października 2026", pr: "https://github.com/bartek-filipiuk/security-audit-skill/pull/7" } },
      { id: "R22", name: "Rejestr pokrycia", value: "Zapis, które wejścia i klasy błędów zostały sprawdzone, walidowany schematem. Dzięki temu „nic nie znaleziono” odróżnia się od „nikt nie patrzył”.", done: "Sekcje pokrycia i „nie sprawdzone” w raporcie powstają z rejestru, a test walidatora przechodzi.", shipped: { date: "8 października 2026", pr: "https://github.com/bartek-filipiuk/security-audit-skill/pull/8" } },
    ],
  },
  {
    key: "later", name: "Później", note: "Zaplanowane, bez kolejności.",
    items: [
      { id: "R09", name: "Profil Go i profil Rust", value: "gosec i obsługa błędów; cargo-audit i unsafe.", done: "Własne aplikacje testowe i wyniki na nich." },
      { id: "R11", name: "Eksport znalezisk", value: "SARIF do GitHub code scanning; zadania do Linear i Jira z plikiem, linią i poprawką.", done: "Jedno polecenie tworzy plik albo zadania z wyniku audytu.", shipped: { date: "8 października 2026", pr: "https://github.com/bartek-filipiuk/security-audit-skill/pull/16" } },
      { id: "R12", name: "Porównanie audytów", value: "Co nowe, co naprawione, co wróciło między dwoma przebiegami.", done: "Raport ma sekcję „od ostatniego audytu”.", shipped: { date: "9 października 2026", pr: "https://github.com/bartek-filipiuk/security-audit-skill/pull/17" } },
      { id: "R13", name: "Tańsze audytory", value: "Pomiar na benchmarku, czy audytorzy mogą działać na lżejszym modelu bez utraty wykrywalności.", done: "Liczba jest opublikowana, niezależnie od tego, co pokaże." },
      { id: "R14", name: "Lista kontrolna produkcji", value: "Generowana z sekcji „nie sprawdzone”: nagłówki, limity, zmienne środowiskowe, kopie zapasowe, z instrukcją, jak sprawdzić każdą pozycję.", done: "Jest sekcją raportu.", shipped: { date: "9 października 2026", pr: "https://github.com/bartek-filipiuk/security-audit-skill/pull/18" } },
      { id: "R23", name: "Wyczerpanie zasobów i koszty", value: "Nieograniczone zapytania, uploady, kolejki i workery; płatne API (SMS, e-mail, AI), które może uruchomić anonim.", done: "Punkty na checkliście i ukryty błąd w aplikacji testowej, z wynikiem." },
      { id: "R24", name: "Cykl życia danych", value: "Izolacja klientów w cache, wyszukiwarce i eksportach; usuwanie danych, które pomija kopie, pliki albo dane pochodne; przywracanie, które wskrzesza usunięte osoby.", done: "Punkty na checkliście i ukryty błąd w aplikacji testowej, z wynikiem." },
      { id: "R25", name: "Sprawdzenia po stronie przeglądarki", value: "Wstrzyknięcia w DOM, zaufanie do postMessage, prototype pollution, clickjacking.", done: "Punkty na checkliście i ukryty błąd w aplikacji testowej, z wynikiem." },
      { id: "R26", name: "Dowolny agent", value: "Instalacja i uruchomienie poza Claude Code (skills CLI), z tym samym raportem.", done: "Benchmark przechodzi od początku do końca w co najmniej jednym innym agencie, wynik opublikowany." },
    ],
  },
  {
    key: "ideas", name: "Pomysły", note: "Bez zobowiązań.",
    items: [
      { id: "R15", name: "Audyt na każdy pull request", value: "Bezobsługowo, w CI.", done: "" },
      { id: "R16", name: "Profil Ruby on Rails", value: "brakeman.", done: "" },
      { id: "R17", name: "audit-live", value: "Czas każdej fazy, widok per audytor, licznik tokenów.", done: "" },
      { id: "R18", name: "Druga, niepublikowana aplikacja testowa", value: "Do mierzenia zmian w skillu bez ryzyka, że trafiła do danych treningowych.", done: "" },
      { id: "R27", name: "Kod natywny i bezpieczeństwo pamięci", value: "C, C++, unsafe w Rust. Szerzej niż web, do którego skill powstał.", done: "" },
      { id: "R28", name: "Mobile i lokalne IPC", value: "Deep linki, webview, eksportowane komponenty.", done: "" },
      { id: "R30", name: "Mini benchmarki na prawdziwych podatnościach", value: "Krótkie audyty prawdziwych modułów w wersji sprzed publicznej poprawki (np. moduł Drupala z opublikowanym advisory) i sprawdzenie, czy skill znajduje opisaną dziurę. Tylko defensywnie, na publicznych advisory.", done: "" },
      { id: "R29", name: "Protokoły i RPC", value: "gRPC, kolejki, brokery, streaming.", done: "" },
    ],
  },
];

export const DONE: { version: string; date: string; text: string }[] = [
  { version: "Open source", date: "3 października 2026", text: "Licencja MIT, publiczne repozytorium i uczciwe porównanie z darmową wtyczką Claude Security od Anthropic na tej samej aplikacji testowej." },
  { version: "1.1.0", date: "3 października 2026", text: "Format defensywny: skutek i test regresji zamiast kroków ataku. Mod audit-live z panelem postępu. Instrukcja z Discordem." },
  { version: "1.0.0", date: "2 października 2026", text: "Wstępny skan z rankingiem ryzyka, --scope, dzielona weryfikacja z łączeniem łańcuchów, raport HTML, aplikacja testowa Ledgerly." },
];

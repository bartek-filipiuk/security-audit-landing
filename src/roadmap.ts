// Public roadmap. Mirrors ROADMAP.md in the skill repo: same ids, same order, no dates.
export type Item = { id: string; name: string; code?: string; value: string; done: string };
export type Lane = { key: string; name: string; note: string; items: Item[] };

export const LANES: Lane[] = [
  {
    key: "now", name: "Teraz", note: "W pracy.",
    items: [
      { id: "R01", name: "Audyt przyrostowy", code: "--since <commit>", value: "Audytowane są tylko wejścia, których kod zmienił się od ostatniego audytu albo od wskazanego commita. Reszta raportu przenosi się z poprzedniego przebiegu.", done: "Ponowny audyt małej zmiany na aplikacji testowej kosztuje ułamek pełnego, w tokenach i minutach." },
      { id: "R02", name: "Profil Supabase i Firebase", value: "Reguły RLS, polityki storage, klucze service-role w kliencie, reguły Firestore. Najczęstszy stack obok Next.js.", done: "Profil ma własną aplikację testową z ukrytymi błędami i wynik na niej." },
      { id: "R03", name: "Dokładniejsza ocena benchmarku", value: "Dopasowanie znalezisk do klucza odpowiedzi po pliku i linii, nie po słowach kluczowych.", done: "Każde dopasowanie na aplikacji testowej jest dokładne." },
    ],
  },
  {
    key: "next", name: "Następne", note: "Zaraz po tym, co wyżej.",
    items: [
      { id: "R04", name: "Wykrywanie stacku i flaga", code: "--stack", value: "Raport mówi, który profil zastosowano i czego ten profil nie obejmuje. Flaga wymusza profil.", done: "Aplikacja testowa, projekt PHP i projekt Python są rozpoznawane poprawnie." },
      { id: "R05", name: "Profil PHP: Laravel, Symfony, Drupal", value: "Wejścia z routingu, zapytania Eloquent i Doctrine bez zakresu, composer audit, taint w Psalm.", done: "Własna aplikacja testowa i wynik na niej." },
      { id: "R06", name: "Profil Python: Django, FastAPI, Flask", value: "Zapytania ORM bez zakresu, bandit, pip-audit.", done: "Własna aplikacja testowa i wynik na niej." },
      { id: "R07", name: "Narzędzia deterministyczne we wstępnym skanie", value: "semgrep z regułami pod stack, zizmor dla GitHub Actions, hadolint i trivy dla Dockerfile i obrazów. Ich wyniki są kandydatami dla audytorów, nigdy znaleziskami bez weryfikacji w kodzie.", done: "Każde narzędzie działa natywnie albo przez docker, uczciwie zgłasza „nie uruchomione”, a jego trafienia pojawiają się jako kandydaci." },
      { id: "R08", name: "Więcej sprawdzeń", value: "CSRF, CI/CD (sekrety w logach, pull_request_target, nieprzypięte akcje), Docker i IaC, łańcuch dostaw (skrypty instalacyjne, integralność lockfile).", done: "Każde ma punkty na checkliście i co najmniej jeden ukryty błąd w aplikacji testowej." },
    ],
  },
  {
    key: "later", name: "Później", note: "Zaplanowane, bez kolejności.",
    items: [
      { id: "R09", name: "Profil Go i profil Rust", value: "gosec i obsługa błędów; cargo-audit i unsafe.", done: "Własne aplikacje testowe i wyniki na nich." },
      { id: "R11", name: "Eksport znalezisk", value: "SARIF do GitHub code scanning; zadania do Linear i Jira z plikiem, linią i poprawką.", done: "Jedno polecenie tworzy plik albo zadania z wyniku audytu." },
      { id: "R12", name: "Porównanie audytów", value: "Co nowe, co naprawione, co wróciło między dwoma przebiegami.", done: "Raport ma sekcję „od ostatniego audytu”." },
      { id: "R13", name: "Tańsze audytory", value: "Pomiar na benchmarku, czy audytorzy mogą działać na lżejszym modelu bez utraty wykrywalności.", done: "Liczba jest opublikowana, niezależnie od tego, co pokaże." },
      { id: "R14", name: "Lista kontrolna produkcji", value: "Generowana z sekcji „nie sprawdzone”: nagłówki, limity, zmienne środowiskowe, kopie zapasowe, z instrukcją, jak sprawdzić każdą pozycję.", done: "Jest sekcją raportu." },
    ],
  },
  {
    key: "ideas", name: "Pomysły", note: "Bez zobowiązań.",
    items: [
      { id: "R15", name: "Audyt na każdy pull request", value: "Bezobsługowo, w CI.", done: "" },
      { id: "R16", name: "Profil Ruby on Rails", value: "brakeman.", done: "" },
      { id: "R17", name: "audit-live", value: "Czas każdej fazy, widok per audytor, licznik tokenów.", done: "" },
      { id: "R18", name: "Druga, niepublikowana aplikacja testowa", value: "Do mierzenia zmian w skillu bez ryzyka, że trafiła do danych treningowych.", done: "" },
    ],
  },
];

export const DONE: { version: string; date: string; text: string }[] = [
  { version: "devince-apps 0.2.0", date: "3 października 2026", text: "R19 i R20: instalacja jedną komendą (npx devince-apps install) oraz zakup z terminala i z Claude Code (buy, claim). Kod publiczny: github.com/bartek-filipiuk/devince-apps-cli." },
  { version: "1.1.0", date: "3 października 2026", text: "Format defensywny: skutek i test regresji zamiast kroków ataku. Mod audit-live z panelem postępu. Instrukcja z Discordem." },
  { version: "1.0.0", date: "2 października 2026", text: "Wstępny skan z rankingiem ryzyka, --scope, dzielona weryfikacja z łączeniem łańcuchów, raport HTML, aplikacja testowa Ledgerly." },
];

// Everything that changes before launch lives here.
export const SITE = {
  name: "Security Audit",
  title: "Security Audit · skill do Claude Code",
  description:
    "Skill do Claude Code, który sprawdza bezpieczeństwo Twojego kodu i oddaje raport: co naprawić, co jest dobrze i czego nie dało się sprawdzić. Każde znalezisko ma plik, linię i opis skutku.",
  author: "Bartek Filipiuk",
  authorUrl: "https://devince.dev",
  price: 147,
  checkout: "https://apps.devince.dev/security-audit-skill-do-claude-code",
  video: { url: "/film/pelny-przebieg.mp4", poster: "/film/pelny-przebieg.jpg", minutes: 5 },
  // TODO before launch: contact address shown in the footer when set.
  contactEmail: "",
};

export const zl = (n: number) => `${n} zł`;

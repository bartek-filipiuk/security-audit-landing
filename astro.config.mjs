import { defineConfig } from "astro/config";

export default defineConfig({
  // site: "https://…"  // set before deploy: enables canonical and og:url
  vite: {
    // Emit every font as a file: inlined data: URIs would need a looser CSP (font-src data:).
    build: { assetsInlineLimit: 0 },
  },
});

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

const SITE = "https://security-audit.dev";

// Links to other sites (drupal.org, GitHub, the studio) open in a new tab, so a reader
// checking an advisory does not leave the page. Done on the built HTML rather than with a
// script: the CSP has no 'unsafe-inline', and it also covers the copied reports in public/.
function externalLinksNewTab() {
  const own = new URL(SITE).host;
  const anchor = /<a\b[^>]*>/g;
  const fix = (tag) => {
    const href = tag.match(/\shref="(https?:\/\/[^"]*)"/)?.[1];
    if (!href || new URL(href).host === own || /\starget=/.test(tag)) return tag;
    let out = tag.replace(/>$/, ' target="_blank">');
    out = /\srel="/.test(out)
      ? out.replace(/\srel="([^"]*)"/, (m, rel) => (/\bnoopener\b/.test(rel) ? m : ` rel="${rel} noopener"`))
      : out.replace(/>$/, ' rel="noopener">');
    return out;
  };
  async function* html(dir) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) yield* html(p);
      else if (e.name.endsWith(".html")) yield p;
    }
  }
  return {
    name: "external-links-new-tab",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        for await (const file of html(fileURLToPath(dir))) {
          const src = await readFile(file, "utf8");
          const out = src.replace(anchor, fix);
          if (out !== src) await writeFile(file, out);
        }
      },
    },
  };
}

export default defineConfig({
  site: SITE,
  integrations: [externalLinksNewTab()],
  vite: {
    // Emit every font as a file: inlined data: URIs would need a looser CSP (font-src data:).
    build: { assetsInlineLimit: 0 },
  },
});

/**
 * Per-page CSS. Tailwind builds one stylesheet for the whole site and Astro inlines
 * it into every page (one request per page, see build.inlineStylesheets). After the
 * build, this trims each page's inline <style> to the rules that page uses, which
 * keeps the first HTML response under the 14 KB budget as the design grows.
 *
 * Content that a page loads at runtime from another page (the About team modal
 * clones bios from /about/leadership) is declared on the element that receives it:
 *   <dialog data-css-from="/about/leadership">
 * and that page's HTML counts as content too, so its classes keep their rules.
 *
 * Runs only on `astro build`. Rewrites dist/client and the Vercel static output.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import { PurgeCSS } from "purgecss";

const STYLE = /<style>([\s\S]*?)<\/style>/;
const CSS_FROM = /data-css-from="([^"]+)"/g;
const decode = (s: string) =>
  s
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
/**
 * Class names, read two ways: every class="…" attribute split on whitespace (keeps
 * Tailwind classes containing > or & intact, e.g. [&>p:last-child]:text-muted-foreground),
 * plus class-like words anywhere else (classes that inline scripts add).
 */
const extractor = (content: string) => [
  ...[...content.matchAll(/\bclass="([^"]*)"/g)].flatMap((m) => decode(m[1] ?? "").split(/\s+/)),
  ...(content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) ?? []),
];

function htmlFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".html"))
    .map((e) => join(e.parentPath, e.name));
}

/** "/about/leadership" → that page's HTML in the same output folder. */
function pageHtml(root: string, path: string) {
  const clean = path.replace(/^\/|\/$/g, "");
  for (const f of [join(root, clean, "index.html"), join(root, `${clean}.html`)]) {
    if (existsSync(f)) return readFileSync(f, "utf8");
  }
  throw new Error(`page-css: data-css-from="${path}" does not match a built page`);
}

async function trim(root: string) {
  const files = htmlFiles(root);
  const original = new Map(files.map((f) => [f, readFileSync(f, "utf8")]));
  let before = 0;
  let after = 0;
  for (const [file, html] of original) {
    const css = html.match(STYLE)?.[1];
    if (!css) continue;
    const body = html.replace(STYLE, "");
    const extra = [...body.matchAll(CSS_FROM)].map((m) =>
      pageHtml(root, m[1] ?? "").replace(STYLE, ""),
    );
    const [result] = await new PurgeCSS().purge({
      content: [body, ...extra].map((raw) => ({ raw, extension: "html" })),
      css: [{ raw: css }],
      defaultExtractor: extractor,
      keyframes: true,
      // Tailwind's custom properties and @property rules are referenced indirectly.
      variables: false,
      fontFace: false,
      // Kept regardless: rules keyed on attributes (the extractor only sees class-like
      // tokens, e.g. [[data-tone=none]+&]:pt-0) and elements/states scripts create or toggle.
      safelist: {
        standard: [/^html$/, /^body$/],
        greedy: [/data-/, /aria-/, /dialog/, /backdrop/, /open/, /hidden/, /target/],
      },
    });
    const out = result?.css ?? css;
    before += css.length;
    after += out.length;
    writeFileSync(
      file,
      html.replace(STYLE, () => `<style>${out}</style>`),
    );
  }
  return { pages: original.size, before, after };
}

export default function pageCss(): AstroIntegration {
  return {
    name: "aa-page-css",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const client = fileURLToPath(dir);
        const roots = [
          client,
          fileURLToPath(new URL("../.vercel/output/static/", import.meta.url)),
        ];
        for (const root of roots) {
          const r = await trim(root);
          if (r.pages)
            logger.info(
              `${root.replace(process.cwd(), ".")}: ${r.pages} pages, inline CSS ${Math.round(r.before / r.pages / 1024)} KB → ${Math.round(r.after / r.pages / 1024)} KB per page on average`,
            );
        }
      },
    },
  };
}

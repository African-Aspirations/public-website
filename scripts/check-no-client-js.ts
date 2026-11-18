/**
 * Zero-JS guardrail for the public site. The design system (shadcn recipes)
 * is rendered at build time; nothing may hydrate on the client.
 * Fails if:
 *  - any `client:` directive appears in apps/web/src (would ship a framework runtime)
 *  - the build emitted any .js file to dist/client/_astro (bundled client JS)
 * Small inline scripts (mobile menu, listing filter) are allowed: they live in
 * the HTML and are counted by the 14 KB budget.
 *
 *   bun scripts/check-no-client-js.ts
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const walk = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((n) => {
        const p = join(dir, n);
        return statSync(p).isDirectory() ? walk(p) : [p];
      })
    : [];

const problems: string[] = [];
for (const file of walk("apps/web/src").filter((f) => /\.(astro|tsx|jsx|ts)$/.test(f))) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (/\sclient:(load|idle|visible|media|only)\b/.test(line))
        problems.push(`${file}:${i + 1} hydrates on the client: ${line.trim()}`);
    });
}
const bundled = walk("apps/web/dist/client/_astro").filter((f) => f.endsWith(".js"));
for (const f of bundled) problems.push(`client JS bundle emitted: ${f}`);

if (problems.length) {
  console.error(
    `✗ Public site must ship no client framework JS:\n${problems.map((p) => `  - ${p}`).join("\n")}`,
  );
  process.exit(1);
}
console.log("✓ No client hydration and no bundled client JS.");

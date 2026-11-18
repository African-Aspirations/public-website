/**
 * 14 KB first-response budget.
 * Compresses every built HTML page (inlined CSS included) with brotli and gzip
 * and fails if either is over budget. 14 KB ≈ the first TCP round trip
 * (10 segments × ~1460 B); we keep 14,000 B as the hard limit.
 *
 *   bun scripts/check-budget.ts apps/web/dist
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";

const LIMIT = 14_000;
const root = process.argv[2] ?? "apps/web/dist";

function* htmlFiles(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (name.endsWith(".html")) yield p;
  }
}

const rows: { page: string; raw: number; br: number; gz: number; ok: boolean }[] = [];
for (const file of htmlFiles(root)) {
  const buf = readFileSync(file);
  const br = brotliCompressSync(buf, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  }).length;
  const gz = gzipSync(buf, { level: 9 }).length;
  rows.push({ page: relative(root, file), raw: buf.length, br, gz, ok: Math.max(br, gz) <= LIMIT });
}

if (rows.length === 0) {
  console.error(`No HTML found in ${root}. Build the site first.`);
  process.exit(1);
}

rows.sort((a, b) => b.gz - a.gz);
const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
console.log(`HTML budget: ${LIMIT.toLocaleString()} B compressed (brotli and gzip)\n`);
for (const r of rows) {
  console.log(
    `${r.ok ? "✓" : "✗"} ${r.page.padEnd(48)} raw ${kb(r.raw).padStart(9)}  br ${kb(r.br).padStart(8)}  gz ${kb(r.gz).padStart(8)}`,
  );
}
const failed = rows.filter((r) => !r.ok);
if (failed.length) {
  console.error(`\n${failed.length} page(s) over budget.`);
  process.exit(1);
}
console.log(`\nAll ${rows.length} page(s) within budget.`);

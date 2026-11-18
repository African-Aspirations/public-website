/** Minimal static server for the built site (dist/), used by Playwright. */
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "../dist/client");
const port = Number(process.env.PORT ?? 4322);
Bun.serve({
  port,
  fetch(req) {
    const path = decodeURIComponent(new URL(req.url).pathname);
    const candidates = [
      join(root, path),
      join(root, path, "index.html"),
      join(root, `${path}.html`),
    ];
    const file = candidates.find(
      (p) => p.startsWith(root) && existsSync(p) && statSync(p).isFile(),
    );
    return file
      ? new Response(Bun.file(file))
      : new Response(Bun.file(join(root, "404.html")), { status: 404 });
  },
});
console.log(`serving dist on http://localhost:${port}`);

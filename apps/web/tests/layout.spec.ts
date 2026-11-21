/**
 * The content-width rule: on every page and breakpoint, the header logo,
 * the page <h1>'s content column and the footer columns start at the same
 * x-offset, and nothing scrolls horizontally. (The h1's column, not the h1:
 * a design may put the heading in the right half, as the About page hero does.)
 */
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { expect, test } from "@playwright/test";

const dist = join(import.meta.dirname, "../dist/client");
function routes(dir = dist): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name === "_astro" ? [] : routes(p);
    if (name !== "index.html") return [];
    const r = `/${relative(dist, dir)}`.replace(/\/$/, "");
    return [r || "/"];
  });
}

const WIDTHS = [375, 768, 1280, 1920];

for (const route of routes()) {
  test(`content width is consistent: ${route}`, async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      const x = await page.evaluate(() => {
        const left = (sel: string) =>
          document.querySelector(sel)?.getBoundingClientRect().left ?? null;
        return {
          logo: left(".site-header .logo"),
          h1: document.querySelector("main h1")
            ? (document.querySelector("main h1")?.closest(".layout > *")?.getBoundingClientRect()
                .left ?? null)
            : null,
          footer: left(".site-footer .cols"),
          overflow: document.documentElement.scrollWidth - window.innerWidth,
        };
      });
      expect(x.h1, `${route} @${width}px has an <h1>`).not.toBeNull();
      expect(Math.round(x.h1 ?? 0), `${route} @${width}px h1 vs logo`).toBe(
        Math.round(x.logo ?? -1),
      );
      expect(Math.round(x.footer ?? 0), `${route} @${width}px footer vs logo`).toBe(
        Math.round(x.logo ?? -1),
      );
      expect(x.overflow, `${route} @${width}px horizontal overflow`).toBeLessThanOrEqual(0);
    }
  });
}

test("exactly one h1 per page", async ({ page }) => {
  for (const route of routes()) {
    await page.goto(route);
    await expect(page.locator("h1"), route).toHaveCount(1);
  }
});

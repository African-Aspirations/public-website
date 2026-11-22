import { existsSync } from "node:fs";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import postgres from "postgres";
import devMedia from "./integrations/dev-media";
import pageCss from "./integrations/page-css";

// The config runs before Astro loads .env, so read it here (Vercel sets real env vars instead).
if (existsSync(".env")) process.loadEnvFile(".env");
const env = process.env;

/** 301s managed in the admin (e.g. the old misspelled URLs), read at build time. */
async function loadRedirects() {
  if (!env.DATABASE_URL_WEB_BUILD) return {};
  const sql = postgres(env.DATABASE_URL_WEB_BUILD, { prepare: false, max: 1 });
  try {
    const rows = await sql`SELECT from_path, to_path, status_code FROM redirects`;
    return Object.fromEntries(
      rows.map((r) => [r.from_path, { status: r.status_code, destination: r.to_path }]),
    );
  } finally {
    await sql.end();
  }
}

export default defineConfig({
  site: env.PUBLIC_SITE_URL ?? "https://www.africanaspirations.com",
  // Pages are prerendered by default; only form endpoints opt out (prerender = false).
  output: "static",
  adapter: vercel(),
  integrations: [
    devMedia(),
    pageCss(),
    sitemap({
      filter: (page) => !/\/(404|privacy-policy|terms-of-use)\/?$/.test(page),
    }),
  ],
  redirects: await loadRedirects(),
  build: {
    // One HTML request per page: CSS is inlined, so it must stay tiny (14 KB budget).
    inlineStylesheets: "always",
  },
  vite: { plugins: [tailwindcss()] },
  compressHTML: true,
  trailingSlash: "never",
});

import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? "https://www.africanaspirations.com",
  // Pages are prerendered by default; only form endpoints opt out (prerender = false).
  output: "static",
  adapter: vercel(),
  integrations: [sitemap()],
  build: {
    // One HTML request per page: CSS is inlined, so it must stay tiny (14 KB budget).
    inlineStylesheets: "always",
  },
  compressHTML: true,
  trailingSlash: "never",
});

/**
 * Dev-only image server: /__dev-media/<publicId>?w=&h= serves the legacy image
 * that will live at that Cloudinary public_id. Lets `bun dev` show real photos
 * before Cloudinary is configured. Uses `astro:server:setup`, which only runs
 * for `astro dev`, so nothing here reaches a production build.
 */
import type { AstroIntegration } from "astro";

export default function devMedia(): AstroIntegration {
  return {
    name: "aa-dev-media",
    hooks: {
      "astro:server:setup": async ({ server, logger }) => {
        type DevMedia = typeof import("@aa/db/dev-media");
        // Load through the dev server's module graph (the config loader is closed by now).
        let mod: Promise<DevMedia> | undefined;
        const load = () => {
          mod ??= server.ssrLoadModule("@aa/db/dev-media") as Promise<DevMedia>;
          return mod;
        };
        logger.info("serving legacy images at /__dev-media (Cloudinary not configured)");
        server.middlewares.use("/__dev-media/", async (req, res) => {
          const url = new URL(req.url ?? "/", "http://dev");
          const publicId = decodeURIComponent(url.pathname.replace(/^\//, ""));
          const w = Math.min(Number(url.searchParams.get("w")) || 1200, 2400);
          const h = Number(url.searchParams.get("h")) || undefined;
          try {
            const img = await (await load()).renderLegacyImage(publicId, w, h);
            if (!img) {
              res.statusCode = 404;
              res.end("unknown image");
              return;
            }
            res.setHeader("Content-Type", "image/webp");
            res.setHeader("Cache-Control", "no-cache");
            res.end(img);
          } catch (err) {
            logger.error(`dev-media ${publicId}: ${err}`);
            res.statusCode = 500;
            res.end();
          }
        });
      },
    },
  };
}

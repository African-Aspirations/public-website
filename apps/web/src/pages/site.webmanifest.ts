import type { APIRoute } from "astro";
import { getContent } from "../lib/content";

/** Web app manifest (Android home-screen icon and name), built from site settings. */
export const GET: APIRoute = async () => {
  const { settings } = await getContent();
  const manifest = {
    name: settings.orgName,
    short_name: settings.orgName,
    description: settings.tagline ?? undefined,
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#015a1a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json" },
  });
};

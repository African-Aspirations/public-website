/**
 * Cloudinary delivery URLs. f_auto picks AVIF/WebP per browser, q_auto picks
 * the quality, w_ resizes at the edge. Only the (public) cloud name is needed.
 */
const cloud = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME as string | undefined;

/** In `astro dev` without Cloudinary, images come from the dev-only /__dev-media server (integrations/dev-media.ts). */
const devMedia = !cloud && import.meta.env.DEV;

export const cloudinaryEnabled = Boolean(cloud) || devMedia;

export function cldUrl(
  publicId: string,
  opts: { width: number; height?: number; crop?: "fill" | "limit"; rasterize?: boolean },
) {
  if (devMedia) {
    const h = opts.height ? `&h=${Math.round(opts.height)}` : "";
    return `/__dev-media/${encodeURIComponent(publicId)}?w=${Math.round(opts.width)}${h}`;
  }
  const t = [
    // SVG sources (some legacy "SVGs" are wrapped PNGs) are rasterized to WebP at the requested width.
    opts.rasterize ? "f_webp" : "f_auto",
    "q_auto",
    `c_${opts.crop ?? (opts.height ? "fill" : "limit")}`,
    `w_${Math.round(opts.width)}`,
    opts.height ? `h_${Math.round(opts.height)}` : "",
    opts.height ? "g_auto" : "",
  ]
    .filter(Boolean)
    .join(",");
  return `https://res.cloudinary.com/${cloud}/image/upload/${t}/${publicId}`;
}

/** Widths offered in srcset; capped at the source width (never upscale). */
export const WIDTHS = [320, 480, 640, 800, 1024, 1280, 1600, 2000];

type MediaLike = { publicId: string; width: number; height: number; format: string };

/** src/srcset/dimensions for a media row; shared by <Img> and the LCP preload. */
export function responsive(media: MediaLike, aspect?: number) {
  const rasterize = media.format === "svg";
  // Vector sources can be rendered at any width; rasters are never upscaled.
  const maxW = rasterize ? 1280 : media.width;
  const widths = WIDTHS.filter((w) => w <= maxW);
  const last = widths.at(-1);
  if (last === undefined || last < Math.min(maxW, 2000)) widths.push(Math.min(maxW, 2000));
  const h = (w: number) => (aspect ? Math.round(w / aspect) : undefined);
  const width = widths.at(-1) ?? 800;
  const ratio = aspect ?? media.width / media.height;
  return {
    src: cldUrl(media.publicId, { width, height: h(width), rasterize }),
    srcset: widths
      .map((w) => `${cldUrl(media.publicId, { width: w, height: h(w), rasterize })} ${w}w`)
      .join(", "),
    width,
    height: Math.round(width / ratio),
    ratio,
  };
}

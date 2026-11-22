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
export const WIDTHS = [400, 640, 960, 1280, 1920];

type MediaLike = { publicId: string; width: number; height: number; format: string };

/**
 * Largest CSS width (px) an image can be shown at, from its `sizes` attribute.
 * Entries are read in order: a viewport-relative value only applies below the previous
 * entry's (min-width) breakpoint, so it has an upper bound too.
 *   "112px" → 112 · "(min-width: 64rem) 520px, 100vw" → 1024 · "100vw" → Infinity
 */
export function maxDisplayWidth(sizes?: string) {
  if (!sizes) return Number.POSITIVE_INFINITY;
  const px = (n: string, unit: string) => Number(n) * (unit === "rem" ? 16 : 1);
  let upper = Number.POSITIVE_INFINITY; // viewport is narrower than this for the current entry
  let max = 0;
  for (const raw of sizes.split(",")) {
    const part = raw.trim();
    const cond = part.match(/^\(min-width:\s*(\d+(?:\.\d+)?)(px|rem)\)\s+/);
    if (part.startsWith("(") && !cond) return Number.POSITIVE_INFINITY; // other media queries
    const value = cond ? part.slice(cond[0].length) : part;
    const m = value.match(/^(\d+(?:\.\d+)?)(px|rem|vw)$/);
    if (!m) return Number.POSITIVE_INFINITY; // calc() etc.
    const w = m[2] === "vw" ? (Number(m[1]) / 100) * upper : px(m[1], m[2]);
    max = Math.max(max, w);
    if (cond) upper = px(cond[1], cond[2]);
  }
  return max || Number.POSITIVE_INFINITY;
}

/**
 * src/srcset/dimensions for a media row; shared by <Img> and the LCP preload.
 * With `sizes`, only widths the image can actually be shown at are offered (up to 2×
 * for high-density screens), which keeps the HTML small: every candidate is a full URL.
 */
export function responsive(media: MediaLike, aspect?: number, sizes?: string) {
  const rasterize = media.format === "svg";
  // Vector sources can be rendered at any width; rasters are never upscaled.
  const maxW = rasterize ? 1280 : media.width;
  let widths = WIDTHS.filter((w) => w <= maxW);
  const last = widths.at(-1);
  if (last === undefined || last < Math.min(maxW, 2000)) widths.push(Math.min(maxW, 2000));
  const target = maxDisplayWidth(sizes) * 2;
  const enough = widths.findIndex((w) => w >= target);
  if (enough !== -1) widths = widths.slice(0, enough + 1);
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

import { cloudinaryEnabled, responsive } from "./cloudinary";
import type { Content, Section } from "./content";

export const HERO_SIZES = "(min-width: 64rem) 620px, 100vw";
export const HERO_ASPECT = 1;
// "collage" variant: two overlapping landscape photos in the left half.
export const COLLAGE_SIZES = "(min-width: 48rem) 400px, 80vw";
export const COLLAGE_ASPECT = 8 / 5;
// "band" variant: one landscape photo in the right half of the green band.
export const BAND_SIZES = "(min-width: 64rem) 520px, (min-width: 48rem) 50vw, 100vw";
export const BAND_ASPECT = 17 / 10;

const VARIANTS = {
  default: { aspect: HERO_ASPECT, sizes: HERO_SIZES },
  collage: { aspect: COLLAGE_ASPECT, sizes: COLLAGE_SIZES },
  band: { aspect: BAND_ASPECT, sizes: BAND_SIZES },
} as const;

/** Preload hint for the page's LCP image (first image of the first hero). */
export function heroPreload(c: Content, sections: Section[]) {
  const hero = sections[0];
  if (!cloudinaryEnabled || hero?.type !== "hero") return null;
  const media = c.media((hero.data.imageIds as string[] | undefined)?.[0]);
  if (!media) return null;
  const v = VARIANTS[(hero.data.variant as keyof typeof VARIANTS | undefined) ?? "default"];
  // A framed band image is shown uncropped (see Hero.astro).
  const aspect = hero.data.variant === "band" && hero.data.imageFrame ? undefined : v.aspect;
  return { srcset: responsive(media, aspect, v.sizes).srcset, sizes: v.sizes };
}

export function heroImage(c: Content, sections: Section[]) {
  const hero = sections[0];
  return hero?.type === "hero" ? c.media((hero.data.imageIds as string[] | undefined)?.[0]) : null;
}

import { cloudinaryEnabled, responsive } from "./cloudinary";
import type { Content, Section } from "./content";

export const HERO_SIZES = "(min-width: 64rem) 560px, 100vw";
export const HERO_ASPECT = 4 / 3;

/** Preload hint for the page's LCP image (first image of the first hero). */
export function heroPreload(c: Content, sections: Section[]) {
  const hero = sections[0];
  if (!cloudinaryEnabled || hero?.type !== "hero") return null;
  const media = c.media((hero.data.imageIds as string[] | undefined)?.[0]);
  return media ? { srcset: responsive(media, HERO_ASPECT).srcset, sizes: HERO_SIZES } : null;
}

export function heroImage(c: Content, sections: Section[]) {
  const hero = sections[0];
  return hero?.type === "hero" ? c.media((hero.data.imageIds as string[] | undefined)?.[0]) : null;
}

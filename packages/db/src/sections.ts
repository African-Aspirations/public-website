import { z } from "zod";

/**
 * The `data` JSON of each `page_sections` row, by section type.
 * The admin block editor builds its forms from these, and the Astro site
 * validates with them at build time, so a bad row fails the build instead
 * of shipping a broken page.
 *
 * Images are referenced by `media.id` (uuid) and resolved to Cloudinary URLs.
 * There is deliberately no width/padding/alignment option anywhere: layout
 * is owned by the global `.layout` grid (packages/config/tokens.css).
 */

const mediaId = z.uuid();
const link = z.object({ label: z.string().min(1), href: z.string().min(1) });
const card = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
  imageId: mediaId.optional(),
  href: z.string().optional(),
  items: z.array(z.object({ title: z.string(), body: z.string().optional() })).optional(),
});

export const sectionSchemas = {
  hero: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().min(1), // rendered as the page <h1>
    accent: z.string().optional(), // end of the <h1> in green: own line by default, inline in "band"
    body: z.string().optional(),
    imageIds: z.array(mediaId).max(6).default([]), // >1 = scroll-snap carousel
    cta: link.optional(),
    // "collage": two overlapping photos left, heading + markdown body right (about page).
    // "band": white text on a full-width green band, landscape photo right, breadcrumb on nested pages.
    variant: z.enum(["default", "collage", "band"]).default("default"),
    logoBanner: z.boolean().default(false), // large site logo in a band above the hero
  }),
  rich_text: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    body: z.string().min(1), // markdown
    imageId: mediaId.optional(),
    imageSide: z.enum(["left", "right"]).default("right"),
    // "diagonal": image on white, text on a dark-green panel with a slanted edge (partners).
    variant: z.enum(["default", "diagonal"]).default("default"),
    // In-page link target, e.g. "institutionalization" → /business-consulting#institutionalization.
    anchor: z
      .string()
      .regex(/^[a-z][a-z0-9-]*$/)
      .optional(),
  }),
  card_grid: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    intro: z.string().optional(),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
    // "feature": green cards with a photo on top and a "Learn more" button (home services).
    variant: z.enum(["default", "feature"]).default("default"),
    linkLabel: z.string().default("Learn more"),
    cards: z.array(card).min(1),
  }),
  steps: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    intro: z.string().optional(),
    steps: z.array(z.object({ title: z.string().min(1), body: z.string().optional() })).min(1),
    // "panel": the steps as translucent cards on a rounded green panel.
    variant: z.enum(["default", "panel"]).default("default"),
    label: z.string().optional(), // e.g. "Phase" → "PHASE 1"; otherwise "01"
  }),
  stats: z.object({
    heading: z.string().optional(),
    stats: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) })).min(1),
  }),
  cta: z.object({
    heading: z.string().min(1),
    body: z.string().optional(),
    cta: link,
    imageId: mediaId.optional(), // band: beside the text; dark: full-width background
    imageSide: z.enum(["left", "right"]).default("right"),
    imageMirror: z.boolean().default(false), // flip the image horizontally
    tone: z.enum(["band", "dark"]).default("band"),
    // dark tone with an image: "full" darkens the whole photo; "fade" darkens the left
    // (behind the text) and fades out, so the photo's subject on the right stays clear.
    overlay: z.enum(["full", "fade"]).default("full"),
  }),
  team: z.object({ heading: z.string().optional(), intro: z.string().optional() }),
  // heading defaults to the partner's name; the description's first paragraph is the intro.
  partner: z.object({ partnerId: z.uuid(), heading: z.string().optional() }),
  faq: z.object({ heading: z.string().optional(), topic: z.string().optional() }),
  listings_teaser: z.object({
    heading: z.string().optional(),
    limit: z.number().int().min(1).max(12).default(3),
  }),
  contact_form: z.object({ heading: z.string().optional(), intro: z.string().optional() }),
  newsletter_form: z.object({ heading: z.string().optional(), intro: z.string().optional() }),
} as const;

export type SectionType = keyof typeof sectionSchemas;
export type SectionData<T extends SectionType> = z.infer<(typeof sectionSchemas)[T]>;

export function parseSection<T extends SectionType>(type: T, data: unknown): SectionData<T> {
  return sectionSchemas[type].parse(data) as SectionData<T>;
}

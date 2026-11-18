/**
 * Seed format for content transcribed from the legacy site.
 *
 * Two kinds of placeholder are resolved by the seed runner (seed/run.ts):
 *  - Images:  asset("new_images/1.jpg", "Alt text")  — a path under the legacy
 *    public/ folder. The asset migration uploads it to Cloudinary and creates a
 *    `media` row; the runner swaps the placeholder for that media id.
 *  - Links between rows: ref("partner", "tba") / ref("page", "about") — swapped
 *    for the row's uuid.
 *
 * Section `data` follows src/sections.ts, except image fields hold asset(...)
 * and partnerId holds ref("partner", ...). Validated after resolution.
 */
import type { SectionType } from "../src/sections";

export type AssetRef = { $asset: string; alt: string };
export type RowRef = { $ref: "partner" | "page" | "service" | "team"; key: string };

export const asset = (path: string, alt: string): AssetRef => ({ $asset: path, alt });
export const ref = (kind: RowRef["$ref"], key: string): RowRef => ({ $ref: kind, key });

export type SeedSection = { type: SectionType; data: Record<string, unknown> };

export type SeedPage = {
  slug: string; // "" = home. New canonical slug (spelling fixed).
  legacyPaths?: string[]; // old URLs that should 301 here, if different
  title: string;
  template?: "default" | "home" | "legal" | "listings";
  seoTitle?: string;
  seoDescription?: string;
  status?: "draft" | "published"; // default published
  sections: SeedSection[];
  /** Notes for the human reviewer: broken/duplicated/missing copy found in the old site. */
  review?: string[];
};

export type SeedService = {
  key: string; // slug
  title: string;
  summary: string;
  image?: AssetRef;
  pageSlug?: string;
  parentKey?: string;
  features?: { title: string; description?: string }[];
};

export type SeedTeamMember = {
  key: string;
  name: string;
  role: string;
  credentials?: string;
  summary?: string;
  bio?: string; // markdown; legacy bio1..bio4 joined as paragraphs
  photo?: AssetRef;
  linkedinUrl?: string;
};

export type SeedPartner = {
  key: string;
  name: string;
  description?: string;
  url?: string;
  logo?: AssetRef;
  stats: { value: string; label: string }[];
};

export type SeedNavItem = {
  label: string;
  description?: string;
  pageSlug?: string; // internal
  url?: string; // external
  children?: SeedNavItem[];
};

export type SeedSiteSettings = {
  orgName: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  socials: { label: string; url: string }[];
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  logo?: AssetRef;
  ctaLabel?: string;
  ctaUrl?: string;
};

export type SeedNav = {
  header: SeedNavItem[];
  /** footer columns, keyed by column heading */
  footer: Record<string, SeedNavItem[]>;
};

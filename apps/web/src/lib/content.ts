/**
 * Build-time content loader. Runs only during `astro build` / dev, through the
 * read-only `web_build` role, which can see published rows only. Loaded once
 * per build and shared by every page.
 */
import { createDb, parseSection, type SectionType, schema as s } from "@aa/db";
import { asc, desc } from "drizzle-orm";

export type Media = typeof s.media.$inferSelect;
export type Page = typeof s.pages.$inferSelect;
export type Section = { id: string; type: SectionType; data: Record<string, unknown> };
export type NavItem = {
  id: string;
  label: string;
  description: string | null;
  href: string;
  children: NavItem[];
};
export type Listing = typeof s.listings.$inferSelect & {
  category: typeof s.listingCategories.$inferSelect | null;
  cover: Media | null;
  images: Media[];
};

const env = (k: string) => import.meta.env[k] ?? process.env[k];

async function load() {
  const db = createDb(env("DATABASE_URL_WEB_BUILD"));
  const [
    settingsRows,
    pages,
    sections,
    media,
    nav,
    team,
    partners,
    services,
    categories,
    listings,
    listingImages,
    redirects,
    faqs,
  ] = await Promise.all([
    db.select().from(s.siteSettings).limit(1),
    db.select().from(s.pages),
    db.select().from(s.pageSections).orderBy(asc(s.pageSections.sortOrder)),
    db.select().from(s.media),
    db.select().from(s.navItems).orderBy(asc(s.navItems.sortOrder)),
    db.select().from(s.teamMembers).orderBy(asc(s.teamMembers.sortOrder)),
    db.select().from(s.partners).orderBy(asc(s.partners.sortOrder)),
    db.select().from(s.services).orderBy(asc(s.services.sortOrder)),
    db.select().from(s.listingCategories).orderBy(asc(s.listingCategories.sortOrder)),
    db.select().from(s.listings).orderBy(desc(s.listings.createdAt)),
    db.select().from(s.listingImages).orderBy(asc(s.listingImages.sortOrder)),
    db.select().from(s.redirects),
    db.select().from(s.faqs).orderBy(asc(s.faqs.sortOrder)),
  ]);

  const settings = settingsRows[0];
  if (!settings) throw new Error("site_settings is empty — seed the database first");

  const mediaById = new Map(media.map((m) => [m.id, m]));
  const pageById = new Map(pages.map((p) => [p.id, p]));
  const pageHref = (slug: string) => (slug ? `/${slug}` : "/");

  // Sections, validated: a bad row fails the build instead of shipping a broken page.
  const sectionsByPage = new Map<string, Section[]>();
  for (const row of sections) {
    let data: Record<string, unknown>;
    try {
      data = parseSection(row.type, row.data) as Record<string, unknown>;
    } catch (err) {
      const page = pageById.get(row.pageId);
      throw new Error(`Invalid ${row.type} section on page "/${page?.slug}": ${err}`);
    }
    const list = sectionsByPage.get(row.pageId) ?? [];
    list.push({ id: row.id, type: row.type, data });
    sectionsByPage.set(row.pageId, list);
  }

  // Navigation trees. Items pointing at an unpublished page are dropped.
  const buildNav = (menu: string): NavItem[] => {
    const rows = nav.filter((n) => n.menu === menu);
    const toItem = (n: (typeof rows)[number]): NavItem | null => {
      const page = n.pageId ? pageById.get(n.pageId) : undefined;
      if (n.pageId && !page) return null;
      const href = page ? pageHref(page.slug) : (n.url ?? "#");
      const children = rows
        .filter((c) => c.parentId === n.id)
        .map(toItem)
        .filter((c): c is NavItem => c !== null);
      return { id: n.id, label: n.label, description: n.description, href, children };
    };
    return rows
      .filter((n) => !n.parentId)
      .map(toItem)
      .filter((n): n is NavItem => n !== null);
  };
  const footerColumns = [
    ...new Set(nav.map((n) => n.menu).filter((m) => m.startsWith("footer:"))),
  ].map((menu) => ({ heading: menu.slice("footer:".length), items: buildNav(menu) }));

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const fullListings: Listing[] = listings.map((l) => ({
    ...l,
    category: l.categoryId ? (categoryById.get(l.categoryId) ?? null) : null,
    cover: l.coverId ? (mediaById.get(l.coverId) ?? null) : null,
    images: listingImages
      .filter((i) => i.listingId === l.id)
      .map((i) => mediaById.get(i.mediaId))
      .filter((m): m is Media => !!m),
  }));

  return {
    settings,
    pages,
    sectionsFor: (pageId: string) => sectionsByPage.get(pageId) ?? [],
    media: (id: unknown) => (typeof id === "string" ? (mediaById.get(id) ?? null) : null),
    header: buildNav("header"),
    footerColumns,
    legal: buildNav("legal"),
    team,
    partners,
    partner: (id: unknown) => partners.find((p) => p.id === id) ?? null,
    services,
    categories,
    listings: fullListings,
    redirects,
    faqs,
    pageHref,
  };
}

export type Content = Awaited<ReturnType<typeof load>>;
let cached: Promise<Content> | undefined;
export const getContent = () => {
  cached ??= load();
  return cached;
};

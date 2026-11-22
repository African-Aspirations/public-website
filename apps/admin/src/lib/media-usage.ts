import "server-only";
import { schema as s } from "@aa/db";
import { eq, or, sql } from "drizzle-orm";
import { db } from "./db";

export type Usage = { label: string; href: string };

/** Everywhere a media item is referenced, so it isn't deleted while in use. */
export async function mediaUsage(id: string): Promise<Usage[]> {
  const d = db();
  const [team, partners, services, listings, gallery, posts, pages, sections, settings] =
    await Promise.all([
      d
        .select({ id: s.teamMembers.id, name: s.teamMembers.name })
        .from(s.teamMembers)
        .where(eq(s.teamMembers.photoId, id)),
      d
        .select({ id: s.partners.id, name: s.partners.name })
        .from(s.partners)
        .where(eq(s.partners.logoId, id)),
      d
        .select({ id: s.services.id, name: s.services.title })
        .from(s.services)
        .where(eq(s.services.imageId, id)),
      d
        .select({ id: s.listings.id, name: s.listings.name })
        .from(s.listings)
        .where(eq(s.listings.coverId, id)),
      d
        .select({ id: s.listings.id, name: s.listings.name })
        .from(s.listingImages)
        .innerJoin(s.listings, eq(s.listings.id, s.listingImages.listingId))
        .where(eq(s.listingImages.mediaId, id)),
      d
        .select({ id: s.posts.id, name: s.posts.title })
        .from(s.posts)
        .where(eq(s.posts.coverId, id)),
      d
        .select({ id: s.pages.id, name: s.pages.title })
        .from(s.pages)
        .where(eq(s.pages.ogImageId, id)),
      // Section data is JSON; any mention of the id counts.
      d
        .selectDistinct({ id: s.pages.id, name: s.pages.title })
        .from(s.pageSections)
        .innerJoin(s.pages, eq(s.pages.id, s.pageSections.pageId))
        .where(sql`${s.pageSections.data}::text like ${`%${id}%`}`),
      d
        .select({ logo: s.siteSettings.logoId })
        .from(s.siteSettings)
        .where(or(eq(s.siteSettings.logoId, id), eq(s.siteSettings.defaultOgImageId, id))),
    ]);
  return [
    ...team.map((r) => ({ label: `Team: ${r.name}`, href: `/team/${r.id}` })),
    ...partners.map((r) => ({ label: `Partner: ${r.name}`, href: `/partners/${r.id}` })),
    ...services.map((r) => ({ label: `Service: ${r.name}`, href: `/services/${r.id}` })),
    ...listings.map((r) => ({ label: `Listing cover: ${r.name}`, href: `/listings/${r.id}` })),
    ...gallery.map((r) => ({ label: `Listing gallery: ${r.name}`, href: `/listings/${r.id}` })),
    ...posts.map((r) => ({ label: `Insight: ${r.name}`, href: `/insights/${r.id}` })),
    ...pages.map((r) => ({ label: `Page share image: ${r.name}`, href: `/pages/${r.id}` })),
    ...sections.map((r) => ({ label: `Page: ${r.name}`, href: `/pages/${r.id}` })),
    ...settings.map(() => ({ label: "Site settings (logo or share image)", href: "/settings" })),
  ];
}

import "server-only";
import { schema as s } from "@aa/db";
import { asc, eq } from "drizzle-orm";
import { db } from "./db";

export type NavRow = {
  id: string;
  menu: string;
  parentId: string | null;
  label: string;
  description: string | null;
  url: string | null;
  pageId: string | null;
  pageTitle: string | null;
  pageSlug: string | null;
  pageStatus: "draft" | "published" | null;
};

export async function navRows(): Promise<NavRow[]> {
  return db()
    .select({
      id: s.navItems.id,
      menu: s.navItems.menu,
      parentId: s.navItems.parentId,
      label: s.navItems.label,
      description: s.navItems.description,
      url: s.navItems.url,
      pageId: s.navItems.pageId,
      pageTitle: s.pages.title,
      pageSlug: s.pages.slug,
      pageStatus: s.pages.status,
    })
    .from(s.navItems)
    .leftJoin(s.pages, eq(s.pages.id, s.navItems.pageId))
    .orderBy(asc(s.navItems.sortOrder), asc(s.navItems.label));
}

/** Header first, then footer columns, then legal. */
export function menusOf(rows: NavRow[]) {
  const footer = [...new Set(rows.map((r) => r.menu).filter((m) => m.startsWith("footer:")))];
  return ["header", ...footer, "legal"];
}

export const menuLabel = (m: string) =>
  m === "header"
    ? "Header menu"
    : m === "legal"
      ? "Legal links (footer bottom)"
      : `Footer: ${m.slice(7)}`;

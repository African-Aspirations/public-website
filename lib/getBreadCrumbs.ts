// lib/getBreadcrumbs.ts

import { type NavItem, navigationItems } from "@/components/client-navbar";

export type Breadcrumb = { title: string; href?: string };

function normalizePath(p?: string) {
  if (!p) return "";
  // remove trailing slash for comparison
  return p.replace(/\/+$/, "");
}

/**
 * Recursively search navigation items and return breadcrumb trail or null
 */
export function getBreadcrumbTrail(pathname: string): Breadcrumb[] {
  const normalizedPath = normalizePath(pathname);

  function findPath(
    items: NavItem[],
    parentTrail: Breadcrumb[],
  ): Breadcrumb[] | null {
    for (const item of items) {
      const itemHrefBase = normalizePath(item.href?.split("#")[0]);
      const currentTrail = [
        ...parentTrail,
        {
          title: item.title,
          href: item.subItems?.length ? undefined : item.href,
        },
      ];

      // descend into children first so a more specific (deeper) match wins
      // over a parent whose own href happens to collide with a child's
      if (item.subItems && item.subItems.length > 0) {
        const childResult = findPath(item.subItems, currentTrail);
        if (childResult) return childResult;
      }

      // exact match (including top-level pages with no matching child)
      if (itemHrefBase && itemHrefBase === normalizedPath) {
        return currentTrail;
      }
    }
    return null;
  }

  const found = findPath(navigationItems, []);
  return found ?? [];
}

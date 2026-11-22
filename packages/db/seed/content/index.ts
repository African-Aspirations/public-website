import { advisoryPages } from "./pages-advisory";
import { consultingPages } from "./pages-consulting";
import { corePages } from "./pages-core";
import { newPages } from "./pages-new";
import { advisoryServices } from "./services-advisory";
import { listingCategories, mainServices, nav, partners, siteSettings, teamMembers } from "./site";

export const content = {
  siteSettings,
  nav,
  teamMembers,
  partners,
  listingCategories,
  services: [...mainServices, ...advisoryServices],
  pages: [...corePages, ...consultingPages, ...advisoryPages, ...newPages],
};
export type SeedContent = typeof content;

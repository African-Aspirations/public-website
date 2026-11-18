import type { Content } from "./content";

const site = () => import.meta.env.SITE as string;
const abs = (path: string) => new URL(path, site()).toString();

export function organizationLd(c: Content) {
  const s = c.settings;
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: s.orgName,
    url: abs("/"),
    ...(s.email && { email: s.email }),
    ...(s.phone && { telephone: s.phone }),
    ...(s.address && {
      address: { "@type": "PostalAddress", streetAddress: s.address, addressCountry: "GH" },
    }),
    sameAs: s.socials.map((x) => x.url),
  };
}

/** "business-consulting/advisory" → Home › Business Consulting › Advisory */
export function breadcrumbLd(c: Content, slug: string, title: string) {
  const parts = slug.split("/").filter(Boolean);
  const items = [{ name: "Home", path: "/" }];
  parts.forEach((_, i) => {
    const path = parts.slice(0, i + 1).join("/");
    const page = c.pages.find((p) => p.slug === path);
    items.push({ name: i === parts.length - 1 ? title : (page?.title ?? path), path: `/${path}` });
  });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

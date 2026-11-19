/**
 * Pages that did not exist on the legacy site. Copy here is a minimal
 * placeholder for the team to replace in the admin — flagged in `review`.
 */
import type { SeedPage } from "../types";

export const newPages: SeedPage[] = [
  {
    slug: "contact",
    title: "Contact",
    sections: [
      { type: "hero", data: { heading: "Contact us", imageIds: [] } },
      { type: "contact_form", data: {} },
    ],
    review: [
      "New page (replaces the external Fillout form all CTAs used to link to). Hero copy is a placeholder.",
    ],
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    template: "legal",
    noindex: true, // until the real text is supplied
    sections: [
      { type: "hero", data: { heading: "Privacy Policy", imageIds: [] } },
      { type: "rich_text", data: { body: "_Policy text to be supplied._" } },
    ],
    review: [
      "Legacy footer linked here but the page never existed. Published with noindex and placeholder text; needs real legal text.",
    ],
  },
  {
    slug: "terms-of-use",
    title: "Terms of Use",
    template: "legal",
    noindex: true, // until the real text is supplied
    sections: [
      { type: "hero", data: { heading: "Terms of Use", imageIds: [] } },
      { type: "rich_text", data: { body: "_Terms text to be supplied._" } },
    ],
    review: [
      "Legacy footer linked here but the page never existed. Published with noindex and placeholder text; needs real legal text.",
    ],
  },
];

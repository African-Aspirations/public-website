import { type SectionType, sectionSchemas } from "@aa/db/sections";

/**
 * Turns the zod section schemas (packages/db/src/sections.ts) into a plain,
 * serialisable form description for the admin's section editor. Add a field to
 * a schema and it appears in the editor; META only adds labels and hints.
 */
export type FieldSpec =
  | (Base<"text"> & { multiline: boolean; default?: string })
  | (Base<"select"> & {
      options: { value: string | number; label: string }[];
      default?: string | number;
    })
  | (Base<"boolean"> & { default: boolean })
  | (Base<"number"> & { min?: number; max?: number; default?: number })
  | (Base<"media"> & { multiple: boolean; max?: number })
  | Base<"partner">
  | (Base<"object"> & { fields: FieldSpec[] })
  | (Base<"list"> & { fields: FieldSpec[]; min: number; max?: number; itemLabel: string });

type Base<K extends string> = {
  kind: K;
  key: string;
  label: string;
  hint?: string;
  required: boolean;
};

export const SECTION_TYPES: Record<SectionType, { label: string; description: string }> = {
  hero: { label: "Hero", description: "The page heading (h1), intro, images and a button." },
  rich_text: {
    label: "Text",
    description: "Heading and text, optionally with an image or a side box.",
  },
  card_grid: { label: "Cards", description: "A grid or rows of cards with images and links." },
  steps: { label: "Steps", description: "Numbered steps or phases." },
  stats: { label: "Stats", description: "Big numbers with labels." },
  cta: {
    label: "Call to action",
    description: "A heading, text and a button, on a band or a photo.",
  },
  team: { label: "Team", description: "The team cards (edited under Team)." },
  partner: {
    label: "Partner",
    description: "A partner's logo, intro and stats (edited under Partners).",
  },
  faq: { label: "FAQs", description: "Questions and answers (edited under Services & FAQs)." },
  listings_teaser: { label: "Latest listings", description: "The newest published listings." },
  contact_form: { label: "Contact form", description: "The contact form." },
  newsletter_form: { label: "Newsletter form", description: "The newsletter signup form." },
};

type Meta = { label?: string; hint?: string; options?: Record<string, string> };

/** Labels and hints. Keys are "<type>.<field>" or just "<field>" for every type. */
const META: Record<string, Meta> = {
  eyebrow: { hint: "Small text above the heading." },
  intro: { hint: "A short paragraph under the heading." },
  body: {
    label: "Text",
    hint: "Markdown: blank line between paragraphs, **bold**, - lists, [link](/page).",
  },
  imageId: { label: "Image" },
  imageIds: { label: "Images", hint: "More than one becomes a carousel." },
  href: { label: "Link", hint: "/page, /page#section or https://…" },
  cta: { label: "Button" },
  label: { label: "Text" },
  "hero.heading": { hint: "The page's main heading (h1)." },
  "hero.accent": { hint: "Ends the heading in green." },
  "hero.variant": {
    label: "Style",
    options: {
      default: "Standard",
      collage: "Photo collage (About)",
      band: "Green band with photo",
    },
  },
  "hero.logoBanner": { label: "Show the large logo above the hero" },
  "hero.imageFrame": {
    label: "Show the image uncropped on a panel",
    hint: "For cut-out or shaped images (green band style).",
  },
  "hero.newsletter": { label: "Show the newsletter signup under the heading" },
  "rich_text.aside": { label: "Side box", hint: "A light green box beside the text." },
  "rich_text.imageSide": {
    label: "Image position",
    options: { left: "Left", right: "Right", below: "Below the text" },
  },
  "rich_text.variant": {
    label: "Style",
    options: { default: "Standard", diagonal: "Green panel with slanted edge" },
  },
  "rich_text.anchor": {
    label: "Anchor",
    hint: "Lets links jump here: lowercase-and-dashes, used as /page#anchor.",
  },
  "card_grid.columns": { label: "Columns" },
  "card_grid.variant": {
    label: "Style",
    options: {
      default: "Standard",
      feature: "Green cards with photo",
      tiles: "Text tiles on grey",
      rows: "Alternating rows",
    },
  },
  "card_grid.linkLabel": { label: "Link text", hint: "Shown on cards that have a link." },
  "card_grid.cards": { label: "Cards" },
  "card_grid.cards.items": { label: "Bullet points" },
  "steps.variant": {
    label: "Style",
    options: { default: "Standard", panel: "Cards on a green panel", band: "Green band" },
  },
  "steps.headingInPanel": { label: "Put the heading inside the green panel" },
  "steps.label": {
    label: "Step label",
    hint: "e.g. “Phase” shows PHASE 1, PHASE 2; empty shows 01, 02.",
  },
  "cta.imageSide": { label: "Image position", options: { left: "Left", right: "Right" } },
  "cta.imageMirror": { label: "Flip the image horizontally" },
  "cta.tone": {
    label: "Style",
    options: { band: "Light band", dark: "Dark (photo background)", box: "Bordered box" },
  },
  "cta.overlay": {
    label: "Photo darkening",
    options: { full: "Whole photo", fade: "Left side, fading out" },
    hint: "Dark style only.",
  },
  "partner.partnerId": { label: "Partner" },
  "partner.heading": { hint: "Defaults to the partner's name." },
  "partner.body": { hint: "Replaces the partner's description on this page only." },
  "partner.variant": { label: "Style", options: { default: "Side by side", boxed: "Centred box" } },
  "faq.topic": { hint: "Only show FAQs with this topic. Empty shows all." },
  "listings_teaser.limit": { label: "How many" },
};

const humanize = (k: string) =>
  k
    .replace(/Id$|Ids$/, "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

// biome-ignore lint/suspicious/noExplicitAny: walking zod's internal definition objects
type Def = any;
const defOf = (s: Def): Def => s.def ?? s._zod.def;

function unwrap(s: Def) {
  let d = defOf(s);
  let required = true;
  let dflt: unknown;
  while (d.type === "optional" || d.type === "default") {
    if (d.type === "optional") required = false;
    if (d.type === "default") {
      required = false;
      dflt = d.defaultValue;
    }
    d = defOf(d.innerType);
  }
  return { d, required, dflt };
}

const minLen = (d: Def) =>
  d.checks?.find((c: Def) => c._zod.def.check === "min_length")?._zod.def.minimum;
const maxLen = (d: Def) =>
  d.checks?.find((c: Def) => c._zod.def.check === "max_length")?._zod.def.maximum;

function field(path: string, key: string, schema: Def): FieldSpec {
  const meta = { ...META[key], ...META[path] };
  const { d, required: opt, dflt } = unwrap(schema);
  const strRequired = d.type === "string" && (minLen(d) > 0 || Boolean(d.format));
  const base = {
    key,
    label: meta.label ?? humanize(key),
    hint: meta.hint,
    required: opt && (d.type !== "string" || strRequired),
  };
  const isMedia = key === "imageId" || key === "imageIds";
  switch (d.type) {
    case "string":
      if (isMedia) return { ...base, kind: "media", multiple: false };
      if (key === "partnerId") return { ...base, kind: "partner" };
      return {
        ...base,
        kind: "text",
        multiline: ["body", "intro"].includes(key),
        default: dflt as string | undefined,
      };
    case "boolean":
      return { ...base, kind: "boolean", default: Boolean(dflt) };
    case "number": {
      const c = (name: string) =>
        d.checks?.find((x: Def) => x._zod.def.check === name)?._zod.def.value;
      return {
        ...base,
        kind: "number",
        min: c("greater_than"),
        max: c("less_than"),
        default: dflt as number,
      };
    }
    case "enum":
      return {
        ...base,
        kind: "select",
        default: dflt as string,
        options: Object.values(d.entries as Record<string, string>).map((v) => ({
          value: v,
          label: meta.options?.[v] ?? humanize(v),
        })),
      };
    case "union":
      return {
        ...base,
        kind: "select",
        default: dflt as number,
        options: d.options.map((o: Def) => {
          const v = defOf(o).values[0];
          return { value: v, label: String(v) };
        }),
      };
    case "object":
      return { ...base, kind: "object", fields: fieldsOf(path, defOf(schema).shape ?? d.shape) };
    case "array": {
      const el = unwrap(d.element).d;
      if (isMedia) return { ...base, kind: "media", multiple: true, max: maxLen(d) };
      return {
        ...base,
        kind: "list",
        min: minLen(d) ?? 0,
        max: maxLen(d),
        itemLabel: (meta.label ?? humanize(key)).replace(/s$/, ""),
        fields: fieldsOf(path, el.shape),
      };
    }
    default:
      throw new Error(`section-spec: unsupported zod type ${d.type} at ${path}`);
  }
}

function fieldsOf(prefix: string, shape: Record<string, Def>): FieldSpec[] {
  return Object.entries(shape).map(([k, v]) => field(`${prefix}.${k}`, k, v));
}

export function sectionSpec(type: SectionType): FieldSpec[] {
  return fieldsOf(type, defOf(sectionSchemas[type]).shape);
}

/** One-line description of a section for lists. */
export function sectionSummary(type: SectionType, data: Record<string, unknown>) {
  const s = (v: unknown) => (typeof v === "string" ? v : "");
  const cards = Array.isArray(data.cards) ? data.cards.length : 0;
  const steps = Array.isArray(data.steps) ? data.steps.length : 0;
  const head = s(data.heading) || s(data.eyebrow);
  const extra = cards ? `${cards} cards` : steps ? `${steps} steps` : "";
  const text = [head, extra].filter(Boolean).join(" · ");
  return text || (type === "rich_text" ? s(data.body).slice(0, 80) : "");
}

/** Starting values for a new object from the spec's defaults (lists with a minimum get one item). */
export function initialData(fields: FieldSpec[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if ("default" in f && f.default !== undefined) out[f.key] = f.default;
    if (f.kind === "list" && f.min > 0) out[f.key] = [initialData(f.fields)];
    if (f.kind === "object" && f.required) out[f.key] = initialData(f.fields);
  }
  return out;
}

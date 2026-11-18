import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ---------- shared columns ----------
const id = () => uuid("id").primaryKey().defaultRandom();
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const publishStatus = pgEnum("publish_status", ["draft", "published"]);
export const leadStatus = pgEnum("lead_status", ["new", "contacted", "closed"]);
export const subscriberStatus = pgEnum("subscriber_status", [
  "pending",
  "confirmed",
  "unsubscribed",
]);
export const staffRole = pgEnum("staff_role", ["admin", "editor"]);
export const sectionType = pgEnum("section_type", [
  "hero",
  "rich_text",
  "card_grid",
  "steps",
  "stats",
  "cta",
  "team",
  "partner",
  "faq",
  "listings_teaser",
  "contact_form",
  "newsletter_form",
]);
export const pageTemplate = pgEnum("page_template", ["default", "home", "legal"]);

// ---------- media (Cloudinary references — no files stored here) ----------
export const media = pgTable("media", {
  id: id(),
  publicId: text("public_id").notNull().unique(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  format: text("format").notNull(),
  alt: text("alt").notNull(),
  credit: text("credit"),
  ...timestamps,
});

// ---------- site-wide ----------
export const siteSettings = pgTable("site_settings", {
  // single row, enforced by check-free PK = 1
  id: smallint("id").primaryKey().default(1),
  orgName: text("org_name").notNull(),
  tagline: text("tagline"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  socials: jsonb("socials").$type<{ label: string; url: string }[]>().notNull().default([]),
  defaultSeoTitle: text("default_seo_title").notNull(),
  defaultSeoDescription: text("default_seo_description").notNull(),
  defaultOgImageId: uuid("default_og_image_id").references(() => media.id),
  logoId: uuid("logo_id").references(() => media.id),
  ctaLabel: text("cta_label"),
  ctaUrl: text("cta_url"),
  ...timestamps,
});

export const pages = pgTable("pages", {
  id: id(),
  slug: text("slug").notNull().unique(), // "" = home
  title: text("title").notNull(),
  template: pageTemplate("template").notNull().default("default"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImageId: uuid("og_image_id").references(() => media.id),
  noindex: boolean("noindex").notNull().default(false),
  status: publishStatus("status").notNull().default("draft"),
  ...timestamps,
});

export const pageSections = pgTable(
  "page_sections",
  {
    id: id(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    type: sectionType("type").notNull(),
    // validated per-type by zod schemas in ./sections.ts
    data: jsonb("data").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    status: publishStatus("status").notNull().default("published"),
    ...timestamps,
  },
  (t) => [index("page_sections_page_idx").on(t.pageId, t.sortOrder)],
);

export const navItems = pgTable("nav_items", {
  id: id(),
  menu: text("menu").notNull(), // "header" | "footer:<column>"
  parentId: uuid("parent_id"),
  label: text("label").notNull(),
  description: text("description"),
  pageId: uuid("page_id").references(() => pages.id, { onDelete: "set null" }),
  url: text("url"), // external link when pageId is null
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const redirects = pgTable("redirects", {
  id: id(),
  fromPath: text("from_path").notNull().unique(),
  toPath: text("to_path").notNull(),
  statusCode: smallint("status_code").notNull().default(301),
  ...timestamps,
});

// ---------- reusable content ----------
export const services = pgTable("services", {
  id: id(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  body: text("body"),
  imageId: uuid("image_id").references(() => media.id),
  pageId: uuid("page_id").references(() => pages.id, { onDelete: "set null" }),
  parentId: uuid("parent_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  status: publishStatus("status").notNull().default("draft"),
  ...timestamps,
});

export const serviceFeatures = pgTable("service_features", {
  id: id(),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const teamMembers = pgTable("team_members", {
  id: id(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  credentials: text("credentials"),
  summary: text("summary"),
  bio: text("bio"),
  photoId: uuid("photo_id").references(() => media.id),
  linkedinUrl: text("linkedin_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  status: publishStatus("status").notNull().default("draft"),
  ...timestamps,
});

export const partners = pgTable("partners", {
  id: id(),
  name: text("name").notNull(),
  description: text("description"),
  url: text("url"),
  logoId: uuid("logo_id").references(() => media.id),
  stats: jsonb("stats").$type<{ value: string; label: string }[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  status: publishStatus("status").notNull().default("draft"),
  ...timestamps,
});

export const faqs = pgTable("faqs", {
  id: id(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  topic: text("topic"),
  sortOrder: integer("sort_order").notNull().default(0),
  status: publishStatus("status").notNull().default("draft"),
  ...timestamps,
});

export const posts = pgTable("posts", {
  id: id(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  body: text("body").notNull(), // markdown
  coverId: uuid("cover_id").references(() => media.id),
  authorId: uuid("author_id").references(() => teamMembers.id, { onDelete: "set null" }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  status: publishStatus("status").notNull().default("draft"),
  ...timestamps,
});

// ---------- listings ----------
export const listingCategories = pgTable("listing_categories", {
  id: id(),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const listings = pgTable(
  "listings",
  {
    id: id(),
    legacyId: text("legacy_id").unique(), // old UUID, for 301s from /listings/<uuid>
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    summary: text("summary"),
    description: text("description").notNull(),
    categoryId: uuid("category_id").references(() => listingCategories.id, {
      onDelete: "set null",
    }),
    location: text("location"),
    region: text("region"),
    price: numeric("price", { precision: 14, scale: 2 }),
    currency: text("currency").notNull().default("USD"),
    sde: numeric("sde", { precision: 14, scale: 2 }),
    downPayment: numeric("down_payment", { precision: 14, scale: 2 }),
    coverId: uuid("cover_id").references(() => media.id),
    featured: boolean("featured").notNull().default(false),
    status: publishStatus("status").notNull().default("draft"),
    ...timestamps,
  },
  (t) => [index("listings_status_idx").on(t.status, t.createdAt)],
);

export const listingImages = pgTable("listing_images", {
  id: id(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  mediaId: uuid("media_id")
    .notNull()
    .references(() => media.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---------- leads ----------
export const contactMessages = pgTable("contact_messages", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  topic: text("topic"),
  message: text("message").notNull(),
  status: leadStatus("status").notNull().default("new"),
  ...timestamps,
});

export const listingInquiries = pgTable("listing_inquiries", {
  id: id(),
  listingId: uuid("listing_id").references(() => listings.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  status: leadStatus("status").notNull().default("new"),
  ...timestamps,
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: id(),
  email: text("email").notNull().unique(),
  status: subscriberStatus("status").notNull().default("pending"),
  confirmToken: text("confirm_token"),
  resendContactId: text("resend_contact_id"),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  ...timestamps,
});

export const rateLimits = pgTable(
  "rate_limits",
  {
    ipHash: text("ip_hash").notNull(),
    route: text("route").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(1),
  },
  (t) => [uniqueIndex("rate_limits_key").on(t.ipHash, t.route, t.windowStart)],
);

// ---------- staff (identity lives in Firebase Auth) ----------
export const staff = pgTable("staff", {
  id: id(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: staffRole("role").notNull().default("editor"),
  disabledAt: timestamp("disabled_at", { withTimezone: true }),
  ...timestamps,
});

export const auditLog = pgTable(
  "audit_log",
  {
    id: id(),
    firebaseUid: text("firebase_uid").notNull(),
    action: text("action").notNull(), // create | update | delete | publish | invite ...
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    diff: jsonb("diff"),
    at: timestamp("at", { withTimezone: true }).notNull().default(sql`now()`),
  },
  (t) => [index("audit_log_at_idx").on(t.at)],
);

import { schema as s } from "@aa/db";
import { asc, desc, eq } from "drizzle-orm";
import { Star } from "lucide-react";
import Link from "next/link";
import { FilterChips } from "@/components/filter-chips";
import { ActionForm, Field } from "@/components/form";
import { EmptyState, ListHeader } from "@/components/list";
import { DeleteButton, MoveButtons } from "@/components/row-actions";
import { StatusBadge } from "@/components/status-badge";
import { Thumb } from "@/components/thumb";
import { Input } from "@/components/ui/input";
import { UrlTabs } from "@/components/url-tabs";
import { deleteCategory, moveCategory, saveCategory } from "@/lib/actions/listings";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { thumb } from "@/lib/media";

export const metadata = { title: "Listings" };

const money = (v: string | null, cur: string) => {
  if (!v) return "Price on request";
  try {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(Number(v));
  } catch {
    return `${cur} ${v}`;
  }
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; status?: string }>;
}) {
  await requireStaff();
  const q = await searchParams;
  const tab = q.tab === "categories" ? "categories" : "listings";
  return (
    <div className="max-w-5xl">
      <ListHeader
        title="Listings"
        description="Businesses for sale. Published listings get their own page and appear in the listings browser."
        addHref={tab === "listings" ? "/listings/new" : undefined}
        addLabel="New listing"
      />
      <UrlTabs
        base="/listings"
        current={tab}
        tabs={[
          { id: "listings", label: "Listings" },
          { id: "categories", label: "Categories" },
        ]}
      />
      {tab === "listings" ? <Listings status={q.status} /> : <Categories />}
    </div>
  );
}

async function Listings({ status }: { status?: string }) {
  const st = status === "draft" || status === "published" ? status : "all";
  const rows = await db()
    .select({
      id: s.listings.id,
      name: s.listings.name,
      slug: s.listings.slug,
      price: s.listings.price,
      currency: s.listings.currency,
      featured: s.listings.featured,
      status: s.listings.status,
      location: s.listings.location,
      category: s.listingCategories.label,
      publicId: s.media.publicId,
    })
    .from(s.listings)
    .leftJoin(s.listingCategories, eq(s.listingCategories.id, s.listings.categoryId))
    .leftJoin(s.media, eq(s.media.id, s.listings.coverId))
    .where(st === "all" ? undefined : eq(s.listings.status, st))
    .orderBy(desc(s.listings.createdAt));
  return (
    <>
      <FilterChips
        label="Status"
        current={st}
        href={(id) => (id === "all" ? "/listings" : `/listings?status=${id}`)}
        options={[
          { id: "all", label: "All" },
          { id: "published", label: "Published" },
          { id: "draft", label: "Drafts" },
        ]}
      />
      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState>
            No listings{st !== "all" ? " here" : " yet. Add the first one with “New listing”"}.
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-4 divide-y overflow-hidden rounded-xl border bg-background">
          {rows.map((l) => (
            <li key={l.id}>
              <Link
                href={`/listings/${l.id}`}
                className="flex items-center gap-3 px-3 py-2 hover:bg-secondary"
              >
                <Thumb
                  {...(l.publicId ? thumb(l.publicId, 160) : {})}
                  alt=""
                  className="h-12 w-16 shrink-0 rounded-md"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 truncate font-medium">
                    {l.featured && (
                      <Star
                        className="size-3.5 shrink-0 fill-gold text-gold"
                        aria-label="Featured"
                      />
                    )}
                    {l.name}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {[l.category, l.location].filter(Boolean).join(" · ") || "—"}
                  </span>
                </span>
                <span className="hidden text-sm font-medium sm:block">
                  {money(l.price, l.currency)}
                </span>
                <StatusBadge status={l.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

async function Categories() {
  const rows = await db()
    .select()
    .from(s.listingCategories)
    .orderBy(asc(s.listingCategories.sortOrder), asc(s.listingCategories.label));
  return (
    <div className="grid gap-6">
      <p className="text-sm text-muted-foreground">
        Sectors used to filter listings on the site, in this order.
      </p>
      {rows.length > 0 && (
        <ul className="divide-y overflow-hidden rounded-xl border bg-background">
          {rows.map((c, i) => (
            <li key={c.id} className="px-3 py-2">
              <details>
                <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
                  <MoveButtons
                    onMove={moveCategory.bind(null, c.id)}
                    first={i === 0}
                    last={i === rows.length - 1}
                    label={c.label}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{c.label}</span>
                    <span className="block text-xs text-muted-foreground">{c.slug}</span>
                  </span>
                  <span className="text-xs text-primary">Edit</span>
                </summary>
                <ActionForm
                  action={saveCategory.bind(null, c.id)}
                  className="mt-3 border-t pt-4"
                  footer={
                    <DeleteButton
                      onDelete={deleteCategory.bind(null, c.id)}
                      what={`the category “${c.label}” (its listings become uncategorised)`}
                    />
                  }
                >
                  <CategoryFields label={c.label} slug={c.slug} description={c.description} />
                </ActionForm>
              </details>
            </li>
          ))}
        </ul>
      )}
      <section className="rounded-xl border bg-background p-5">
        <h2 className="mb-4 font-semibold">Add a category</h2>
        <ActionForm action={saveCategory.bind(null, null)} submitLabel="Add category">
          <CategoryFields />
        </ActionForm>
      </section>
    </div>
  );
}

function CategoryFields({
  label,
  slug,
  description,
}: {
  label?: string;
  slug?: string;
  description?: string | null;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Name">
        <Input name="label" defaultValue={label} required maxLength={80} />
      </Field>
      <Field label="Slug" hint="Leave empty to make one from the name.">
        <Input name="slug" defaultValue={slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" />
      </Field>
      <Field label="Description" className="sm:col-span-2">
        <Input name="description" defaultValue={description ?? ""} maxLength={400} />
      </Field>
    </div>
  );
}

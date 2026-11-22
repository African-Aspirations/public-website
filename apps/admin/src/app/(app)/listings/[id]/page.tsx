import { schema as s } from "@aa/db";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, Field, Select, StatusField } from "@/components/form";
import { GalleryPicker } from "@/components/gallery-picker";
import { MediaPicker } from "@/components/media-picker";
import { DeleteButton } from "@/components/row-actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteListing, saveListing } from "@/lib/actions/listings";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { CURRENCIES } from "@/lib/listing-options";
import { mediaOptions } from "@/lib/media";

export const metadata = { title: "Listing" };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const isNew = id === "new";
  if (!isNew && !UUID.test(id)) notFound();
  const [l] = isNew
    ? []
    : await db().select().from(s.listings).where(eq(s.listings.id, id)).limit(1);
  if (!isNew && !l) notFound();
  const [media, categories, gallery] = await Promise.all([
    mediaOptions(),
    db().select().from(s.listingCategories).orderBy(asc(s.listingCategories.sortOrder)),
    l
      ? db()
          .select({ id: s.listingImages.mediaId })
          .from(s.listingImages)
          .where(eq(s.listingImages.listingId, l.id))
          .orderBy(asc(s.listingImages.sortOrder))
      : Promise.resolve([]),
  ]);
  const amount = (name: string, label: string, v?: string | null, hint?: string) => (
    <Field label={label} hint={hint}>
      <Input
        name={name}
        defaultValue={v ? String(Number(v)) : ""}
        inputMode="decimal"
        placeholder="e.g. 250000"
      />
    </Field>
  );

  return (
    <div className="grid max-w-3xl gap-6">
      <Link
        href="/listings"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Listings
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{l ? l.name : "New listing"}</h1>
        {l?.status === "published" && (
          <a
            href={`${env().SITE_URL}/listings/${l.slug}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View on site
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        )}
      </div>
      <ActionForm
        action={saveListing.bind(null, l?.id ?? null)}
        submitLabel={l ? "Save changes" : "Add listing"}
        className="rounded-xl border bg-background p-5 sm:p-6"
        footer={
          l && (
            <DeleteButton
              onDelete={deleteListing.bind(null, l.id)}
              what={`the listing “${l.name}”`}
            />
          )
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Business name">
            <Input name="name" defaultValue={l?.name} required maxLength={160} />
          </Field>
          <Field label="URL" hint="/listings/… Leave empty to make one from the name.">
            <Input name="slug" defaultValue={l?.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" />
          </Field>
        </div>
        <Field label="Summary" hint="One or two sentences for the listing card.">
          <Textarea
            name="summary"
            defaultValue={l?.summary ?? ""}
            maxLength={400}
            className="min-h-20"
          />
        </Field>
        <Field label="Description" hint="Markdown. The full write-up on the listing's page.">
          <Textarea
            name="description"
            defaultValue={l?.description}
            required
            className="min-h-56 font-mono text-sm"
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Sector">
            <Select name="categoryId" defaultValue={l?.categoryId ?? ""}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Location" hint="e.g. East Legon, Accra">
            <Input name="location" defaultValue={l?.location ?? ""} maxLength={160} />
          </Field>
          <Field label="Region" hint="Shown on the card, e.g. Greater Accra">
            <Input name="region" defaultValue={l?.region ?? ""} maxLength={80} />
          </Field>
        </div>
        <fieldset className="grid gap-5 rounded-lg border p-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-medium">Financials</legend>
          <Field label="Currency">
            <Select name="currency" defaultValue={l?.currency ?? "USD"}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          {amount("price", "Asking price", l?.price, "Empty shows “Price on request”.")}
          {amount("downPayment", "Down payment", l?.downPayment)}
          {amount("sde", "SDE", l?.sde, "Seller's discretionary earnings.")}
        </fieldset>
        <MediaPicker name="coverId" label="Cover photo" media={media} value={l?.coverId} />
        <GalleryPicker
          name="galleryIds"
          label="Gallery"
          media={media}
          value={gallery.map((g) => g.id)}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <StatusField value={l?.status ?? "draft"} />
          <label className="flex items-center gap-3 self-center text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={l?.featured}
              className="size-4 accent-primary"
            />
            Featured (shown first)
          </label>
        </div>
      </ActionForm>
    </div>
  );
}

import { type SectionType, schema as s } from "@aa/db";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, Field, Select } from "@/components/form";
import { MediaPicker } from "@/components/media-picker";
import { DeleteButton, MoveButtons } from "@/components/row-actions";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deletePage, moveSection, savePage } from "@/lib/actions/pages";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { mediaOptions } from "@/lib/media";
import { SECTION_TYPES, sectionSummary } from "@/lib/section-spec";

export const metadata = { title: "Page" };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function PageEditor({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const isNew = id === "new";
  if (!isNew && !UUID.test(id)) notFound();
  const [page] = isNew ? [] : await db().select().from(s.pages).where(eq(s.pages.id, id)).limit(1);
  if (!isNew && !page) notFound();
  const [sections, media] = await Promise.all([
    page
      ? db()
          .select()
          .from(s.pageSections)
          .where(eq(s.pageSections.pageId, page.id))
          .orderBy(asc(s.pageSections.sortOrder))
      : Promise.resolve([]),
    mediaOptions(),
  ]);
  const isHome = page?.template === "home";

  return (
    <div className="grid max-w-4xl gap-8">
      <div className="grid gap-2">
        <Link
          href="/pages"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Pages
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">{page ? page.title : "New page"}</h1>
          {page && (
            <a
              href={`${env().SITE_URL}/${page.slug}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View on site
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          )}
        </div>
      </div>

      {page && (
        <section aria-labelledby="sections" className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="sections" className="text-lg font-semibold">
              Sections
            </h2>
            <AddSection pageId={page.id} />
          </div>
          {sections.length === 0 ? (
            <p className="rounded-xl border border-dashed bg-background px-6 py-10 text-center text-sm text-muted-foreground">
              No sections yet. Add a Hero first: it holds the page heading.
            </p>
          ) : (
            <ol className="divide-y overflow-hidden rounded-xl border bg-background">
              {sections.map((sec, i) => (
                <li key={sec.id} className="flex items-center gap-3 px-3 py-2 hover:bg-secondary">
                  <MoveButtons
                    onMove={moveSection.bind(null, page.id, sec.id)}
                    first={i === 0}
                    last={i === sections.length - 1}
                    label={SECTION_TYPES[sec.type].label}
                  />
                  <Link href={`/pages/${page.id}/sections/${sec.id}`} className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">
                      {SECTION_TYPES[sec.type].label}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {sectionSummary(sec.type, sec.data as Record<string, unknown>) || "—"}
                    </span>
                  </Link>
                  {sec.status === "draft" && <StatusBadge status="draft" />}
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      <section aria-labelledby="settings" className="grid gap-3">
        <h2 id="settings" className="text-lg font-semibold">
          {page ? "Page settings" : "Details"}
        </h2>
        <ActionForm
          action={savePage.bind(null, page?.id ?? null)}
          submitLabel={page ? "Save settings" : "Create page"}
          className="rounded-xl border bg-background p-5 sm:p-6"
          footer={
            page &&
            !isHome && (
              <DeleteButton
                onDelete={deletePage.bind(null, page.id)}
                what={`the page “${page.title}” and its sections`}
              />
            )
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Title" hint="Used in the admin, menus and breadcrumbs.">
              <Input name="title" defaultValue={page?.title} required maxLength={160} />
            </Field>
            <Field
              label="URL"
              hint={
                isHome
                  ? "The home page is always /."
                  : "e.g. business-valuation, or business-consulting/advisory"
              }
            >
              <div className="flex items-center rounded-md border border-input bg-background pl-3 text-sm text-muted-foreground focus-within:outline-2 focus-within:outline-ring">
                /
                <Input
                  name="slug"
                  defaultValue={page?.slug}
                  disabled={isHome}
                  required={!isHome}
                  className="border-0 pl-0.5 focus-visible:outline-none"
                />
              </div>
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Template">
              <Select name="template" defaultValue={page?.template ?? "default"} disabled={isHome}>
                <option value="default">Standard</option>
                <option value="legal">Legal (long text)</option>
                <option value="listings">Listings (with the listings browser)</option>
                {isHome && <option value="home">Home</option>}
              </Select>
            </Field>
            <Field label="Status" hint="Draft pages aren't built, and their menu links are hidden.">
              <Select name="status" defaultValue={page?.status ?? "draft"}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Select>
            </Field>
          </div>
          <fieldset className="grid gap-5 rounded-lg border p-4">
            <legend className="px-1 text-sm font-medium">Search & sharing</legend>
            <Field label="SEO title" hint="Up to ~60 characters. Defaults to the page title.">
              <Input name="seoTitle" defaultValue={page?.seoTitle ?? ""} maxLength={70} />
            </Field>
            <Field
              label="SEO description"
              hint="Up to ~160 characters, shown under the title in search results."
            >
              <Textarea
                name="seoDescription"
                defaultValue={page?.seoDescription ?? ""}
                maxLength={170}
                className="min-h-20"
              />
            </Field>
            <MediaPicker
              name="ogImageId"
              label="Share image"
              media={media}
              value={page?.ogImageId}
            />
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="noindex"
                defaultChecked={page?.noindex}
                className="size-4 accent-primary"
              />
              Hide from search engines (noindex)
            </label>
          </fieldset>
        </ActionForm>
      </section>
    </div>
  );
}

function AddSection({ pageId }: { pageId: string }) {
  return (
    <details className="relative">
      <summary className="inline-flex h-8 cursor-pointer list-none items-center gap-1.5 rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover [&::-webkit-details-marker]:hidden">
        <Plus className="size-4" />
        Add section
      </summary>
      <ul className="absolute right-0 z-20 mt-2 grid w-80 gap-1 rounded-xl border bg-popover p-2 shadow-lg">
        {(Object.keys(SECTION_TYPES) as SectionType[]).map((t) => (
          <li key={t}>
            <Link
              href={`/pages/${pageId}/sections/new?type=${t}`}
              className="grid rounded-md px-3 py-2 hover:bg-secondary"
            >
              <span className="text-sm font-medium">{SECTION_TYPES[t].label}</span>
              <span className="text-xs text-muted-foreground">{SECTION_TYPES[t].description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

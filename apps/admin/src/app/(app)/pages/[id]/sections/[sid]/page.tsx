import { type SectionType, schema as s, sectionSchemas } from "@aa/db";
import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, Field, Select } from "@/components/form";
import { DeleteButton } from "@/components/row-actions";
import { SectionFields } from "@/components/section-fields";
import { deleteSection, saveSection } from "@/lib/actions/pages";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaOptions } from "@/lib/media";
import { initialData, SECTION_TYPES, sectionSpec } from "@/lib/section-spec";

export const metadata = { title: "Section" };

const UUID = /^[0-9a-f-]{36}$/i;
const NOTE: Partial<Record<SectionType, { text: string; href: string }>> = {
  team: { text: "The cards themselves are edited under Team.", href: "/team" },
  partner: {
    text: "The logo, description and stats are edited under Partners.",
    href: "/partners",
  },
  faq: { text: "Questions are edited under Services & FAQs.", href: "/services?tab=faqs" },
  listings_teaser: { text: "Listings are edited under Listings.", href: "/listings" },
};

export default async function SectionEditor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; sid: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  await requireStaff();
  const { id, sid } = await params;
  if (!UUID.test(id)) notFound();
  const [page] = await db()
    .select({ id: s.pages.id, title: s.pages.title })
    .from(s.pages)
    .where(eq(s.pages.id, id))
    .limit(1);
  if (!page) notFound();
  const isNew = sid === "new";
  if (!isNew && !UUID.test(sid)) notFound();
  const [sec] = isNew
    ? []
    : await db()
        .select()
        .from(s.pageSections)
        .where(and(eq(s.pageSections.id, sid), eq(s.pageSections.pageId, page.id)))
        .limit(1);
  if (!isNew && !sec) notFound();
  const askedType = (await searchParams).type ?? "";
  const type = (sec?.type ?? askedType) as SectionType;
  if (!(type in sectionSchemas)) notFound();

  const fields = sectionSpec(type);
  const [media, partners] = await Promise.all([
    mediaOptions(),
    db()
      .select({ id: s.partners.id, name: s.partners.name })
      .from(s.partners)
      .orderBy(asc(s.partners.sortOrder)),
  ]);
  // Existing data with schema defaults filled in, so every control has a value.
  const parsed = sec ? sectionSchemas[type].safeParse(sec.data) : null;
  const initial = parsed?.success
    ? (parsed.data as Record<string, unknown>)
    : ((sec?.data as Record<string, unknown>) ?? initialData(fields));
  const note = NOTE[type];

  return (
    <div className="grid max-w-3xl gap-6">
      <Link
        href={`/pages/${page.id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {page.title}
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">
          {isNew ? "New " : ""}
          {SECTION_TYPES[type].label} section
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {SECTION_TYPES[type].description}{" "}
          {note && (
            <Link href={note.href} className="text-primary hover:underline">
              {note.text}
            </Link>
          )}
        </p>
      </div>
      <ActionForm
        action={saveSection.bind(null, page.id, sec?.id ?? null, type)}
        submitLabel={isNew ? "Add section" : "Save section"}
        className="rounded-xl border bg-background p-5 sm:p-6"
        footer={
          sec && (
            <DeleteButton
              onDelete={deleteSection.bind(null, page.id, sec.id)}
              what={`this ${SECTION_TYPES[type].label} section`}
            />
          )
        }
      >
        <SectionFields fields={fields} initial={initial} ctx={{ media, partners }} />
        <Field label="Visibility" className="max-w-sm">
          <Select name="status" defaultValue={sec?.status ?? "published"}>
            <option value="published">Shown on the page</option>
            <option value="draft">Hidden (draft)</option>
          </Select>
        </Field>
      </ActionForm>
    </div>
  );
}

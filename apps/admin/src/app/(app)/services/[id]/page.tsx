import { schema as s } from "@aa/db";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, Field, Select, StatusField } from "@/components/form";
import { MediaPicker } from "@/components/media-picker";
import { Repeater } from "@/components/repeater";
import { DeleteButton } from "@/components/row-actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteService, saveService } from "@/lib/actions/services";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaOptions } from "@/lib/media";

export const metadata = { title: "Service" };

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const isNew = id === "new";
  const [svc] = isNew
    ? []
    : await db().select().from(s.services).where(eq(s.services.id, id)).limit(1);
  if (!isNew && !svc) notFound();
  const [media, pages, others, features] = await Promise.all([
    mediaOptions(),
    db()
      .select({ id: s.pages.id, title: s.pages.title, slug: s.pages.slug })
      .from(s.pages)
      .orderBy(asc(s.pages.title)),
    db()
      .select({ id: s.services.id, title: s.services.title, parentId: s.services.parentId })
      .from(s.services)
      .orderBy(asc(s.services.title)),
    svc
      ? db()
          .select()
          .from(s.serviceFeatures)
          .where(eq(s.serviceFeatures.serviceId, svc.id))
          .orderBy(asc(s.serviceFeatures.sortOrder))
      : Promise.resolve([]),
  ]);
  // Only top-level services can be parents (one level of nesting).
  const parents = others.filter((o) => o.id !== svc?.id && !o.parentId);

  return (
    <div className="grid max-w-3xl gap-6">
      <Link
        href="/services"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Services
      </Link>
      <h1 className="text-2xl font-semibold">{svc ? svc.title : "New service"}</h1>
      <ActionForm
        action={saveService.bind(null, svc?.id ?? null)}
        submitLabel={svc ? "Save changes" : "Add service"}
        className="rounded-xl border bg-background p-5 sm:p-6"
        footer={
          svc && <DeleteButton onDelete={deleteService.bind(null, svc.id)} what={svc.title} />
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title">
            <Input name="title" defaultValue={svc?.title} required maxLength={160} />
          </Field>
          <Field label="Slug" hint="Used in links. Leave empty to make one from the title.">
            <Input name="slug" defaultValue={svc?.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" />
          </Field>
        </div>
        <Field label="Summary" hint="One or two sentences for cards and menus.">
          <Textarea
            name="summary"
            defaultValue={svc?.summary}
            required
            maxLength={1000}
            className="min-h-20"
          />
        </Field>
        <Field label="Body" hint="Optional longer text. Markdown.">
          <Textarea
            name="body"
            defaultValue={svc?.body ?? ""}
            className="min-h-32 font-mono text-sm"
          />
        </Field>
        <MediaPicker name="imageId" media={media} value={svc?.imageId} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Page" hint="The page this service links to.">
            <Select name="pageId" defaultValue={svc?.pageId ?? ""}>
              <option value="">None</option>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (/{p.slug})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Part of" hint="Nest under another service.">
            <Select name="parentId" defaultValue={svc?.parentId ?? ""}>
              <option value="">Top level</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid gap-2 text-sm">
          <span className="font-medium">Features</span>
          <Repeater
            addLabel="Add feature"
            cols={[
              { name: "featureTitle", label: "Title" },
              { name: "featureDescription", label: "Description", multiline: true },
            ]}
            initial={features.map((f) => ({
              featureTitle: f.title,
              featureDescription: f.description ?? "",
            }))}
          />
        </div>
        <StatusField value={svc?.status} />
      </ActionForm>
    </div>
  );
}

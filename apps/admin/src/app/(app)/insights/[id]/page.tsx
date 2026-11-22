import { schema as s } from "@aa/db";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, Field, Select, StatusField } from "@/components/form";
import { MediaPicker } from "@/components/media-picker";
import { DeleteButton } from "@/components/row-actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deletePost, savePost } from "@/lib/actions/posts";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaOptions } from "@/lib/media";

export const metadata = { title: "Post" };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const isNew = id === "new";
  if (!isNew && !UUID.test(id)) notFound();
  const [p] = isNew ? [] : await db().select().from(s.posts).where(eq(s.posts.id, id)).limit(1);
  if (!isNew && !p) notFound();
  const [media, team] = await Promise.all([
    mediaOptions(),
    db()
      .select({ id: s.teamMembers.id, name: s.teamMembers.name })
      .from(s.teamMembers)
      .orderBy(asc(s.teamMembers.sortOrder)),
  ]);
  return (
    <div className="grid max-w-3xl gap-6">
      <Link
        href="/insights"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Insights
      </Link>
      <h1 className="text-2xl font-semibold">{p ? p.title : "New post"}</h1>
      <ActionForm
        action={savePost.bind(null, p?.id ?? null)}
        submitLabel={p ? "Save changes" : "Add post"}
        className="rounded-xl border bg-background p-5 sm:p-6"
        footer={
          p && (
            <DeleteButton onDelete={deletePost.bind(null, p.id)} what={`the post “${p.title}”`} />
          )
        }
      >
        <Field label="Title">
          <Input name="title" defaultValue={p?.title} required maxLength={200} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="URL slug" hint="Leave empty to make one from the title.">
            <Input name="slug" defaultValue={p?.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" />
          </Field>
          <Field label="Date" hint="Publishing without a date uses today.">
            <Input
              name="publishedAt"
              type="date"
              defaultValue={p?.publishedAt?.toISOString().slice(0, 10) ?? ""}
            />
          </Field>
        </div>
        <Field label="Excerpt" hint="One or two sentences for lists and sharing.">
          <Textarea
            name="excerpt"
            defaultValue={p?.excerpt ?? ""}
            maxLength={400}
            className="min-h-20"
          />
        </Field>
        <Field
          label="Body"
          hint="Markdown: ## headings, blank lines between paragraphs, **bold**, - lists, [links](https://…)."
        >
          <Textarea
            name="body"
            defaultValue={p?.body}
            required
            className="min-h-96 font-mono text-sm"
          />
        </Field>
        <MediaPicker name="coverId" label="Cover image" media={media} value={p?.coverId} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Author">
            <Select name="authorId" defaultValue={p?.authorId ?? ""}>
              <option value="">African Aspirations</option>
              {team.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <StatusField value={p?.status ?? "draft"} />
        </div>
        <fieldset className="grid gap-5 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">Search & sharing</legend>
          <Field label="SEO title" hint="Defaults to the title.">
            <Input name="seoTitle" defaultValue={p?.seoTitle ?? ""} maxLength={70} />
          </Field>
          <Field label="SEO description" hint="Defaults to the excerpt.">
            <Textarea
              name="seoDescription"
              defaultValue={p?.seoDescription ?? ""}
              maxLength={170}
              className="min-h-20"
            />
          </Field>
        </fieldset>
      </ActionForm>
    </div>
  );
}

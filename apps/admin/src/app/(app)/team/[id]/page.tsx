import { schema as s } from "@aa/db";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, Field, StatusField } from "@/components/form";
import { MediaPicker } from "@/components/media-picker";
import { DeleteButton } from "@/components/row-actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteMember, saveMember } from "@/lib/actions/team";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaOptions } from "@/lib/media";

export const metadata = { title: "Team member" };

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const isNew = id === "new";
  const [m] = isNew
    ? []
    : await db().select().from(s.teamMembers).where(eq(s.teamMembers.id, id)).limit(1);
  if (!isNew && !m) notFound();
  const media = await mediaOptions();

  return (
    <div className="grid max-w-3xl gap-6">
      <Link
        href="/team"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Team
      </Link>
      <h1 className="text-2xl font-semibold">{m ? m.name : "New team member"}</h1>
      <ActionForm
        action={saveMember.bind(null, m?.id ?? null)}
        submitLabel={m ? "Save changes" : "Add member"}
        className="rounded-xl border bg-background p-5 sm:p-6"
        footer={m && <DeleteButton onDelete={deleteMember.bind(null, m.id)} what={m.name} />}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name">
            <Input name="name" defaultValue={m?.name} required maxLength={120} />
          </Field>
          <Field label="Credentials" hint="Shown after the name, e.g. CFA, MBA">
            <Input name="credentials" defaultValue={m?.credentials ?? ""} maxLength={80} />
          </Field>
        </div>
        <Field label="Role">
          <Input name="role" defaultValue={m?.role} required maxLength={160} />
        </Field>
        <MediaPicker name="photoId" label="Photo" media={media} value={m?.photoId} />
        <Field label="Summary" hint="One or two sentences, shown in green above the bio.">
          <Textarea
            name="summary"
            defaultValue={m?.summary ?? ""}
            maxLength={600}
            className="min-h-20"
          />
        </Field>
        <Field label="Bio" hint="Markdown: blank line between paragraphs, **bold**, - lists.">
          <Textarea name="bio" defaultValue={m?.bio ?? ""} className="min-h-72 font-mono text-sm" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="LinkedIn URL">
            <Input
              name="linkedinUrl"
              type="url"
              defaultValue={m?.linkedinUrl ?? ""}
              placeholder="https://www.linkedin.com/in/…"
            />
          </Field>
          <StatusField value={m?.status} />
        </div>
      </ActionForm>
    </div>
  );
}

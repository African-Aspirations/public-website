import { schema as s } from "@aa/db";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, Field, StatusField } from "@/components/form";
import { MediaPicker } from "@/components/media-picker";
import { Repeater } from "@/components/repeater";
import { DeleteButton } from "@/components/row-actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deletePartner, savePartner } from "@/lib/actions/partners";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaOptions } from "@/lib/media";

export const metadata = { title: "Partner" };

export default async function PartnerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const isNew = id === "new";
  const [p] = isNew
    ? []
    : await db().select().from(s.partners).where(eq(s.partners.id, id)).limit(1);
  if (!isNew && !p) notFound();
  const media = await mediaOptions();

  return (
    <div className="grid max-w-3xl gap-6">
      <Link
        href="/partners"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Partners
      </Link>
      <h1 className="text-2xl font-semibold">{p ? p.name : "New partner"}</h1>
      <ActionForm
        action={savePartner.bind(null, p?.id ?? null)}
        submitLabel={p ? "Save changes" : "Add partner"}
        className="rounded-xl border bg-background p-5 sm:p-6"
        footer={p && <DeleteButton onDelete={deletePartner.bind(null, p.id)} what={p.name} />}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name">
            <Input name="name" defaultValue={p?.name} required maxLength={160} />
          </Field>
          <Field label="Website">
            <Input name="url" type="url" defaultValue={p?.url ?? ""} placeholder="https://" />
          </Field>
        </div>
        <MediaPicker name="logoId" label="Logo" media={media} value={p?.logoId} />
        <Field
          label="Description"
          hint="Markdown. The first paragraph is the intro next to the logo; the rest runs underneath."
        >
          <Textarea
            name="description"
            defaultValue={p?.description ?? ""}
            className="min-h-48 font-mono text-sm"
          />
        </Field>
        <div className="grid gap-2 text-sm">
          <span className="font-medium">Stats</span>
          <span className="text-xs text-muted-foreground">
            Shown large under the logo, e.g. “40+” / “Years in business”.
          </span>
          <Repeater
            addLabel="Add stat"
            max={6}
            cols={[
              { name: "statValue", label: "Value", placeholder: "40+" },
              { name: "statLabel", label: "Label", placeholder: "Years in business" },
            ]}
            initial={(p?.stats ?? []).map((x) => ({ statValue: x.value, statLabel: x.label }))}
          />
        </div>
        <StatusField value={p?.status} />
      </ActionForm>
    </div>
  );
}

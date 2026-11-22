import { schema as s } from "@aa/db";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, Field, StatusField } from "@/components/form";
import { DeleteButton } from "@/components/row-actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteFaq, saveFaq } from "@/lib/actions/services";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "FAQ" };

export default async function FaqPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const isNew = id === "new";
  const [f] = isNew ? [] : await db().select().from(s.faqs).where(eq(s.faqs.id, id)).limit(1);
  if (!isNew && !f) notFound();
  return (
    <div className="grid max-w-3xl gap-6">
      <Link
        href="/services?tab=faqs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        FAQs
      </Link>
      <h1 className="text-2xl font-semibold">{f ? "Edit FAQ" : "New FAQ"}</h1>
      <ActionForm
        action={saveFaq.bind(null, f?.id ?? null)}
        submitLabel={f ? "Save changes" : "Add FAQ"}
        className="rounded-xl border bg-background p-5 sm:p-6"
        footer={f && <DeleteButton onDelete={deleteFaq.bind(null, f.id)} what="this FAQ" />}
      >
        <Field label="Question">
          <Input name="question" defaultValue={f?.question} required maxLength={300} />
        </Field>
        <Field label="Answer" hint="Markdown.">
          <Textarea name="answer" defaultValue={f?.answer} required className="min-h-40" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Topic" hint="Optional grouping, e.g. Selling, Buying.">
            <Input name="topic" defaultValue={f?.topic ?? ""} maxLength={80} />
          </Field>
          <StatusField value={f?.status} />
        </div>
      </ActionForm>
    </div>
  );
}

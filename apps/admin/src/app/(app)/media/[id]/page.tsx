import { schema as s } from "@aa/db";
import { eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, Field } from "@/components/form";
import { DeleteButton } from "@/components/row-actions";
import { Thumb } from "@/components/thumb";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteMedia, updateMedia } from "@/lib/actions/media";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { thumb } from "@/lib/media";
import { mediaUsage } from "@/lib/media-usage";

export const metadata = { title: "Image" };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function MediaItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ inuse?: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [m] = await db().select().from(s.media).where(eq(s.media.id, id)).limit(1);
  if (!m) notFound();
  const [usage, { inuse }] = await Promise.all([mediaUsage(m.id), searchParams]);
  const big = thumb(m.publicId, 1200);

  return (
    <div className="grid max-w-5xl gap-6">
      <Link
        href="/media"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Media
      </Link>
      {inuse && (
        <Alert variant="destructive">
          This image is still in use. Replace it where it's used, then delete it.
        </Alert>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="grid content-start gap-3">
          <Thumb
            {...big}
            alt={m.alt}
            style={{ aspectRatio: `${m.width} / ${m.height}` }}
            className="max-h-[70dvh] w-full rounded-xl border bg-background object-contain"
          />
          <dl className="grid grid-cols-[7rem_1fr] gap-2 text-sm">
            <dt className="text-muted-foreground">Size</dt>
            <dd>
              {m.width}×{m.height} px · {m.format.toUpperCase()}
            </dd>
            <dt className="text-muted-foreground">Cloudinary ID</dt>
            <dd className="font-mono text-xs break-all">{m.publicId}</dd>
            <dt className="text-muted-foreground">Added</dt>
            <dd>{formatDateTime(m.createdAt)}</dd>
            <dt className="text-muted-foreground">Original</dt>
            <dd>
              <a
                href={big.src}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Open
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </dd>
          </dl>
        </div>
        <div className="grid content-start gap-6">
          <ActionForm
            action={updateMedia.bind(null, m.id)}
            submitLabel="Save"
            className="rounded-xl border bg-background p-5"
            footer={
              usage.length === 0 && (
                <DeleteButton
                  onDelete={deleteMedia.bind(null, m.id)}
                  what="this image (also from Cloudinary)"
                />
              )
            }
          >
            <Field
              label="Alt text"
              hint="What the image shows, for screen readers and search engines."
            >
              <Textarea
                name="alt"
                defaultValue={m.alt}
                required
                maxLength={300}
                className="min-h-24"
              />
            </Field>
            <Field label="Credit">
              <Input name="credit" defaultValue={m.credit ?? ""} maxLength={200} />
            </Field>
          </ActionForm>
          <section className="rounded-xl border bg-background p-5 text-sm">
            <h2 className="mb-3 font-medium">Used in</h2>
            {usage.length === 0 ? (
              <p className="text-muted-foreground">Not used anywhere. It can be deleted.</p>
            ) : (
              <ul className="grid gap-2">
                {usage.map((u) => (
                  <li key={u.label}>
                    <Link href={u.href} className="text-primary hover:underline">
                      {u.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

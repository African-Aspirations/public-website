import { schema as s } from "@aa/db";
import { desc, ilike } from "drizzle-orm";
import { Search } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/list";
import { Thumb } from "@/components/thumb";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Uploader } from "@/components/uploader";
import { requireStaff } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { thumb } from "@/lib/media";

export const metadata = { title: "Media" };

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireStaff();
  const q = ((await searchParams).q ?? "").trim();
  const rows = await db()
    .select()
    .from(s.media)
    .where(q ? ilike(s.media.alt, `%${q.replace(/[%_\\]/g, "\\$&")}%`) : undefined)
    .orderBy(desc(s.media.createdAt));
  const ready = cloudinary() !== null;
  return (
    <div className="max-w-6xl">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Media</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Images used across the site. Pick them from any editor; every image needs alt text.
          </p>
        </div>
        {ready && <Uploader />}
      </header>
      {!ready && (
        <Alert className="mb-6">
          Uploads are off: set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET
          for the admin.
        </Alert>
      )}
      <form className="relative mb-4 max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search alt text…"
          aria-label="Search images"
          className="pl-9"
        />
      </form>
      {rows.length === 0 ? (
        <EmptyState>{q ? "No images match." : "No images yet."}</EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {rows.map((m) => (
            <li key={m.id}>
              <Link
                href={`/media/${m.id}`}
                className="group grid gap-2 rounded-xl border bg-background p-2 hover:border-ring"
              >
                <Thumb
                  {...thumb(m.publicId, 360)}
                  alt={m.alt}
                  className="aspect-square w-full rounded-lg bg-muted object-contain"
                />
                <span className="line-clamp-2 px-1 text-xs">
                  {m.alt || <em className="text-muted-foreground">Decorative (no alt text)</em>}
                </span>
                <span className="px-1 pb-1 text-[0.6875rem] text-muted-foreground">
                  {m.width}×{m.height} · {m.format.toUpperCase()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

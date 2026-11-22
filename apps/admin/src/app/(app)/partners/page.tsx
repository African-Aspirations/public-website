import { schema as s } from "@aa/db";
import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { EmptyState, ListHeader } from "@/components/list";
import { MoveButtons } from "@/components/row-actions";
import { StatusBadge } from "@/components/status-badge";
import { Thumb } from "@/components/thumb";
import { movePartner } from "@/lib/actions/partners";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { thumb } from "@/lib/media";

export const metadata = { title: "Partners" };

export default async function PartnersPage() {
  await requireStaff();
  const rows = await db()
    .select({
      id: s.partners.id,
      name: s.partners.name,
      stats: s.partners.stats,
      status: s.partners.status,
      publicId: s.media.publicId,
    })
    .from(s.partners)
    .leftJoin(s.media, eq(s.media.id, s.partners.logoId))
    .orderBy(asc(s.partners.sortOrder), asc(s.partners.name));
  return (
    <div className="max-w-4xl">
      <ListHeader
        title="Partners"
        description="Global partners with their logo and headline stats (About and Brokerage pages)."
        addHref="/partners/new"
        addLabel="Add partner"
      />
      {rows.length === 0 ? (
        <EmptyState>No partners yet.</EmptyState>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-background">
          {rows.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-secondary">
              <MoveButtons
                onMove={movePartner.bind(null, p.id)}
                first={i === 0}
                last={i === rows.length - 1}
                label={p.name}
              />
              <Link href={`/partners/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <Thumb
                  {...(p.publicId ? thumb(p.publicId, 160) : {})}
                  alt=""
                  className="h-10 w-20 shrink-0 rounded bg-white object-contain p-1"
                />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.name}</span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {p.stats.map((x) => `${x.value} ${x.label}`).join(" · ") || "No stats"}
                  </span>
                </span>
              </Link>
              <StatusBadge status={p.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

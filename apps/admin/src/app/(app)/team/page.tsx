import { schema as s } from "@aa/db";
import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { EmptyState, ListHeader } from "@/components/list";
import { MoveButtons } from "@/components/row-actions";
import { StatusBadge } from "@/components/status-badge";
import { Thumb } from "@/components/thumb";
import { moveMember } from "@/lib/actions/team";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { thumb } from "@/lib/media";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  await requireStaff();
  const rows = await db()
    .select({
      id: s.teamMembers.id,
      name: s.teamMembers.name,
      role: s.teamMembers.role,
      status: s.teamMembers.status,
      publicId: s.media.publicId,
    })
    .from(s.teamMembers)
    .leftJoin(s.media, eq(s.media.id, s.teamMembers.photoId))
    .orderBy(asc(s.teamMembers.sortOrder), asc(s.teamMembers.name));
  return (
    <div className="max-w-4xl">
      <ListHeader
        title="Team"
        description="Leadership on the About page, in this order. Click a member to edit their bio."
        addHref="/team/new"
        addLabel="Add member"
      />
      {rows.length === 0 ? (
        <EmptyState>No team members yet.</EmptyState>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-background">
          {rows.map((m, i) => (
            <li key={m.id} className="flex items-center gap-3 px-3 py-2 hover:bg-secondary">
              <MoveButtons
                onMove={moveMember.bind(null, m.id)}
                first={i === 0}
                last={i === rows.length - 1}
                label={m.name}
              />
              <Link href={`/team/${m.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <Thumb
                  {...(m.publicId ? thumb(m.publicId, 96) : {})}
                  alt=""
                  className="size-11 shrink-0 rounded-full"
                />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{m.name}</span>
                  <span className="block truncate text-sm text-muted-foreground">{m.role}</span>
                </span>
              </Link>
              <StatusBadge status={m.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

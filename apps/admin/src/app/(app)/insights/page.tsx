import { schema as s } from "@aa/db";
import { desc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { EmptyState, ListHeader } from "@/components/list";
import { StatusBadge } from "@/components/status-badge";
import { Thumb } from "@/components/thumb";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { thumb } from "@/lib/media";

export const metadata = { title: "Insights" };

export default async function InsightsPage() {
  await requireStaff();
  const rows = await db()
    .select({
      id: s.posts.id,
      title: s.posts.title,
      excerpt: s.posts.excerpt,
      status: s.posts.status,
      publishedAt: s.posts.publishedAt,
      author: s.teamMembers.name,
      publicId: s.media.publicId,
    })
    .from(s.posts)
    .leftJoin(s.teamMembers, eq(s.teamMembers.id, s.posts.authorId))
    .leftJoin(s.media, eq(s.media.id, s.posts.coverId))
    .orderBy(sql`${s.posts.publishedAt} desc nulls first`, desc(s.posts.createdAt));
  return (
    <div className="max-w-5xl">
      <ListHeader
        title="Insights"
        description="Articles and news for Media & Insights."
        addHref="/insights/new"
        addLabel="New post"
      />
      {rows.length === 0 ? (
        <EmptyState>No posts yet. Write the first one with “New post”.</EmptyState>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-background">
          {rows.map((p) => (
            <li key={p.id}>
              <Link
                href={`/insights/${p.id}`}
                className="flex items-center gap-3 px-3 py-2 hover:bg-secondary"
              >
                <Thumb
                  {...(p.publicId ? thumb(p.publicId, 160) : {})}
                  alt=""
                  className="h-12 w-16 shrink-0 rounded-md"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{p.title}</span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {[p.publishedAt && formatDateTime(p.publishedAt).split(",")[0], p.author]
                      .filter(Boolean)
                      .join(" · ") ||
                      p.excerpt ||
                      "—"}
                  </span>
                </span>
                <StatusBadge status={p.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

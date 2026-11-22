import { schema as s } from "@aa/db";
import { asc, count, eq } from "drizzle-orm";
import Link from "next/link";
import { ListHeader } from "@/components/list";
import { StatusBadge } from "@/components/status-badge";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { timeAgo } from "@/lib/format";

export const metadata = { title: "Pages" };

const TEMPLATE: Record<string, string> = {
  home: "Home",
  legal: "Legal",
  listings: "Listings",
  default: "",
};

export default async function PagesPage() {
  await requireStaff();
  const rows = await db()
    .select({
      id: s.pages.id,
      title: s.pages.title,
      slug: s.pages.slug,
      template: s.pages.template,
      status: s.pages.status,
      updatedAt: s.pages.updatedAt,
      sections: count(s.pageSections.id),
    })
    .from(s.pages)
    .leftJoin(s.pageSections, eq(s.pageSections.pageId, s.pages.id))
    .groupBy(s.pages.id)
    .orderBy(asc(s.pages.slug));
  return (
    <div className="max-w-5xl">
      <ListHeader
        title="Pages"
        description="Every page of the public site. Open one to edit its sections, title and search settings."
        addHref="/pages/new"
        addLabel="New page"
      />
      <ul className="divide-y overflow-hidden rounded-xl border bg-background">
        {rows.map((p) => (
          <li key={p.id}>
            <Link
              href={`/pages/${p.id}`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-secondary"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {p.title}
                  {TEMPLATE[p.template] && (
                    <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                      {TEMPLATE[p.template]}
                    </span>
                  )}
                </span>
                <span className="block truncate text-sm text-muted-foreground">/{p.slug}</span>
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                {p.sections} sections · {timeAgo(p.updatedAt)}
              </span>
              <StatusBadge status={p.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

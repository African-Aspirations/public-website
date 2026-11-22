import { Inbox } from "lucide-react";
import Link from "next/link";
import { FilterChips } from "@/components/filter-chips";
import { PageHeader } from "@/components/page-header";
import { Pager } from "@/components/pager";
import { StatusBadge } from "@/components/status-badge";
import { UrlTabs } from "@/components/url-tabs";
import { requireStaff } from "@/lib/auth";
import { newEnquiries } from "@/lib/counts";
import { isStatus, type Kind, listEnquiries, PAGE_SIZE } from "@/lib/enquiries";
import { timeAgo } from "@/lib/format";

export const metadata = { title: "Enquiries" };

const FILTERS = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "closed", label: "Closed" },
  { id: "all", label: "All" },
];

type Search = { tab?: string; status?: string; page?: string };

export default async function Enquiries({ searchParams }: { searchParams: Promise<Search> }) {
  await requireStaff();
  const q = await searchParams;
  const kind: Kind = q.tab === "contact" ? "contact" : "listing";
  const status = isStatus(q.status) || q.status === "all" ? q.status : "new";
  const page = Math.max(1, Number.parseInt(q.page ?? "1", 10) || 1);
  const [counts, { rows, total }] = await Promise.all([
    newEnquiries(),
    listEnquiries(kind, status, page),
  ]);

  const url = (p: { status?: string; page?: number }) => {
    const sp = new URLSearchParams();
    if (kind === "contact") sp.set("tab", "contact");
    if ((p.status ?? status) !== "new") sp.set("status", p.status ?? status);
    if (p.page && p.page > 1) sp.set("page", String(p.page));
    const s = sp.toString();
    return s ? `/enquiries?${s}` : "/enquiries";
  };

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Enquiries"
        description="People who reached out from a listing or the contact page. Each one already got an automatic reply by email."
      />
      <UrlTabs
        base="/enquiries"
        current={kind === "contact" ? "contact" : "listings"}
        tabs={[
          { id: "listings", label: "Listings", badge: counts.listings },
          { id: "contact", label: "Contact", badge: counts.contact },
        ]}
      />
      <FilterChips
        label="Status"
        options={FILTERS}
        current={status}
        href={(id) => url({ status: id })}
      />

      {rows.length === 0 ? (
        <div className="mt-4 grid place-items-center gap-2 rounded-xl border border-dashed bg-background px-6 py-16 text-center text-sm text-muted-foreground">
          <Inbox className="size-6" aria-hidden />
          {status === "new" ? "Nothing new. You're all caught up." : "No enquiries here."}
        </div>
      ) : (
        <ul className="mt-4 divide-y overflow-hidden rounded-xl border bg-background">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/enquiries/${kind}/${r.id}`}
                className="grid gap-1 px-4 py-3 hover:bg-secondary sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] sm:items-center sm:gap-4"
              >
                <span className="min-w-0">
                  <span className={`block truncate ${r.status === "new" ? "font-semibold" : ""}`}>
                    {r.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{r.email}</span>
                </span>
                <span className="min-w-0 text-sm">
                  {r.about && <span className="mr-2 font-medium text-primary">{r.about}</span>}
                  <span className="text-muted-foreground">{r.message.slice(0, 140)}</span>
                </span>
                <span className="flex items-center gap-3 sm:justify-end">
                  <StatusBadge status={r.status} />
                  <time
                    dateTime={r.createdAt.toISOString()}
                    className="text-xs whitespace-nowrap text-muted-foreground"
                  >
                    {timeAgo(r.createdAt)}
                  </time>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Pager page={page} pageSize={PAGE_SIZE} total={total} href={(p) => url({ page: p })} />
    </div>
  );
}

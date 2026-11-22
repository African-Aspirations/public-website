import { buttonVariants, cn } from "@aa/ui/recipes";
import { Download, Mail } from "lucide-react";
import { FilterChips } from "@/components/filter-chips";
import { PageHeader } from "@/components/page-header";
import { Pager } from "@/components/pager";
import { StatusBadge } from "@/components/status-badge";
import { requireStaff } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { isSubStatus, listSubscribers, subscriberCounts } from "@/lib/subscribers";

export const metadata = { title: "Subscribers" };

const PAGE_SIZE = 50;

export default async function Subscribers({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  await requireStaff();
  const q = await searchParams;
  const status = isSubStatus(q.status) || q.status === "all" ? q.status : "confirmed";
  const page = Math.max(1, Number.parseInt(q.page ?? "1", 10) || 1);
  const [counts, { rows, total }] = await Promise.all([
    subscriberCounts(),
    listSubscribers(status, page, PAGE_SIZE),
  ]);
  const url = (p: { status?: string; page?: number }) => {
    const sp = new URLSearchParams();
    if ((p.status ?? status) !== "confirmed") sp.set("status", p.status ?? status);
    if (p.page && p.page > 1) sp.set("page", String(p.page));
    const s = sp.toString();
    return s ? `/subscribers?${s}` : "/subscribers";
  };
  const opt = (id: "confirmed" | "pending" | "unsubscribed" | "all", label: string) => ({
    id,
    label: `${label} (${counts[id] ?? 0})`,
  });

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Subscribers"
        description="Newsletter sign-ups. People confirm by email before they count; newsletters are sent from Resend."
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterChips
          label="Status"
          current={status}
          href={(id) => url({ status: id })}
          options={[
            opt("confirmed", "Confirmed"),
            opt("pending", "Pending"),
            opt("unsubscribed", "Unsubscribed"),
            opt("all", "All"),
          ]}
        />
        <a
          href={`/subscribers/export?status=${status}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          download
        >
          <Download className="size-4" aria-hidden />
          Export CSV
        </a>
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 grid place-items-center gap-2 rounded-xl border border-dashed bg-background px-6 py-16 text-center text-sm text-muted-foreground">
          <Mail className="size-6" aria-hidden />
          No subscribers here yet.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border bg-background">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Signed up</th>
                <th className="px-4 py-2 font-medium">Confirmed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.email} className="border-b last:border-0">
                  <td className="px-4 py-2">{r.email}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{formatDateTime(r.createdAt)}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {r.confirmedAt ? formatDateTime(r.confirmedAt) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={page} pageSize={PAGE_SIZE} total={total} href={(p) => url({ page: p })} />
    </div>
  );
}

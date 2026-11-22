import { schema as s } from "@aa/db";
import { asc } from "drizzle-orm";
import Link from "next/link";
import { EmptyState, ListHeader } from "@/components/list";
import { MoveButtons } from "@/components/row-actions";
import { StatusBadge } from "@/components/status-badge";
import { UrlTabs } from "@/components/url-tabs";
import { moveFaq, moveService } from "@/lib/actions/services";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata = { title: "Services & FAQs" };

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireStaff();
  const tab = (await searchParams).tab === "faqs" ? "faqs" : "services";
  return (
    <div className="max-w-4xl">
      {tab === "services" ? (
        <ListHeader
          title="Services & FAQs"
          description="Services shown in cards and menus, with their features."
          addHref="/services/new"
          addLabel="Add service"
        />
      ) : (
        <ListHeader
          title="Services & FAQs"
          description="Frequently asked questions, in this order."
          addHref="/services/faqs/new"
          addLabel="Add FAQ"
        />
      )}
      <UrlTabs
        base="/services"
        current={tab}
        tabs={[
          { id: "services", label: "Services" },
          { id: "faqs", label: "FAQs" },
        ]}
      />
      {tab === "services" ? <Services /> : <Faqs />}
    </div>
  );
}

async function Services() {
  const rows = await db()
    .select({
      id: s.services.id,
      title: s.services.title,
      summary: s.services.summary,
      parentId: s.services.parentId,
      status: s.services.status,
    })
    .from(s.services)
    .orderBy(asc(s.services.sortOrder), asc(s.services.title));
  if (!rows.length) return <EmptyState>No services yet.</EmptyState>;
  const top = rows.filter((r) => !r.parentId || !rows.some((p) => p.id === r.parentId));
  const kids = (id: string) => rows.filter((r) => r.parentId === id);
  return (
    <ul className="divide-y overflow-hidden rounded-xl border bg-background">
      {top.map((r, i) => {
        const c = kids(r.id);
        return [
          <ServiceRow key={r.id} r={r} i={i} count={top.length} />,
          ...c.map((k, j) => <ServiceRow key={k.id} r={k} i={j} count={c.length} child />),
        ];
      })}
    </ul>
  );
}

async function Faqs() {
  const rows = await db()
    .select()
    .from(s.faqs)
    .orderBy(asc(s.faqs.sortOrder), asc(s.faqs.question));
  if (!rows.length) return <EmptyState>No FAQs yet.</EmptyState>;
  return (
    <ul className="divide-y overflow-hidden rounded-xl border bg-background">
      {rows.map((f, i) => (
        <li key={f.id} className="flex items-center gap-3 px-3 py-2 hover:bg-secondary">
          <MoveButtons
            onMove={moveFaq.bind(null, f.id)}
            first={i === 0}
            last={i === rows.length - 1}
            label={f.question}
          />
          <Link href={`/services/faqs/${f.id}`} className="min-w-0 flex-1">
            <span className="block truncate font-medium">{f.question}</span>
            {f.topic && (
              <span className="block truncate text-sm text-muted-foreground">{f.topic}</span>
            )}
          </Link>
          <StatusBadge status={f.status} />
        </li>
      ))}
    </ul>
  );
}

type ServiceItem = { id: string; title: string; summary: string; status: "draft" | "published" };

function ServiceRow({
  r,
  i,
  count,
  child,
}: {
  r: ServiceItem;
  i: number;
  count: number;
  child?: boolean;
}) {
  return (
    <li className={cn("flex items-center gap-3 px-3 py-2 hover:bg-secondary", child && "pl-10")}>
      <MoveButtons
        onMove={moveService.bind(null, r.id)}
        first={i === 0}
        last={i === count - 1}
        label={r.title}
      />
      <Link href={`/services/${r.id}`} className="min-w-0 flex-1">
        <span className="block truncate font-medium">{r.title}</span>
        <span className="block truncate text-sm text-muted-foreground">{r.summary}</span>
      </Link>
      <StatusBadge status={r.status} />
    </li>
  );
}

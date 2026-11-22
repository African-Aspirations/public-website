import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireStaff } from "@/lib/auth";
import { overviewCounts } from "@/lib/counts";

export const metadata = { title: "Overview" };

export default async function Overview({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const me = await requireStaff();
  const { denied } = await searchParams;
  const c = await overviewCounts();
  const stats = [
    {
      label: "New enquiries",
      value: c.enquiries.total,
      hint: `${c.enquiries.listings} on listings · ${c.enquiries.contact} from the contact form`,
      href: "/enquiries",
    },
    {
      label: "Subscribers",
      value: c.subscribers,
      hint: "Confirmed newsletter subscribers",
      href: "/subscribers",
    },
    { label: "Draft pages", value: c.drafts, hint: "Not on the live site yet", href: "/pages" },
  ];
  return (
    <div className="grid max-w-5xl gap-6">
      <PageHeader title={`Welcome${me.name ? `, ${me.name.split(" ")[0]}` : ""}`} />
      {denied && <Alert variant="destructive">That screen is for super admins only.</Alert>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-xl hover:[&>div]:border-ring">
            <Card className="h-full gap-2 transition-colors">
              <CardHeader>
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-3xl text-primary">{s.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">{s.hint}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

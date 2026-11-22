import { schema } from "@aa/db";
import { asc } from "drizzle-orm";
import { cookies } from "next/headers";
import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UrlTabs } from "@/components/url-tabs";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { isTheme, THEME_COOKIE } from "@/lib/theme";
import { Appearance } from "./appearance";

export const metadata = { title: "Settings" };

const ROLE = { super_admin: "Super admin", admin: "Admin" } as const;

export default async function Settings({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const me = await requireStaff();
  const isSuper = me.role === "super_admin";
  const tabs = [
    { id: "account", label: "Account" },
    { id: "appearance", label: "Appearance" },
    ...(isSuper
      ? [
          { id: "users", label: "Users" },
          { id: "redirects", label: "Redirects" },
        ]
      : []),
  ];
  const asked = (await searchParams).tab;
  const tab = tabs.find((t) => t.id === asked)?.id ?? "account";
  if (asked && asked !== tab) await requireStaff("super_admin"); // a hidden tab opened by URL

  return (
    <div className="max-w-4xl">
      <PageHeader title="Settings" />
      <UrlTabs base="/settings" current={tab} tabs={tabs} />
      {tab === "account" && <Account name={me.name} email={me.email} role={ROLE[me.role]} />}
      {tab === "appearance" && <AppearanceTab />}
      {tab === "users" && <Users />}
      {tab === "redirects" && (
        <ComingSoon
          what="Send old URLs to new ones (301/302), applied on the next publish."
          phase="a later phase"
        />
      )}
    </div>
  );
}

function Account({ name, email, role }: { name: string | null; email: string; role: string }) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear in the admin.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_1fr]">
            <dt className="text-muted-foreground">Name</dt>
            <dd>{name ?? "—"}</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd>{email}</dd>
            <dt className="text-muted-foreground">Role</dt>
            <dd>{role}</dd>
          </dl>
        </CardContent>
      </Card>
      <ComingSoon
        what="Change your password, and set up an authenticator app (required for super admins)."
        phase="phase 7"
      />
    </div>
  );
}

async function AppearanceTab() {
  const saved = (await cookies()).get(THEME_COOKIE)?.value;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>System follows your device&apos;s light or dark setting.</CardDescription>
      </CardHeader>
      <CardContent>
        <Appearance initial={isTheme(saved) ? saved : "system"} />
      </CardContent>
    </Card>
  );
}

async function Users() {
  await requireStaff("super_admin");
  const staff = await db()
    .select({
      email: schema.staff.email,
      name: schema.staff.name,
      role: schema.staff.role,
      disabledAt: schema.staff.disabledAt,
    })
    .from(schema.staff)
    .orderBy(asc(schema.staff.createdAt));
  return (
    <Card>
      <CardHeader className="sm:grid-cols-[1fr_auto]">
        <div className="grid gap-1.5">
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Who can sign in to the admin. Invites arrive in phase 7.
          </CardDescription>
        </div>
        <Button disabled size="sm" className="justify-self-start sm:row-span-2 sm:self-start">
          Invite user
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="text-muted-foreground">
            <tr className="border-b">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Role</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.email} className="border-b last:border-0">
                <td className="py-2 pr-4">{s.name ?? "—"}</td>
                <td className="py-2 pr-4">{s.email}</td>
                <td className="py-2 pr-4">{ROLE[s.role]}</td>
                <td className="py-2">{s.disabledAt ? "Disabled" : "Active"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

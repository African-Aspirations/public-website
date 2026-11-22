import { schema as s } from "@aa/db";
import { asc, desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { ActionForm, Field, Select } from "@/components/form";
import { MfaPanel } from "@/components/mfa-panel";
import { PageHeader } from "@/components/page-header";
import { StaffActions } from "@/components/staff-actions";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UrlTabs } from "@/components/url-tabs";
import { changePassword } from "@/lib/actions/account";
import { deleteRedirect, saveRedirect } from "@/lib/actions/redirects";
import { inviteStaff } from "@/lib/actions/staff";
import { mfaMissing, requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { adminAuth } from "@/lib/firebase-admin";
import { formatDateTime, timeAgo } from "@/lib/format";
import { isTheme, THEME_COOKIE } from "@/lib/theme";
import { Appearance } from "./appearance";
import { DeleteRedirect } from "./delete-redirect";

export const metadata = { title: "Settings" };

const ROLE = { super_admin: "Super admin", admin: "Admin" } as const;

export default async function Settings({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; mfa?: string }>;
}) {
  const me = await requireStaff(undefined, { allowWithoutMfa: true });
  const locked = mfaMissing(me); // super admin who still has to set up / use the authenticator
  const isSuper = me.role === "super_admin" && !locked;
  const tabs = [
    { id: "account", label: "Account" },
    ...(locked ? [] : [{ id: "appearance", label: "Appearance" }]),
    ...(isSuper
      ? [
          { id: "users", label: "Users" },
          { id: "redirects", label: "Redirects" },
          { id: "activity", label: "Activity" },
        ]
      : []),
  ];
  const q = await searchParams;
  const tab = tabs.find((t) => t.id === q.tab)?.id ?? "account";
  if (q.tab && q.tab !== tab && !locked) await requireStaff("super_admin"); // hidden tab opened by URL

  return (
    <div className="max-w-4xl">
      <PageHeader title="Settings" />
      {locked && (
        <Alert variant="destructive" className="mb-6">
          Super admins must sign in with an authenticator app. Set it up below (or, if it's already
          set up, sign out and back in with your code) to use the rest of the admin.
        </Alert>
      )}
      <UrlTabs base="/settings" current={tab} tabs={tabs} />
      {tab === "account" && <Account me={me} />}
      {tab === "appearance" && <AppearanceTab />}
      {tab === "users" && <Users meUid={me.uid} />}
      {tab === "redirects" && <Redirects />}
      {tab === "activity" && <Activity />}
    </div>
  );
}

async function Account({ me }: { me: Awaited<ReturnType<typeof requireStaff>> }) {
  const user = await adminAuth().getUser(me.uid);
  const enrolled = (user.multiFactor?.enrolledFactors.length ?? 0) > 0;
  const required = me.role === "super_admin" && env().ADMIN_REQUIRE_MFA === "true";
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_1fr]">
            <dt className="text-muted-foreground">Name</dt>
            <dd>{me.name ?? "—"}</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd>{me.email}</dd>
            <dt className="text-muted-foreground">Role</dt>
            <dd>{ROLE[me.role]}</dd>
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Authenticator app</CardTitle>
          <CardDescription>A 6-digit code from your phone at every sign-in.</CardDescription>
        </CardHeader>
        <CardContent>
          <MfaPanel email={me.email} enrolled={enrolled} required={required} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            You'll be signed out everywhere and sign in again with the new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActionForm action={changePassword} submitLabel="Change password" className="max-w-sm">
            {/* Lets password managers attach the new password to this account. */}
            <input
              type="text"
              name="username"
              autoComplete="username"
              defaultValue={me.email}
              hidden
              readOnly
            />
            <Field label="Current password">
              <Input name="current" type="password" autoComplete="current-password" required />
            </Field>
            <Field
              label="New password"
              hint="At least 12 characters. Your browser can suggest a strong one."
            >
              <Input
                name="next"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
              />
            </Field>
            <Field label="Repeat new password">
              <Input
                name="confirm"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
              />
            </Field>
          </ActionForm>
        </CardContent>
      </Card>
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

async function Users({ meUid }: { meUid: string }) {
  await requireStaff("super_admin");
  const staff = await db().select().from(s.staff).orderBy(asc(s.staff.createdAt));
  const fb = staff.length
    ? await adminAuth().getUsers(staff.map((x) => ({ uid: x.firebaseUid })))
    : { users: [] };
  const byUid = new Map(fb.users.map((u) => [u.uid, u]));
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Invite someone</CardTitle>
          <CardDescription>They get an email with a link to set their password.</CardDescription>
        </CardHeader>
        <CardContent>
          <ActionForm action={inviteStaff} submitLabel="Send invite" savedText={null}>
            <div className="grid gap-4 sm:grid-cols-[2fr_2fr_1fr]">
              <Field label="Email">
                <Input name="email" type="email" required autoComplete="off" />
              </Field>
              <Field label="Name">
                <Input name="name" maxLength={120} autoComplete="off" />
              </Field>
              <Field label="Role">
                <Select name="role" defaultValue="admin">
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super admin</option>
                </Select>
              </Field>
            </div>
            <p className="text-xs text-muted-foreground">
              Admins edit content and handle enquiries. Super admins can also manage users and
              redirects.
            </p>
          </ActionForm>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>People with access</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-0 divide-y">
          {staff.map((x) => {
            const u = byUid.get(x.firebaseUid);
            const hasMfa = (u?.multiFactor?.enrolledFactors.length ?? 0) > 0;
            const last = u?.metadata.lastSignInTime ? new Date(u.metadata.lastSignInTime) : null;
            return (
              <div
                key={x.id}
                className="flex flex-wrap items-start gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">
                    {x.name ?? x.email}
                    {x.firebaseUid === meUid && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>
                    )}
                  </p>
                  <p className="truncate text-muted-foreground">{x.email}</p>
                  <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                    <span>{ROLE[x.role]}</span>
                    <span>
                      {x.disabledAt
                        ? "No access"
                        : last
                          ? `Last sign-in ${timeAgo(last)}`
                          : "Invited, not signed in yet"}
                    </span>
                    <span>{hasMfa ? "Authenticator on" : "No authenticator"}</span>
                  </p>
                </div>
                {x.firebaseUid !== meUid && (
                  <StaffActions
                    uid={x.firebaseUid}
                    name={x.name ?? x.email}
                    role={x.role}
                    disabled={Boolean(x.disabledAt)}
                    hasMfa={hasMfa}
                  />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

async function Redirects() {
  await requireStaff("super_admin");
  const rows = await db().select().from(s.redirects).orderBy(asc(s.redirects.fromPath));
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Add a redirect</CardTitle>
          <CardDescription>
            Send an old address to a new one. Applied on the next publish.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActionForm action={saveRedirect.bind(null, null)} submitLabel="Add redirect">
            <div className="grid gap-4 sm:grid-cols-[2fr_2fr_1fr]">
              <Field label="Old path">
                <Input name="fromPath" placeholder="/old-page" required />
              </Field>
              <Field label="New path">
                <Input name="toPath" placeholder="/new-page or https://…" required />
              </Field>
              <Field label="Type">
                <Select name="statusCode" defaultValue="301">
                  <option value="301">Permanent (301)</option>
                  <option value="302">Temporary (302)</option>
                  <option value="308">Permanent (308)</option>
                  <option value="307">Temporary (307)</option>
                </Select>
              </Field>
            </div>
          </ActionForm>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Redirects ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet.</p>
          ) : (
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 pr-4 font-medium">From</th>
                  <th className="py-2 pr-4 font-medium">To</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs break-all">{r.fromPath}</td>
                    <td className="py-2 pr-4 font-mono text-xs break-all">{r.toPath}</td>
                    <td className="py-2 pr-4">{r.statusCode}</td>
                    <td className="py-2 text-right">
                      <DeleteRedirect
                        onDelete={deleteRedirect.bind(null, r.id)}
                        from={r.fromPath}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const ACTION: Record<string, string> = {
  create: "created",
  update: "edited",
  delete: "deleted",
  reorder: "reordered",
  publish: "published the site",
  upload: "uploaded",
  status: "changed the status of",
  export: "exported",
  invite: "invited",
  reinvite: "re-sent an invite to",
  role: "changed the role of",
  disable: "removed access for",
  enable: "restored access for",
  password: "changed their password",
  reset_mfa: "reset the authenticator of",
  remove_mfa: "turned off their authenticator",
  rename: "renamed",
};

async function Activity() {
  await requireStaff("super_admin");
  const rows = await db()
    .select({
      at: s.auditLog.at,
      action: s.auditLog.action,
      entity: s.auditLog.entity,
      name: s.staff.name,
      email: s.staff.email,
    })
    .from(s.auditLog)
    .leftJoin(s.staff, eq(s.staff.firebaseUid, s.auditLog.firebaseUid))
    .orderBy(desc(s.auditLog.at))
    .limit(100);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>The last 100 changes made in the admin.</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing yet.</p>
        ) : (
          <ul className="grid gap-0 divide-y text-sm">
            {rows.map((r, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: log rows are read-only and ordered
              <li key={i} className="flex flex-wrap justify-between gap-x-4 py-2">
                <span>
                  <span className="font-medium">{r.name ?? r.email ?? "Someone"}</span>{" "}
                  {ACTION[r.action] ?? r.action}
                  {!["publish", "password", "remove_mfa"].includes(r.action) && (
                    <span className="text-muted-foreground"> {r.entity.replaceAll("_", " ")}</span>
                  )}
                </span>
                <time
                  dateTime={r.at.toISOString()}
                  title={formatDateTime(r.at)}
                  className="text-xs text-muted-foreground"
                >
                  {timeAgo(r.at)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

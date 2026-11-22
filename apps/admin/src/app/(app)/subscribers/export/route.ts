import type { NextRequest } from "next/server";
import { audit } from "@/lib/audit";
import { requireStaff } from "@/lib/auth";
import { allSubscribers, isSubStatus } from "@/lib/subscribers";

/** CSV download of the subscriber list (current filter). Logged in the audit log. */
export async function GET(req: NextRequest) {
  const me = await requireStaff();
  const asked = req.nextUrl.searchParams.get("status");
  const status = isSubStatus(asked) ? asked : "all";
  const rows = await allSubscribers(status);
  // Quote every field; prefix formula-like values so spreadsheets don't execute them.
  const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replaceAll('"', '""')}"`;
  const csv = [
    "email,status,signed_up,confirmed",
    ...rows.map((r) =>
      [r.email, r.status, r.createdAt.toISOString(), r.confirmedAt?.toISOString() ?? ""]
        .map(cell)
        .join(","),
    ),
  ].join("\r\n");
  await audit(me, "export", "newsletter_subscribers", null, { status, rows: rows.length });
  const date = new Date().toISOString().slice(0, 10);
  return new Response(`${csv}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${status}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

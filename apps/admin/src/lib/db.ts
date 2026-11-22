import "server-only";
import { createDb, type Db } from "@aa/db";
import { env } from "./env";

// One pool per server instance (kept on globalThis so dev reloads don't open new ones).
const g = globalThis as { adminDb?: Db };

/** Database as the admin_app role. Call only after requireStaff(). */
export function db() {
  g.adminDb ??= createDb(env().DATABASE_URL_ADMIN);
  return g.adminDb;
}

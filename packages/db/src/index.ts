import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export * from "./sections";
export { schema };

/**
 * Create a Drizzle client for one least-privilege role.
 * Each app passes its own connection string:
 *   apps/web build   → DATABASE_URL_WEB_BUILD  (SELECT published rows only)
 *   apps/web forms   → DATABASE_URL_WEB_FORMS  (INSERT leads only)
 *   apps/admin       → DATABASE_URL_ADMIN      (CRUD, after Firebase check)
 * Uses the Supabase pooler in transaction mode, so prepared statements are off.
 */
export function createDb(url: string | undefined) {
  if (!url) throw new Error("Database URL is not set");
  const client = postgres(url, { prepare: false, max: 5 });
  return drizzle(client, { schema, casing: "snake_case" });
}

export type Db = ReturnType<typeof createDb>;

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
 * Connect through Supabase's SESSION pooler (port 5432), not the transaction pooler
 * (6543): postgres.js pipelines queued queries on one connection, and the transaction
 * pooler stalls on pipelined queries (any Promise.all hangs). Idle connections close
 * after 20 s so short-lived serverless functions don't hold pooler slots.
 */
export function createDb(url: string | undefined) {
  if (!url) throw new Error("Database URL is not set");
  const client = postgres(url, { prepare: false, max: 5, idle_timeout: 20 });
  return drizzle(client, { schema, casing: "snake_case" });
}

export type Db = ReturnType<typeof createDb>;

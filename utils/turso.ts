import { mkdirSync } from "node:fs";
import path from "node:path";
import bcrypt from "bcrypt";
import { createClient } from "@libsql/client";

const dataDir = path.resolve(process.cwd(), ".data");
mkdirSync(dataDir, { recursive: true });

const localDbPath = path.join(dataDir, "local.db");
const url = process.env.TURSO_URL ?? `file:${localDbPath}`;
const authToken = process.env.TURSO_TOKEN;

export const db = createClient({
  url,
  ...(authToken ? { authToken } : {}),
});

export const initializeSchema = async () => {
  try {
    await db.executeMultiple(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        desc TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        desc TEXT NOT NULL,
        image_url TEXT NOT NULL,
        link TEXT NOT NULL,
        category_id TEXT REFERENCES categories(id),
        price REAL,
        currency TEXT NOT NULL DEFAULT 'USD',
        location TEXT,
        sde REAL,
        down_payment REAL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  } catch (error) {
    console.warn("[DB_INIT] Local database init skipped:", error);
  }

  // The admin is scoped to business listings only; drop the unused
  // billboards table left over from the original storefront template.
  try {
    await db.execute("DROP TABLE IF EXISTS billboards");
  } catch (_error) {
    // already gone — safe to ignore
  }

  // Additive migration for databases created before these columns existed.
  // SQLite/libSQL has no "ADD COLUMN IF NOT EXISTS", so each is attempted
  // independently and a "duplicate column" failure is treated as a no-op.
  const productColumns: [string, string][] = [
    ["price", "REAL"],
    ["currency", "TEXT NOT NULL DEFAULT 'USD'"],
    ["location", "TEXT"],
    ["sde", "REAL"],
    ["down_payment", "REAL"],
  ];
  for (const [column, type] of productColumns) {
    try {
      await db.execute(`ALTER TABLE products ADD COLUMN ${column} ${type}`);
    } catch (_error) {
      // column already exists — safe to ignore
    }
  }
};

export const seedDefaultAdminUser = async () => {
  try {
    const email =
      process.env.DEFAULT_ADMIN_EMAIL ?? "admin@africanaspirations.com";
    const password = process.env.DEFAULT_ADMIN_PASSWORD ?? "password123";
    const name = process.env.DEFAULT_ADMIN_NAME ?? "Admin";

    const existingUser = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [email],
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser.rows.length === 0) {
      await db.execute({
        sql: "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
        args: [crypto.randomUUID(), name, email, hashedPassword],
      });
      console.info(`[DB_INIT] Seeded admin user ${email}`);
      return;
    }

    if (process.env.NODE_ENV === "development") {
      await db.execute({
        sql: "UPDATE users SET password = ?, name = ? WHERE email = ?",
        args: [hashedPassword, name, email],
      });
      console.info(`[DB_INIT] Synced dev admin credentials for ${email}`);
    }
  } catch (error) {
    console.warn("[DB_INIT] Admin user seed skipped:", error);
  }
};

// A real top-level await: any module that does `import { db } from
// "@/utils/turso"` has its own evaluation suspended until this finishes.
// This matters because it's the only thing preventing route handlers from
// racing a query against a table that isn't created yet — invisible against
// the near-instant local SQLite fallback, but a real, intermittent failure
// against a network-latency-bound remote database (e.g. on a Vercel cold
// start hitting Turso).
await initializeSchema();
await seedDefaultAdminUser();

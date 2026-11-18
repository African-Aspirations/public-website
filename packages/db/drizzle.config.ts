import { defineConfig } from "drizzle-kit";

// Migrations run with the owner/migration connection (never an app role).
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./migrations",
  dbCredentials: { url: process.env.DATABASE_MIGRATION_URL ?? "" },
  strict: true,
});

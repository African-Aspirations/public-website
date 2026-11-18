import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs under Node, which does not read .env on its own (Bun scripts do).
if (existsSync(".env")) process.loadEnvFile(".env");

// Migrations run with the owner/migration connection (never an app role).
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./migrations",
  dbCredentials: { url: process.env.DATABASE_MIGRATION_URL ?? "" },
  strict: true,
});

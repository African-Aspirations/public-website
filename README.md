# African Aspirations — website

Monorepo for the public site and the private admin.

| Concern              | Service                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| Database             | Supabase — **hosted Postgres only** (no Supabase Auth/Storage/Data API) |
| Admin authentication | Google Firebase Auth                                                    |
| Images               | Cloudinary                                                              |
| Email                | Resend                                                                  |
| Hosting              | Vercel                                                                  |

```
apps/web         Astro public site — every page's first HTML response ≤ 14 KB compressed
apps/admin       Next.js admin on a private subdomain (coming in phase 5)
packages/db      Drizzle schema, SQL migrations, least-privilege roles, section schemas
packages/config  Design tokens and the shared layout grid (one content width everywhere)
scripts/         check-budget.ts (14 KB gate)
```

## Getting started

```bash
bun install
bun --cwd apps/web run dev
```

## Database

- Schema: `packages/db/src/schema.ts` → `bun run db:generate` writes SQL to `packages/db/migrations`.
- Roles & grants: `packages/db/migrations/0001_roles_and_grants.sql`. Three login roles, one per use:
  `web_build` (read published content), `web_forms` (insert leads only), `admin_app` (CRUD, admin server only).
  After the first migration, set their passwords once in the Supabase SQL editor
  (`ALTER ROLE web_build WITH LOGIN PASSWORD '…'`) and connect via the pooler as `<role>.<project-ref>`.
- In Supabase → Settings → Data API, **turn the Data API off**.
- Permission tests (needs Docker):

  ```bash
  docker run -d --rm --name aa-pg-test -e POSTGRES_PASSWORD=pg -p 55432:5432 postgres:17-alpine
  psql postgres://postgres:pg@localhost:55432/postgres -f packages/db/test/supabase-shim.sql
  DATABASE_MIGRATION_URL=postgres://postgres:pg@localhost:55432/postgres bun run db:migrate
  TEST_DATABASE_URL=postgres://postgres:pg@localhost:55432/postgres bun --cwd packages/db test
  ```

## Layout rule

All widths and side margins come from `packages/config/tokens.css` (`.layout`, `--content-max`, `--gutter`).
Section components never set their own `max-width` or horizontal padding.

## Performance budget

`bun run build && bun run budget` — fails if any page's HTML is over 14,000 bytes compressed.

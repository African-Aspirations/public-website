/**
 * Proves each app role can do exactly what the plan says and nothing more.
 * Runs against a disposable Postgres that has had the migrations applied:
 *   TEST_DATABASE_URL=postgres://postgres:pg@localhost:55432/postgres bun test
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import postgres from "postgres";

const ownerUrl = process.env.TEST_DATABASE_URL;
if (!ownerUrl) throw new Error("TEST_DATABASE_URL is required");

const owner = postgres(ownerUrl, { onnotice: () => {} });
const as = (role: string) => {
  const u = new URL(ownerUrl);
  u.username = role;
  u.password = "test";
  return postgres(u.toString(), { prepare: false, onnotice: () => {} });
};

let build: postgres.Sql;
let forms: postgres.Sql;
let admin: postgres.Sql;
let anon: postgres.Sql;

beforeAll(async () => {
  for (const r of ["web_build", "web_forms", "admin_app", "anon"]) {
    await owner.unsafe(`ALTER ROLE ${r} WITH LOGIN PASSWORD 'test'`);
  }
  await owner`TRUNCATE pages, listings, contact_messages, listing_inquiries, newsletter_subscribers, staff, rate_limits CASCADE`;
  await owner`INSERT INTO pages (slug, title, status) VALUES ('live', 'Live', 'published'), ('draft', 'Draft', 'draft')`;
  await owner`INSERT INTO listings (slug, name, description, status) VALUES ('l-live', 'L', 'd', 'published'), ('l-draft', 'D', 'd', 'draft')`;
  await owner`INSERT INTO contact_messages (name, email, message) VALUES ('Seed', 'seed@example.com', 'hi')`;
  await owner`INSERT INTO staff (firebase_uid, email, role) VALUES ('uid1', 'a@example.com', 'admin')`;
  build = as("web_build");
  forms = as("web_forms");
  admin = as("admin_app");
  anon = as("anon");
});

afterAll(async () => {
  await Promise.all([build, forms, admin, anon, owner].map((c) => c.end()));
});

// postgres.js queries are lazy thenables; wrap so the query actually executes.
const run = (q: PromiseLike<unknown>) => Promise.resolve(q);
const denied = (q: PromiseLike<unknown>) => expect(run(q)).rejects.toThrow(/permission denied/);
// First column of the first row.
const val = async (q: PromiseLike<postgres.Row[]>) => Object.values((await q)[0] ?? {})[0];

describe("web_build (Astro build)", () => {
  test("sees only published pages and listings", async () => {
    const pages = await build`SELECT slug FROM pages`;
    expect(pages.map((r) => r.slug)).toEqual(["live"]);
    const listings = await build`SELECT slug FROM listings`;
    expect(listings.map((r) => r.slug)).toEqual(["l-live"]);
  });
  test("cannot read leads, subscribers or staff", async () => {
    await denied(build`SELECT * FROM contact_messages`);
    await denied(build`SELECT * FROM listing_inquiries`);
    await denied(build`SELECT * FROM newsletter_subscribers`);
    await denied(build`SELECT * FROM staff`);
  });
  test("cannot write anything", async () => {
    await denied(build`INSERT INTO pages (slug, title) VALUES ('x', 'x')`);
    await denied(build`UPDATE pages SET title = 'x'`);
    await denied(build`DELETE FROM pages`);
  });
});

describe("web_forms (public form endpoints)", () => {
  test("can insert a contact message but not read leads back", async () => {
    await forms`INSERT INTO contact_messages (name, email, message) VALUES ('A', 'a@x.com', 'hello')`;
    await denied(forms`SELECT * FROM contact_messages`);
    await denied(forms`UPDATE contact_messages SET status = 'closed'`);
    await denied(forms`DELETE FROM contact_messages`);
  });
  test("cannot insert a lead with a non-new status", async () => {
    await expect(
      run(
        forms`INSERT INTO contact_messages (name, email, message, status) VALUES ('A', 'a@x.com', 'm', 'closed')`,
      ),
    ).rejects.toThrow(/row-level security/);
  });
  test("sees only published listings", async () => {
    const rows = await forms`SELECT slug FROM listings`;
    expect(rows.map((r) => r.slug)).toEqual(["l-live"]);
  });
  test("newsletter goes through functions only", async () => {
    await denied(forms`SELECT * FROM newsletter_subscribers`);
    expect(await val(forms`SELECT newsletter_subscribe('New@Example.com', 'tok1') AS r`)).toBe(
      "pending",
    );
    expect(await val(forms`SELECT newsletter_confirm('tok1') AS e`)).toBe("new@example.com");
    expect(await val(forms`SELECT newsletter_subscribe('new@example.com', 'tok2') AS again`)).toBe(
      "already_confirmed",
    );
    expect(await val(forms`SELECT newsletter_confirm('nope') AS bad`)).toBeNull();
  });
  test("rate limit blocks after the max", async () => {
    const hits: boolean[] = [];
    for (let i = 0; i < 4; i++) {
      hits.push(
        (await val(forms`SELECT rate_limit_hit('ip', 'contact', 600, 3) AS ok`)) as boolean,
      );
    }
    expect(hits).toEqual([true, true, true, false]);
  });
  test("cannot touch content or staff", async () => {
    await denied(forms`SELECT * FROM pages`);
    await denied(forms`SELECT * FROM staff`);
  });
});

describe("admin_app (admin server, after Firebase check)", () => {
  test("has full CRUD, including drafts and leads", async () => {
    const pages = await admin`SELECT slug FROM pages ORDER BY slug`;
    expect(pages.map((r) => r.slug)).toEqual(["draft", "live"]);
    const leads = await admin`SELECT count(*)::int AS n FROM contact_messages`;
    expect(leads[0]?.n).toBeGreaterThan(0);
    await admin`UPDATE contact_messages SET status = 'contacted'`;
    await admin`DELETE FROM pages WHERE slug = 'draft'`;
  });
});

describe("Supabase API roles", () => {
  test("anon cannot read or call anything in the app schema", async () => {
    await denied(anon`SELECT * FROM pages`);
    await denied(anon`SELECT * FROM contact_messages`);
    await denied(anon`SELECT newsletter_confirm('x')`);
  });
});

import { schema as s } from "@aa/db";
import { asc } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, Field, Select } from "@/components/form";
import { DeleteButton } from "@/components/row-actions";
import { Input } from "@/components/ui/input";
import { deleteNavItem, saveNavItem } from "@/lib/actions/navigation";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { menuLabel, menusOf, navRows } from "@/lib/nav-data";

export const metadata = { title: "Menu link" };

export default async function NavItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ menu?: string; parent?: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const q = await searchParams;
  const rows = await navRows();
  const isNew = id === "new";
  const item = isNew ? undefined : rows.find((r) => r.id === id);
  if (!isNew && !item) notFound();
  const pages = await db()
    .select({ id: s.pages.id, title: s.pages.title, slug: s.pages.slug, status: s.pages.status })
    .from(s.pages)
    .orderBy(asc(s.pages.title));
  const menus = menusOf(rows);
  const menu = item?.menu ?? q.menu ?? "header";
  const parentId = item?.parentId ?? q.parent ?? "";
  const hasChildren = !!item && rows.some((r) => r.parentId === item.id);
  // Possible parents: top-level items (a header dropdown has one level).
  const parents = rows.filter((r) => !r.parentId && r.id !== item?.id);

  return (
    <div className="grid max-w-3xl gap-6">
      <Link
        href="/navigation"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Navigation
      </Link>
      <h1 className="text-2xl font-semibold">{item ? item.label : "New link"}</h1>
      <ActionForm
        action={saveNavItem.bind(null, item?.id ?? null)}
        submitLabel={item ? "Save changes" : "Add link"}
        className="rounded-xl border bg-background p-5 sm:p-6"
        footer={
          item && (
            <DeleteButton
              onDelete={deleteNavItem.bind(null, item.id)}
              what={
                hasChildren ? `“${item.label}” and the links in its dropdown` : `“${item.label}”`
              }
            />
          )
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Label">
            <Input name="label" defaultValue={item?.label} required maxLength={80} />
          </Field>
          <Field label="Description" hint="Header dropdowns only: a short line under the label.">
            <Input name="description" defaultValue={item?.description ?? ""} maxLength={160} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Page" hint="Link to a page of the site…">
            <Select name="pageId" defaultValue={item?.pageId ?? ""}>
              <option value="">— Custom link —</option>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (/{p.slug}){p.status === "draft" ? " · draft" : ""}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="…or custom link"
            hint="When no page is chosen: /about#our-team or https://…"
          >
            <Input name="url" defaultValue={item?.url ?? ""} placeholder="https://" />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Menu">
            <Select name="menu" defaultValue={menu}>
              {menus.map((m) => (
                <option key={m} value={m}>
                  {menuLabel(m)}
                </option>
              ))}
              <option value="__new">New footer column…</option>
            </Select>
          </Field>
          <Field label="New footer column name" hint="Only when “New footer column…” is chosen.">
            <Input name="newColumn" maxLength={60} />
          </Field>
        </div>
        <Field
          label="Inside dropdown"
          hint="Header only: put this link inside another item's dropdown."
        >
          <Select name="parentId" defaultValue={parentId} disabled={hasChildren}>
            <option value="">No (top level)</option>
            {menus.map((m) => {
              const ps = parents.filter((p) => p.menu === m);
              return ps.length ? (
                <optgroup key={m} label={menuLabel(m)}>
                  {ps.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </optgroup>
              ) : null;
            })}
          </Select>
        </Field>
      </ActionForm>
    </div>
  );
}

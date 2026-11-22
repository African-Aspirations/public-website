import { buttonVariants, cn } from "@aa/ui/recipes";
import { ExternalLink, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { ActionForm } from "@/components/form";
import { ListHeader } from "@/components/list";
import { MoveButtons } from "@/components/row-actions";
import { Input } from "@/components/ui/input";
import { moveNavItem, renameFooterColumn } from "@/lib/actions/navigation";
import { requireStaff } from "@/lib/auth";
import { menuLabel, menusOf, type NavRow, navRows } from "@/lib/nav-data";

export const metadata = { title: "Navigation" };

export default async function NavigationPage() {
  await requireStaff();
  const rows = await navRows();
  return (
    <div className="grid max-w-4xl gap-6">
      <ListHeader
        title="Navigation"
        description="The header and footer menus. Links to draft pages are hidden on the site until the page is published."
        addHref="/navigation/new?menu=__new"
        addLabel="New footer column"
      />
      {menusOf(rows).map((menu) => {
        const items = rows.filter((r) => r.menu === menu);
        const top = items.filter((r) => !r.parentId || !items.some((p) => p.id === r.parentId));
        return (
          <section key={menu} className="overflow-hidden rounded-xl border bg-background">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
              <h2 className="font-semibold">{menuLabel(menu)}</h2>
              <Link
                href={`/navigation/new?menu=${encodeURIComponent(menu)}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                <Plus className="size-4" />
                Add link
              </Link>
            </header>
            {menu.startsWith("footer:") && (
              <details className="border-b px-4 py-2 text-sm">
                <summary className="cursor-pointer text-muted-foreground">Rename column</summary>
                <ActionForm
                  action={renameFooterColumn.bind(null, menu)}
                  submitLabel="Rename"
                  className="mt-3 max-w-sm gap-3"
                >
                  <Input
                    name="name"
                    defaultValue={menu.slice(7)}
                    aria-label="Column name"
                    required
                    maxLength={60}
                  />
                </ActionForm>
              </details>
            )}
            {top.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">No links yet.</p>
            ) : (
              <ul className="divide-y">
                {top.map((r, i) => {
                  const kids = items.filter((c) => c.parentId === r.id);
                  return (
                    <li key={r.id}>
                      <Row r={r} first={i === 0} last={i === top.length - 1} />
                      {(kids.length > 0 || menu === "header") && (
                        <ul className="divide-y border-t bg-muted/40">
                          {kids.map((k, j) => (
                            <li key={k.id} className="pl-8">
                              <Row r={k} first={j === 0} last={j === kids.length - 1} />
                            </li>
                          ))}
                          {menu === "header" && (
                            <li className="py-1.5 pl-12">
                              <Link
                                href={`/navigation/new?menu=header&parent=${r.id}`}
                                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                              >
                                <Plus className="size-3" />
                                Add to “{r.label}” dropdown
                              </Link>
                            </li>
                          )}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Row({ r, first, last }: { r: NavRow; first: boolean; last: boolean }) {
  const target = r.pageId ? (r.pageSlug === "" ? "/" : `/${r.pageSlug ?? "?"}`) : (r.url ?? "#");
  return (
    <div className="flex items-center gap-3 px-3 py-2 hover:bg-secondary">
      <MoveButtons
        onMove={moveNavItem.bind(null, r.id)}
        first={first}
        last={last}
        label={r.label}
      />
      <Link
        href={`/navigation/${r.id}`}
        className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3"
      >
        <span className="font-medium">{r.label}</span>
        <span className="inline-flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
          {r.pageId ? (
            <FileText className="size-3" aria-hidden />
          ) : (
            <ExternalLink className="size-3" aria-hidden />
          )}
          {target}
        </span>
        {r.pageStatus === "draft" && (
          <span className="text-xs text-destructive">page is a draft</span>
        )}
      </Link>
    </div>
  );
}

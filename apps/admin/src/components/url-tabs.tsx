import Link from "next/link";
import { cn } from "@/lib/utils";

/** Tabs whose state lives in the URL (?tab=…), so each tab can be linked and reloaded. */
export function UrlTabs({
  base,
  tabs,
  current,
}: {
  base: string;
  tabs: { id: string; label: string; badge?: number }[];
  current: string;
}) {
  return (
    <nav
      aria-label="Sections"
      className="mb-6 inline-flex h-9 items-center rounded-lg bg-background p-1 shadow-[0_0_0_1px_var(--border)]"
    >
      {tabs.map((t, i) => (
        <Link
          key={t.id}
          href={i === 0 ? base : `${base}?tab=${t.id}`}
          aria-current={t.id === current ? "page" : undefined}
          className={cn(
            "inline-flex h-7 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
            t.id === current && "bg-secondary text-secondary-foreground",
          )}
        >
          {t.label}
          {!!t.badge && (
            <span className="rounded-full bg-primary px-1.5 text-xs leading-5 text-primary-foreground">
              {t.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

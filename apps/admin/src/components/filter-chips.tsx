import Link from "next/link";
import { cn } from "@/lib/utils";

/** A row of pill links that set one URL parameter (e.g. ?status=closed). */
export function FilterChips({
  options,
  current,
  href,
  label,
}: {
  options: { id: string; label: string }[];
  current: string;
  href: (id: string) => string;
  label: string;
}) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Link
          key={o.id}
          href={href(o.id)}
          aria-current={o.id === current ? "page" : undefined}
          className={cn(
            "rounded-full border bg-background px-3 py-1 text-sm hover:border-ring",
            o.id === current &&
              "border-primary bg-primary text-primary-foreground hover:border-primary",
          )}
        >
          {o.label}
        </Link>
      ))}
    </nav>
  );
}

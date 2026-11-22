import { buttonVariants, cn } from "@aa/ui/recipes";
import Link from "next/link";

/** "1–25 of 80" with previous / next links. */
export function Pager({
  page,
  pageSize,
  total,
  href,
}: {
  page: number;
  pageSize: number;
  total: number;
  href: (page: number) => string;
}) {
  if (total <= pageSize) return null;
  const last = Math.ceil(total / pageSize);
  const btn = cn(buttonVariants({ variant: "outline", size: "sm" }));
  return (
    <div className="mt-4 flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <span>
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <span className="flex gap-2">
        {page > 1 && (
          <Link className={btn} href={href(page - 1)}>
            Previous
          </Link>
        )}
        {page < last && (
          <Link className={btn} href={href(page + 1)}>
            Next
          </Link>
        )}
      </span>
    </div>
  );
}

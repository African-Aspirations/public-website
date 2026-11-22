import { buttonVariants, cn } from "@aa/ui/recipes";
import { Plus } from "lucide-react";
import Link from "next/link";

/** Page header row with an "Add" button. */
export function ListHeader({
  title,
  description,
  addHref,
  addLabel,
}: {
  title: string;
  description?: string;
  addHref?: string;
  addLabel?: string;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {addHref && (
        <Link href={addHref} className={cn(buttonVariants())}>
          <Plus className="size-4" />
          {addLabel}
        </Link>
      )}
    </header>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed bg-background px-6 py-16 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

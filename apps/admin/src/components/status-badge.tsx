import { cn } from "@/lib/utils";

const STYLE: Record<string, string> = {
  new: "bg-primary text-primary-foreground border-transparent",
  pending: "bg-gold text-gold-foreground border-transparent",
  contacted: "bg-secondary text-secondary-foreground border-brand-line",
  confirmed: "bg-secondary text-secondary-foreground border-brand-line",
  closed: "bg-muted text-muted-foreground",
  unsubscribed: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
        STYLE[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

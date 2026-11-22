import { Hammer } from "lucide-react";

/** Placeholder for a screen that exists in the nav but is built in a later phase. */
export function ComingSoon({ what, phase }: { what: string; phase: string }) {
  return (
    <div className="grid place-items-center gap-3 rounded-xl border border-dashed bg-background px-6 py-16 text-center">
      <Hammer className="size-6 text-muted-foreground" aria-hidden />
      <p className="max-w-md text-sm">{what}</p>
      <p className="text-xs text-muted-foreground">Coming in {phase}</p>
    </div>
  );
}

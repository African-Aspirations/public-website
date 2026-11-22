"use client";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Up / down buttons for ordered lists. */
export function MoveButtons({
  onMove,
  first,
  last,
  label,
}: {
  onMove: (dir: "up" | "down") => Promise<void>;
  first: boolean;
  last: boolean;
  label: string;
}) {
  return (
    <span className="flex">
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        disabled={first}
        aria-label={`Move ${label} up`}
        onClick={() => onMove("up")}
      >
        <ArrowUp className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        disabled={last}
        aria-label={`Move ${label} down`}
        onClick={() => onMove("down")}
      >
        <ArrowDown className="size-4" />
      </Button>
    </span>
  );
}

/** Delete with a confirmation prompt. */
export function DeleteButton({ onDelete, what }: { onDelete: () => Promise<void>; what: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="text-destructive hover:bg-destructive hover:text-white"
      onClick={async () => {
        if (confirm(`Delete ${what}? This can't be undone.`)) await onDelete();
      }}
    >
      <Trash2 className="size-4" />
      Delete
    </Button>
  );
}

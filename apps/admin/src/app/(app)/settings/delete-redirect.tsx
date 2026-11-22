"use client";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function DeleteRedirect({
  onDelete,
  from,
}: {
  onDelete: () => Promise<void>;
  from: string;
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 text-destructive"
      disabled={pending}
      aria-label={`Delete redirect from ${from}`}
      onClick={() => confirm(`Delete the redirect from ${from}?`) && start(() => onDelete())}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

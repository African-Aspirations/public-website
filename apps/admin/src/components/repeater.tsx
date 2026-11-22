"use client";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Col = { name: string; label: string; placeholder?: string; multiline?: boolean };

/**
 * Editable list of rows (stats, features…). Each column posts as repeated inputs
 * with the same name, read on the server with form.getAll(name).
 */
export function Repeater({
  cols,
  initial,
  addLabel,
  max = 50,
}: {
  cols: Col[];
  initial: Record<string, string>[];
  addLabel: string;
  max?: number;
}) {
  const [rows, setRows] = useState<{ key: number; values: Record<string, string> }[]>(() =>
    initial.map((values, key) => ({ key, values })),
  );
  const [next, setNext] = useState(initial.length);
  return (
    <div className="grid gap-3">
      {rows.map((r, i) => (
        <fieldset
          key={r.key}
          className="grid gap-2 rounded-lg border bg-background p-3 sm:grid-cols-[repeat(var(--n),minmax(0,1fr))_auto] sm:items-start"
          style={{ "--n": cols.length } as React.CSSProperties}
        >
          <legend className="sr-only">Row {i + 1}</legend>
          {cols.map((c) =>
            c.multiline ? (
              <Textarea
                key={c.name}
                name={c.name}
                aria-label={c.label}
                placeholder={c.placeholder ?? c.label}
                defaultValue={r.values[c.name] ?? ""}
                className="min-h-16"
              />
            ) : (
              <Input
                key={c.name}
                name={c.name}
                aria-label={c.label}
                placeholder={c.placeholder ?? c.label}
                defaultValue={r.values[c.name] ?? ""}
              />
            ),
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remove row ${i + 1}`}
            onClick={() => setRows(rows.filter((x) => x.key !== r.key))}
          >
            <X className="size-4" />
          </Button>
        </fieldset>
      ))}
      {rows.length < max && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-self-start"
          onClick={() => {
            setRows([...rows, { key: next, values: {} }]);
            setNext(next + 1);
          }}
        >
          <Plus className="size-4" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}

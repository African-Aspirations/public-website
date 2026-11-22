"use client";
import { ArrowDown, ArrowUp, ChevronRight, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { useId, useState } from "react";
import { Select } from "@/components/form";
import { MediaDialog } from "@/components/media-picker";
import { Thumb } from "@/components/thumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MediaOption } from "@/lib/media";
import { type FieldSpec, initialData } from "@/lib/section-spec";
import { cn } from "@/lib/utils";

type Data = Record<string, unknown>;
type Ctx = { media: MediaOption[]; partners: { id: string; name: string }[] };

/** Drop empty strings, empty optional objects and unset values before validation. */
function clean(v: unknown): unknown {
  if (typeof v === "string") return v.trim() === "" ? undefined : v;
  if (Array.isArray(v)) return v.map(clean).filter((x) => x !== undefined);
  if (v && typeof v === "object") {
    const o = Object.fromEntries(
      Object.entries(v)
        .map(([k, x]) => [k, clean(x)])
        .filter(([, x]) => x !== undefined),
    );
    return Object.keys(o).length ? o : undefined;
  }
  return v;
}

/**
 * The whole section form. Keeps the data as one JSON object and posts it in a
 * hidden "data" input; the server validates it with the section's zod schema.
 */
export function SectionFields({
  fields,
  initial,
  ctx,
}: {
  fields: FieldSpec[];
  initial: Data;
  ctx: Ctx;
}) {
  const [data, setData] = useState<Data>(initial);
  return (
    <>
      <input type="hidden" name="data" value={JSON.stringify(clean(data) ?? {})} />
      <Fields fields={fields} value={data} onChange={setData} ctx={ctx} />
    </>
  );
}

function Fields({
  fields,
  value,
  onChange,
  ctx,
}: {
  fields: FieldSpec[];
  value: Data;
  onChange: (d: Data) => void;
  ctx: Ctx;
}) {
  return (
    <div className="grid gap-5">
      {fields.map((f) => (
        <Field
          key={f.key}
          f={f}
          value={value[f.key]}
          onChange={(v) => onChange({ ...value, [f.key]: v })}
          ctx={ctx}
        />
      ))}
    </div>
  );
}

function Label({ f, htmlFor }: { f: FieldSpec; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium">
      {f.label}
      {f.required && <span className="text-destructive"> *</span>}
    </label>
  );
}
const Hint = ({ f }: { f: FieldSpec }) =>
  f.hint ? <span className="text-xs text-muted-foreground">{f.hint}</span> : null;

function Field({
  f,
  value,
  onChange,
  ctx,
}: {
  f: FieldSpec;
  value: unknown;
  onChange: (v: unknown) => void;
  ctx: Ctx;
}) {
  const id = useId();
  switch (f.kind) {
    case "text":
      return (
        <div className="grid gap-2">
          <Label f={f} htmlFor={id} />
          {f.multiline ? (
            <Textarea
              id={id}
              value={(value as string) ?? ""}
              onChange={(e) => onChange(e.target.value)}
              className="min-h-28 font-mono text-sm"
            />
          ) : (
            <Input
              id={id}
              value={(value as string) ?? ""}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
          <Hint f={f} />
        </div>
      );
    case "number":
      return (
        <div className="grid gap-2">
          <Label f={f} htmlFor={id} />
          <Input
            id={id}
            type="number"
            min={f.min}
            max={f.max}
            value={(value as number | undefined) ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
            className="max-w-32"
          />
          <Hint f={f} />
        </div>
      );
    case "select": {
      const numeric = typeof f.options[0]?.value === "number";
      return (
        <div className="grid gap-2">
          <Label f={f} htmlFor={id} />
          <Select
            id={id}
            value={String(value ?? f.default ?? "")}
            onChange={(e) => onChange(numeric ? Number(e.target.value) : e.target.value)}
            className="max-w-sm"
          >
            {f.options.map((o) => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
          </Select>
          <Hint f={f} />
        </div>
      );
    }
    case "boolean":
      return (
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={Boolean(value ?? f.default)}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-0.5 size-4 accent-primary"
          />
          <span className="grid gap-1">
            <span className="font-medium">{f.label}</span>
            <Hint f={f} />
          </span>
        </label>
      );
    case "partner":
      return (
        <div className="grid gap-2">
          <Label f={f} htmlFor={id} />
          <Select
            id={id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="max-w-sm"
          >
            <option value="">Choose a partner…</option>
            {ctx.partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Hint f={f} />
        </div>
      );
    case "media":
      return f.multiple ? (
        <MultiMedia f={f} value={(value as string[]) ?? []} onChange={onChange} ctx={ctx} />
      ) : (
        <SingleMedia f={f} value={value as string | undefined} onChange={onChange} ctx={ctx} />
      );
    case "object":
      return (
        <fieldset className="grid gap-4 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">
            {f.label}
            {f.required && <span className="text-destructive"> *</span>}
          </legend>
          <Hint f={f} />
          <Fields fields={f.fields} value={(value as Data) ?? {}} onChange={onChange} ctx={ctx} />
        </fieldset>
      );
    case "list":
      return <List f={f} value={(value as Data[]) ?? []} onChange={onChange} ctx={ctx} />;
  }
}

function SingleMedia({
  f,
  value,
  onChange,
  ctx,
}: {
  f: FieldSpec;
  value?: string;
  onChange: (v: unknown) => void;
  ctx: Ctx;
}) {
  const [open, setOpen] = useState(false);
  const m = ctx.media.find((x) => x.id === value);
  return (
    <div className="grid gap-2">
      <Label f={f} />
      <div className="flex items-center gap-3">
        <Thumb
          src={m?.src}
          fallback={m?.fallback}
          alt={m?.alt ?? "No image"}
          className="size-20 shrink-0 rounded-md border bg-muted object-contain"
        />
        <div className="grid min-w-0 gap-2 text-sm">
          <span className="truncate text-muted-foreground">{m?.alt ?? "No image"}</span>
          <span className="flex gap-2">
            <MediaDialog
              media={ctx.media}
              selected={value}
              open={open}
              onOpenChange={setOpen}
              onPick={onChange}
              trigger={
                <Button type="button" variant="outline" size="sm">
                  <ImagePlus className="size-4" />
                  {m ? "Change" : "Choose"}
                </Button>
              }
            />
            {m && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(undefined)}>
                <X className="size-4" />
                Remove
              </Button>
            )}
          </span>
        </div>
      </div>
      <Hint f={f} />
    </div>
  );
}

function MultiMedia({
  f,
  value,
  onChange,
  ctx,
}: {
  f: FieldSpec & { max?: number };
  value: string[];
  onChange: (v: unknown) => void;
  ctx: Ctx;
}) {
  const [open, setOpen] = useState(false);
  const swap = (i: number, j: number) => {
    const n = [...value];
    [n[i], n[j]] = [n[j] as string, n[i] as string];
    onChange(n);
  };
  return (
    <div className="grid gap-2">
      <Label f={f} />
      <ul className="flex flex-wrap gap-3">
        {value.map((id, i) => {
          const m = ctx.media.find((x) => x.id === id);
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: the same image may appear twice; position is the identity
            <li key={`${id}-${i}`} className="grid w-28 gap-1">
              <Thumb
                src={m?.src}
                fallback={m?.fallback}
                alt={m?.alt ?? "Missing image"}
                className="aspect-square w-full rounded-md border bg-muted object-contain"
              />
              <span className="flex justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={i === 0}
                  aria-label="Move image left"
                  onClick={() => swap(i, i - 1)}
                >
                  <ArrowUp className="size-3.5 -rotate-90" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label="Remove image"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                >
                  <X className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={i === value.length - 1}
                  aria-label="Move image right"
                  onClick={() => swap(i, i + 1)}
                >
                  <ArrowDown className="size-3.5 -rotate-90" />
                </Button>
              </span>
            </li>
          );
        })}
        {(f.max === undefined || value.length < f.max) && (
          <li>
            <MediaDialog
              media={ctx.media}
              open={open}
              onOpenChange={setOpen}
              onPick={(id) => onChange([...value, id])}
              trigger={
                <button
                  type="button"
                  className="grid size-28 cursor-pointer place-items-center rounded-md border border-dashed text-xs text-muted-foreground hover:border-ring"
                >
                  <span className="grid place-items-center gap-1">
                    <ImagePlus className="size-5" />
                    Add image
                  </span>
                </button>
              }
            />
          </li>
        )}
      </ul>
      <Hint f={f} />
    </div>
  );
}

function List({
  f,
  value,
  onChange,
  ctx,
}: {
  f: Extract<FieldSpec, { kind: "list" }>;
  value: Data[];
  onChange: (v: unknown) => void;
  ctx: Ctx;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(value.length === 1 ? 0 : null);
  const set = (i: number, d: Data) => onChange(value.map((x, j) => (j === i ? d : x)));
  const swap = (i: number, j: number) => {
    const n = [...value];
    [n[i], n[j]] = [n[j] as Data, n[i] as Data];
    onChange(n);
    setOpenIdx(openIdx === i ? j : openIdx === j ? i : openIdx);
  };
  const title = (d: Data, i: number) =>
    String(d.title ?? d.label ?? d.value ?? d.heading ?? "").trim() || `${f.itemLabel} ${i + 1}`;
  return (
    <div className="grid gap-2">
      <Label f={f} />
      <Hint f={f} />
      <ul className="grid gap-2">
        {value.map((d, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: items have no ids; order is the identity
          <li key={i} className="rounded-lg border bg-background">
            <div className="flex items-center gap-1 px-2 py-1">
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                aria-expanded={openIdx === i}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-1.5 text-left text-sm font-medium"
              >
                <ChevronRight
                  className={cn(
                    "size-4 shrink-0 transition-transform",
                    openIdx === i && "rotate-90",
                  )}
                />
                <span className="truncate">{title(d, i)}</span>
              </button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                disabled={i === 0}
                aria-label={`Move ${title(d, i)} up`}
                onClick={() => swap(i, i - 1)}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                disabled={i === value.length - 1}
                aria-label={`Move ${title(d, i)} down`}
                onClick={() => swap(i, i + 1)}
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-destructive"
                disabled={value.length <= f.min}
                aria-label={`Remove ${title(d, i)}`}
                onClick={() => {
                  onChange(value.filter((_, j) => j !== i));
                  setOpenIdx(null);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            {openIdx === i && (
              <div className="border-t p-4">
                <Fields fields={f.fields} value={d} onChange={(nd) => set(i, nd)} ctx={ctx} />
              </div>
            )}
          </li>
        ))}
      </ul>
      {(f.max === undefined || value.length < f.max) && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-self-start"
          onClick={() => {
            onChange([...value, initialData(f.fields)]);
            setOpenIdx(value.length);
          }}
        >
          <Plus className="size-4" />
          Add {f.itemLabel.toLowerCase()}
        </Button>
      )}
    </div>
  );
}

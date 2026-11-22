"use client";
import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react";
import { useState } from "react";
import { MediaDialog } from "@/components/media-picker";
import { Thumb } from "@/components/thumb";
import { Button } from "@/components/ui/button";
import type { MediaOption } from "@/lib/media";

/** Ordered set of library images; posts each id as a repeated `name` input. */
export function GalleryPicker({
  name,
  media,
  value,
  label,
}: {
  name: string;
  media: MediaOption[];
  value: string[];
  label: string;
}) {
  const [ids, setIds] = useState(value);
  const [open, setOpen] = useState(false);
  const swap = (i: number, j: number) => {
    const n = [...ids];
    [n[i], n[j]] = [n[j] as string, n[i] as string];
    setIds(n);
  };
  return (
    <div className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      {ids.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
      <ul className="flex flex-wrap gap-3">
        {ids.map((id, i) => {
          const m = media.find((x) => x.id === id);
          return (
            <li key={id} className="grid w-28 gap-1">
              <Thumb
                src={m?.src}
                fallback={m?.fallback}
                alt={m?.alt ?? "Missing image"}
                className="aspect-square w-full rounded-md border bg-muted object-cover"
              />
              <span className="flex justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={i === 0}
                  aria-label="Move left"
                  onClick={() => swap(i, i - 1)}
                >
                  <ArrowLeft className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label="Remove"
                  onClick={() => setIds(ids.filter((x) => x !== id))}
                >
                  <X className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={i === ids.length - 1}
                  aria-label="Move right"
                  onClick={() => swap(i, i + 1)}
                >
                  <ArrowRight className="size-3.5" />
                </Button>
              </span>
            </li>
          );
        })}
        <li>
          <MediaDialog
            media={media}
            open={open}
            onOpenChange={setOpen}
            onPick={(id) => setIds((cur) => (cur.includes(id) ? cur : [...cur, id]))}
            trigger={
              <button
                type="button"
                className="grid size-28 cursor-pointer place-items-center rounded-md border border-dashed text-xs text-muted-foreground hover:border-ring"
              >
                <span className="grid place-items-center gap-1">
                  <ImagePlus className="size-5" />
                  Add photo
                </span>
              </button>
            }
          />
        </li>
      </ul>
    </div>
  );
}

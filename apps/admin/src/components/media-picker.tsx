"use client";
import { ImagePlus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Thumb } from "@/components/thumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { MediaOption } from "@/lib/media";
import { cn } from "@/lib/utils";

/** Pick an image from the media library; submits its id as `name`. */
export function MediaPicker({
  name,
  media,
  value,
  label = "Image",
}: {
  name: string;
  media: MediaOption[];
  value?: string | null;
  label?: string;
}) {
  const [id, setId] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const current = media.find((m) => m.id === id);
  const shown = useMemo(
    () => media.filter((m) => m.alt.toLowerCase().includes(q.toLowerCase())),
    [media, q],
  );
  return (
    <div className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <input type="hidden" name={name} value={id} />
      <div className="flex items-center gap-3">
        <Thumb
          src={current?.src}
          fallback={current?.fallback}
          alt={current?.alt ?? "No image"}
          className="size-20 shrink-0 rounded-md border object-contain"
        />
        <div className="grid min-w-0 gap-2">
          <span className="truncate text-muted-foreground">
            {current?.alt ?? "No image selected"}
          </span>
          <span className="flex gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <ImagePlus className="size-4" />
                  {current ? "Change" : "Choose"}
                </Button>
              </DialogTrigger>
              <DialogContent className="grid max-h-[85dvh] grid-rows-[auto_auto_1fr] sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Choose an image</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="Search by description…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <ul className="grid grid-cols-2 gap-3 overflow-y-auto p-1 sm:grid-cols-4">
                  {shown.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setId(m.id);
                          setOpen(false);
                        }}
                        className={cn(
                          "grid w-full cursor-pointer gap-1 rounded-md border p-1 text-left text-xs hover:border-ring",
                          m.id === id && "border-primary ring-1 ring-primary",
                        )}
                      >
                        <Thumb
                          src={m.src}
                          fallback={m.fallback}
                          alt={m.alt}
                          className="aspect-square w-full rounded bg-muted object-contain"
                        />
                        <span className="line-clamp-2 text-muted-foreground">{m.alt}</span>
                      </button>
                    </li>
                  ))}
                  {shown.length === 0 && (
                    <li className="col-span-full py-8 text-center text-muted-foreground">
                      No images match.
                    </li>
                  )}
                </ul>
              </DialogContent>
            </Dialog>
            {current && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setId("")}>
                <X className="size-4" />
                Remove
              </Button>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

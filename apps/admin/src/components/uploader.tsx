"use client";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Field } from "@/components/form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { saveUpload, signUpload } from "@/lib/actions/media";

const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX = 10 * 1024 * 1024; // Cloudinary free plan limit

/** Upload straight from the browser to Cloudinary (signed by the server), then record it. */
export function Uploader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);

  function reset() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setProgress(null);
    setError(null);
    form.current?.reset();
  }

  function pick(f: File | undefined) {
    setError(null);
    if (!f) return;
    if (!TYPES.includes(f.type)) return setError("Use a JPEG, PNG, WebP, AVIF or GIF image.");
    if (f.size > MAX) return setError("Images must be under 10 MB.");
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return setError("Choose an image first.");
    const fd = new FormData(e.currentTarget);
    const alt = String(fd.get("alt") ?? "");
    const credit = String(fd.get("credit") ?? "");
    setError(null);
    setProgress(0);
    const ticket = await signUpload(alt);
    if ("error" in ticket) {
      setProgress(null);
      return setError(ticket.error);
    }
    const body = new FormData();
    for (const [k, v] of Object.entries(ticket.fields)) body.append(k, v);
    body.append("file", file);
    // XHR (not fetch) for upload progress.
    const result = await new Promise<unknown>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", ticket.url);
      xhr.upload.onprogress = (ev) =>
        ev.lengthComputable && setProgress(Math.round((ev.loaded / ev.total) * 100));
      xhr.onload = () => {
        const json = JSON.parse(xhr.responseText || "{}");
        xhr.status < 300
          ? resolve(json)
          : reject(new Error(json.error?.message ?? `Upload failed (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error("Network error during upload."));
      xhr.send(body);
    }).catch((err: Error) => err);
    if (result instanceof Error) {
      setProgress(null);
      return setError(result.message);
    }
    const saved = await saveUpload(result, alt, credit);
    if (saved.error) {
      setProgress(null);
      return setError(saved.error);
    }
    setOpen(false);
    reset();
    router.refresh();
  }

  const busy = progress !== null;
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (busy) return;
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Upload className="size-4" />
          Upload image
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload an image</DialogTitle>
          <DialogDescription>
            JPEG, PNG, WebP, AVIF or GIF, up to 10 MB. Large photos are resized on delivery.
          </DialogDescription>
        </DialogHeader>
        <form ref={form} onSubmit={submit} className="grid gap-4">
          {error && <Alert variant="destructive">{error}</Alert>}
          <label
            className="grid min-h-40 cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed bg-muted text-sm text-muted-foreground hover:border-ring"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pick(e.dataTransfer.files[0]);
            }}
          >
            {preview ? (
              // biome-ignore lint/performance/noImgElement: local blob preview
              <img src={preview} alt="" className="max-h-56 w-full object-contain" />
            ) : (
              <span className="grid place-items-center gap-2 p-6 text-center">
                <Upload className="size-6" aria-hidden />
                Drop an image here or click to choose
              </span>
            )}
            <input
              type="file"
              accept={TYPES.join(",")}
              className="sr-only"
              onChange={(e) => pick(e.target.files?.[0])}
              disabled={busy}
            />
          </label>
          <Field
            label="Alt text"
            hint="Describe the image for people who can't see it, e.g. “Portrait of Ama Owusu”."
          >
            <Input name="alt" required maxLength={300} disabled={busy} />
          </Field>
          <Field label="Credit" hint="Optional photographer or source.">
            <Input name="credit" maxLength={200} disabled={busy} />
          </Field>
          {busy && (
            <div className="grid gap-1 text-xs text-muted-foreground" aria-live="polite">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {progress < 100 ? `Uploading… ${progress}%` : "Saving…"}
            </div>
          )}
          <Button type="submit" disabled={busy || !file}>
            {busy ? "Uploading…" : "Upload"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

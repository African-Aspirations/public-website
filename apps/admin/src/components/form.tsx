"use client";
import { inputClass } from "@aa/ui/recipes";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { FormState } from "@/lib/form-data";
import { cn } from "@/lib/utils";

/** A form bound to a server action: shows its error/saved message and a pending button. */
export function ActionForm({
  action,
  children,
  submitLabel = "Save",
  className,
  footer,
}: {
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  footer?: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className={cn("grid gap-5", className)}>
      {state.error && <Alert variant="destructive">{state.error}</Alert>}
      {state.saved && <Alert variant="success">Saved. It goes live on the next publish.</Alert>}
      {children}
      <div className="flex flex-wrap items-center gap-3 border-t pt-5">
        <Submit label={submitLabel} />
        {footer}
      </div>
    </form>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

/** Label + control + optional hint. */
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the control is passed as children
    <label className={cn("grid content-start gap-2 text-sm", className)}>
      <span className="font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cn(inputClass, "cursor-pointer pr-8", className)} {...props} />;
}

export function StatusField({ value }: { value?: "draft" | "published" }) {
  return (
    <Field label="Status" hint="Drafts stay off the public site.">
      <Select name="status" defaultValue={value ?? "published"}>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </Select>
    </Field>
  );
}

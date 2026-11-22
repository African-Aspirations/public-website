import { z } from "zod";

/** Returned by every form action; shown by <ActionForm>. */
export type FormState = { error?: string; saved?: boolean };

/** Read a FormData field as a trimmed string ("" → undefined), for zod. */
export function fields(form: FormData, names: string[]) {
  return Object.fromEntries(
    names.map((n) => {
      const v = form.get(n);
      const s = typeof v === "string" ? v.trim() : "";
      return [n, s === "" ? undefined : s];
    }),
  );
}

/** Repeated inputs (name="x" several times) → array of trimmed strings. */
export const all = (form: FormData, name: string) =>
  form.getAll(name).map((v) => (typeof v === "string" ? v.trim() : ""));

export const optText = (max: number) => z.string().max(max).optional();
export const reqText = (max: number, label: string) =>
  z
    .string({ error: `${label} is required` })
    .min(1, `${label} is required`)
    .max(max, `${label} is too long`);
export const optUrl = z
  .string()
  .refine(
    (v) => /^(https?:\/\/|\/|mailto:|tel:)/.test(v),
    "Links must start with https://, / , mailto: or tel:",
  )
  .optional();
export const uuidOpt = z.uuid().optional();
export const status = z.enum(["draft", "published"]).default("draft");
export const slug = z
  .string({ error: "Slug is required" })
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: lowercase letters, numbers and dashes only");

/** First zod issue as one readable sentence. */
export function firstError(e: z.ZodError) {
  return e.issues[0]?.message ?? "Please check the form.";
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * shadcn/ui (v4, new-york) class recipes, shared by the public site (Astro,
 * rendered at build time, zero JS) and the admin (shadcn React components).
 * Change a recipe here and both apps change together.
 *
 * Adapted from shadcn: dark-mode/file-input classes removed, focus rings replaced by
 * one global :focus-visible outline, shadows by plain box-shadow utilities (unused on the
 * site, and every class used becomes CSS inlined on every page); brand
 * `gold` variants added for primary calls to action.
 */
import { cva, type VariantProps } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium no-underline transition-colors disabled:pointer-events-none disabled:opacity-50 shrink-0`,
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        gold: "bg-gold text-gold-foreground hover:bg-gold-hover",
        destructive: "bg-destructive text-white hover:bg-destructive-hover",
        outline: "border bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 gap-1.5 px-3",
        lg: "h-11 px-6 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
export type ButtonVariants = VariantProps<typeof buttonVariants>;

export const badgeVariants = cva(
  "inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-white",
        outline: "text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
export type BadgeVariants = VariantProps<typeof badgeVariants>;

export const card = {
  root: "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-card",
  header: "grid auto-rows-min items-start gap-1.5 px-6",
  title: "font-semibold leading-none",
  description: "text-sm text-muted-foreground",
  content: "px-6",
  footer: "flex items-center px-6",
};

export const inputClass = `flex h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-base transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50`;

export const textareaClass = `flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-base transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50`;

export const labelClass = "flex flex-col gap-2 text-sm font-medium leading-none select-none";

export const alertVariants = cva(
  "relative grid w-full gap-y-0.5 rounded-lg border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        success: "border-brand-leaf bg-secondary text-secondary-foreground",
        destructive: "border-destructive bg-card text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
export type AlertVariants = VariantProps<typeof alertVariants>;

export const accordion = {
  item: "border-b last:border-b-0",
  trigger: `flex cursor-pointer list-none items-center justify-between gap-4 rounded-md py-4 text-left font-medium hover:underline [&::-webkit-details-marker]:hidden`,
  chevron: "size-4 shrink-0 text-muted-foreground group-open:rotate-180",
  content: "pb-4 text-muted-foreground",
};

export const separatorClass = "h-px w-full shrink-0 bg-border";

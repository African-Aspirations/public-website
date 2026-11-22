import { cn, labelClass } from "@aa/ui/recipes";

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  // biome-ignore lint/a11y/noLabelWithoutControl: callers nest the control or pass htmlFor.
  return <label className={cn(labelClass, className)} {...props} />;
}

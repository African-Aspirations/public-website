import { cn, inputClass } from "@aa/ui/recipes";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(inputClass, className)} {...props} />;
}

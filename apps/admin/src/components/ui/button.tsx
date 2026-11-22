import { type ButtonVariants, buttonVariants, cn } from "@aa/ui/recipes";

/** shadcn Button on the shared recipe (same look as the public site). */
export function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & ButtonVariants) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), "cursor-pointer", className)}
      {...props}
    />
  );
}

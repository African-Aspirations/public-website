import { type AlertVariants, alertVariants, cn } from "@aa/ui/recipes";

export function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & AlertVariants) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

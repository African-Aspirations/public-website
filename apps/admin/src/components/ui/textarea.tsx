import { cn, textareaClass } from "@aa/ui/recipes";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(textareaClass, className)} {...props} />;
}

import { card, cn } from "@aa/ui/recipes";

type P = React.ComponentProps<"div">;
export const Card = ({ className, ...p }: P) => <div className={cn(card.root, className)} {...p} />;
export const CardHeader = ({ className, ...p }: P) => (
  <div className={cn(card.header, className)} {...p} />
);
export const CardTitle = ({ className, ...p }: P) => (
  <div className={cn(card.title, className)} {...p} />
);
export const CardDescription = ({ className, ...p }: P) => (
  <div className={cn(card.description, className)} {...p} />
);
export const CardContent = ({ className, ...p }: P) => (
  <div className={cn(card.content, className)} {...p} />
);

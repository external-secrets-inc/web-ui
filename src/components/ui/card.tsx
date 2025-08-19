import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

type CardProps = React.HTMLAttributes<HTMLDivElement> & React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean };

const getCardComponentType = (asChild: boolean | undefined, onClick: React.MouseEventHandler<any> | undefined) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (asChild) return Slot;
  if (onClick) return 'button';
  return 'div';
};

const Card = React.forwardRef<HTMLElement, CardProps>(({ className, asChild, onClick, ...props }, ref) => {
  const Comp = getCardComponentType(asChild, onClick);

  return (
    <Comp
      ref={ref as React.Ref<HTMLDivElement & HTMLButtonElement & HTMLElement>}
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow",
        className,
        onClick && "cursor-pointer [text-align:unset]"
      )}
      onClick={onClick}
      {...props}
    />
  );
});
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

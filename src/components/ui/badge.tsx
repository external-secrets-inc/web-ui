import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary/40 bg-primary/15 text-primary-foreground shadow",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-destructive/60 bg-background ring-2 ring-destructive/15 text-destructive dark:text-destructive-foreground bg-gradient-to-tr from-destructive/0 to-destructive/15 dark:to-destructive/35 bg-clip-padding",
        warning:
          "border-warning/60 bg-background ring-2 ring-warning/15 text-warning dark:text-warning-foreground bg-gradient-to-tr from-warning/0 to-warning/15 dark:to-warning/35 bg-clip-padding",
        success:
          "border-success/60 bg-background ring-2 ring-success/15 text-success dark:text-success-foreground bg-gradient-to-tr from-success/0 to-success/15 dark:to-success/35 bg-clip-padding",
        outline: "text-foreground bg-background/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

// [cfviotti]: Added forwardRef to Badge to allow proper use with asChild parents
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"
    return (
      <Comp
        className={cn(badgeVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }

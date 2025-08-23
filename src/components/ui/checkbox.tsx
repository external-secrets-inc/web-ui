import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { LucideCheck, LucideMinus } from "lucide-react"

const checkboxVariants = cva(
  "peer shrink-0 rounded-xs border border-primary-muted transition-colors hover:bg-primary-muted/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary-muted text-primary-foreground data-[state=indeterminate]:text-primary-muted dark:border-input-accent dark:data-[state=checked]:bg-foreground dark:text-background dark:data-[state=indeterminate]:text-input-accent",
  {
    variants: {
      size: {
        sm: "size-4",
        xs: "size-3 rounded-[4px]",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
)

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size, ...props }, ref) => {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        checkboxVariants({ size, className }),
        props.checked === "indeterminate" && "bg-primary-muted/50 dark:bg-foreground/50"
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center transition-all text-current">
        {props.checked === "indeterminate" ? (
          <LucideMinus className={cn(size === "xs" ? "size-2" : "size-3")} />
        ) : (
          <LucideCheck className={cn(size === "xs" ? "size-2" : "size-3")} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

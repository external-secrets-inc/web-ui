import * as React from "react"
import { LucideLoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const loaderVariants = cva(
  "animate-spin text-muted-foreground shrink-0",
  {
    variants: {
      size: {
        sm: "size-4",
        md: "size-6",
        lg: "size-8",
      }
    },
    defaultVariants: {
      size: "sm"
    }
  }
)

interface LoaderProps
  extends React.HTMLAttributes<SVGSVGElement>,
    VariantProps<typeof loaderVariants> {}

const Loader = React.forwardRef<SVGSVGElement, LoaderProps>(
  ({ className, size, ...props }, ref) => (
    <LucideLoaderCircle
      ref={ref}
      className={cn(loaderVariants({ size, className }))}
      {...props}
    />
  )
)
Loader.displayName = "Loader"

export { Loader }
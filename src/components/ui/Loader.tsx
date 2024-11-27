import * as React from "react"
import { LucideLoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const loaderVariants = cva(
  "animate-spin text-muted-foreground",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
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
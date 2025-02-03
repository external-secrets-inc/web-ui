import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import mergeRefs from "merge-refs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./tooltip"

interface TrimmerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The content to be potentially truncated */
  children: React.ReactNode
  /**
   * Number of lines before truncation occurs.
   * - 0: No truncation, renders pure text (unless asChild is true)
   * - 1: Uses text-overflow: ellipsis (default)
   * - >1: Uses -webkit-line-clamp
   * @default 1
   */
  lineClamp?: number
  /**
   * When true, the component will be rendered as its child, merging props.
   * Useful for custom elements while maintaining truncation behavior.
   */
  asChild?: boolean
  /**
   * Disables the tooltip that shows on hover when text is truncated
   * @default false
   */
  disableTooltip?: boolean
  /** Additional classes to be merged with the default styles */
  className?: string
}

/**
 * A component that truncates text with a configurable number of lines and shows
 * a tooltip with the full content when truncated.
 * ATTENTION: This component is not optimized for wrapping complex components.
 * Prefer wrapping simple text elements for proper tooltip content rendering.
 *
 * @example
 * ```tsx
 * // Single line truncation (default)
 * <Trimmer>Long text to be truncated in a single line...</Trimmer>
 *
 * // Multi-line truncation
 * <Trimmer lineClamp={2}>Multiple lines of text that will be truncated right at the second line...</Trimmer>
 *
 * // Using with other components. (Use it sparingly as it's not optimized for complex components.)
 * <Trimmer asChild>
 *   <Badge className="max-w-[150px]">Truncated badge text...</Badge>
 * </Trimmer>
 * ```
 */

// Overflow check outside of the component to avoid unnecessary re-renders
const checkElementOverflow = (
  element: HTMLElement | null,
  isSingleLine: boolean
): boolean => {
  if (!element) return false

  return isSingleLine
    ? element.scrollWidth > element.clientWidth // Single line uses width comparison
    : element.scrollHeight > element.clientHeight // Multi-line uses height comparison
}

const Trimmer = React.forwardRef<HTMLSpanElement, TrimmerProps>(({
  children,
  lineClamp = 1,
  asChild = false,
  disableTooltip = false,
  className,
  ...props
}, ref
) => {
    // Tri-state boolean to avoid unnecessary re-renders when overflow status is known
    const [isOverflowing, setIsOverflowing] = React.useState<boolean | null>(null)
    const measurementRef = React.useRef<HTMLSpanElement>(null)

    // Memoize component choice to prevent unnecessary re-renders
    const Component = React.useMemo(() => asChild ? Slot : "span", [asChild])

    // Memoize classes to prevent recalculation on every render
    // `lineClamp` and `className` are deps because they should trigger a re-render when they change, as they affect the truncation behavior
    const classes = React.useMemo(() => cn(
      "max-w-[stretch] inline",
      lineClamp === 1 && "truncate",
      lineClamp > 1 && `line-clamp-[${lineClamp}]`,
      className
    ), [lineClamp, className])

    // Memoize the content to prevent unnecessary re-renders
    const truncatedContent = React.useMemo(() => (
      <Component
        ref={mergeRefs(measurementRef, ref)}
        className={classes}
        onMouseEnter={() => {
          if (disableTooltip) return
          // We should always check overflow on hover to handle if tooltip is needed
          // This is to handle potential content/layout changes but without the need of observeing the element constantly
          const isContentOverflowing = checkElementOverflow(measurementRef.current, lineClamp === 1)
          setIsOverflowing(isContentOverflowing)
        }}
        {...props}
      >
        {children}
      </Component>
    ), [Component, children, classes, disableTooltip, lineClamp, props, ref])

    // When explicitly set to 0 (no truncation), return original children to avoid unnecessary DOM nodes
    if (lineClamp === 0 && !asChild) {
      return <>{children}</>
    }

    // Return early if tooltip isn't needed
    if (disableTooltip || isOverflowing === false) {
      return truncatedContent
    }

    // Only wrap in tooltip when we know content is actually truncated
    if (isOverflowing === true) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {truncatedContent}
          </TooltipTrigger>
          <TooltipContent>
            {/* Reset any inherited styles to ensure tooltip content is clean */}
            <span className="[&>*]:[all:unset]">{children}</span>
          </TooltipContent>
        </Tooltip>
      )
    }

    return truncatedContent
  }
)

Trimmer.displayName = "Trimmer"

export { Trimmer }

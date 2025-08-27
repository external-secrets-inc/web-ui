import * as React from "react"
import { useButton, mergeProps } from "react-aria"
import { filterDOMProps, useObjectRef } from "@react-aria/utils"
import type { AriaButtonProps } from "react-aria"
import type { DOMProps, AriaLabelingProps, LinkDOMProps, GlobalDOMAttributes } from "@react-types/shared"

import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ButtonVariant = NonNullable<ButtonProps["variant"]>
type ButtonSize = NonNullable<ButtonProps["size"]>

/**
 * Props for `A11yDivButton`.
 *
 * A `div` that behaves like a button for flexible `asChild` composition while preserving
 * accessibility and cross-input behavior via React Aria.
 */
export interface A11yDivButtonProps
  extends Omit<AriaButtonProps<"div">, "elementType"> {
  /** Visual style to apply. Use `"unstyled"` to render a plain div with button semantics. */
  variant?: ButtonVariant | "unstyled"
  /** Size to apply (only used when variant is not `"unstyled"`). */
  size?: ButtonSize
  /** Optional class to merge into the underlying div. */
  className?: string
}

/**
 * Accessible div-based button built on React Aria's useButton.
 *
 * Provides button accessibility and behavior for `div` elements using React Aria's `useButton`.
 * Useful when you want button semantics without rendering a native `<button>` (e.g., to avoid
 * nesting buttons or to compose with `asChild` primitives while keeping a `div` in the DOM).
 *
 * ## Features
 * - Normalized press interactions (mouse, touch, keyboard, screen reader) via `useButton`/`usePress`.
 * - Optional design-system styles by rendering our `Button` with `asChild` (keeps the `div`).
 * - Forwards valid DOM/ARIA props and events; preserves all `data-*` and `aria-*` attributes.
 *
 * ## Event handling quirks
 * - Prefer React Aria press handlers (`onPress`, `onPressStart`, `onPressEnd`, `onPressUp`, `onPressChange`).
 *   These are routed to `useButton` and not spread to the DOM.
 * - Standard DOM events (e.g., pointer/focus) and attributes flow through to support Radix triggers.
 * - `onClick` is allowed but not recommended; `onPress` is richer and more consistent across inputs.
 * @see https://react-spectrum.adobe.com/react-aria/usePress.html
 * @see https://react-spectrum.adobe.com/react-aria/useButton.html
 *
 * ## When to use
 * - You need a button-like element but must keep a `div` in the DOM (e.g., to avoid nested buttons).
 * - You want to compose with `asChild` components (e.g., Radix) yet retain proper button semantics.
 * - If chaining multiple `asChild` primitives and `data-state` conflicts arise, wrap with `DataStateEventBridge`.
 *
 * @example Unstyled (semantic div)
 * ```tsx
 * <A11yDivButton variant="unstyled" onPress={() => doThing()}>Click me</A11yDivButton>
 * ```
 *
 * @example Styled via Button asChild
 * ```tsx
 * <Tooltip>
 *   <TooltipTrigger asChild>
 *     <A11yDivButton variant="secondary" onPress={save}>Save</A11yDivButton>
 *   </TooltipTrigger>
 *   <TooltipContent>Save changes</TooltipContent>
 * </Tooltip>
 * ```
 */
export const A11yDivButton = React.forwardRef<HTMLDivElement, A11yDivButtonProps>(
  (
    {
      variant = "default",
      size = "default",
      className,
      children,
      ...rest
    },
    forwardedRef
  ) => {
    const objectRef = useObjectRef<HTMLDivElement>(forwardedRef)

    const {
      onPress,
      onPressStart,
      onPressEnd,
      onPressChange,
      onPressUp,
      isDisabled,
      ...otherProps
    } = rest

    const { buttonProps } = useButton(
      {
        onPress,
        onPressStart,
        onPressEnd,
        onPressChange,
        onPressUp,
        isDisabled,
        ...(otherProps as AriaButtonProps<"div">),
        elementType: "div",
      },
      objectRef
    )

    const domProps = filterDOMProps(
      otherProps as DOMProps & AriaLabelingProps & LinkDOMProps & GlobalDOMAttributes,
      {
        labelable: true,
        global: true,
        events: true,
        propNames: new Set(["data-state"]),
      }
    )
    const dataAndAria: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(otherProps as Record<string, unknown>)) {
      if (key.startsWith("data-") || key.startsWith("aria-")) {
        dataAndAria[key] = value
      }
    }
    const mergedProps = mergeProps(buttonProps, domProps, dataAndAria)

    const computedClassName = cn(className, isDisabled ? "pointer-events-none opacity-50" : undefined)

    if (variant === "unstyled") {
      return (
        <div ref={objectRef} className={computedClassName} {...mergedProps}>
          {children}
        </div>
      )
    }

    return (
      <Button asChild variant={variant} size={size} className={computedClassName}>
        <div ref={objectRef} {...mergedProps}>
          {children}
        </div>
      </Button>
    )
  }
)
A11yDivButton.displayName = "A11yDivButton"

export default A11yDivButton



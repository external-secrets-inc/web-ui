import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useButton } from "react-aria";
import { cn } from "@/lib/utils";
import mergeRefs from "merge-refs";

/**
 * Props for A11yDivButton component.
 */
export type A11yDivButtonProps = Pick<
  ButtonProps,
  "size" | "disabled"
> & {
  /** Button variant, including custom 'unstyled' option */
  variant?: ButtonProps["variant"] | "unstyled";
} &
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    | "onClick"
    | "onKeyDown"
    | "onKeyUp"
    | "onFocus"
    | "onBlur"
    | "onMouseDown"
    | "onMouseUp"
  > & {
    children?: React.ReactNode;
    /** Callback fired when button is activated (click, Enter, or Space) */
    onPress?: () => void;
    /** Callback fired when press interaction starts */
    onPressStart?: () => void;
    /** Callback fired when press interaction ends */
    onPressEnd?: () => void;
    /** Callback fired when press state changes */
    onPressChange?: (isPressed: boolean) => void;
  };

/**
 * Accessible div-based button component.
 *
 * Provides button accessibility and behavior for div elements using React Aria's useButton hook.
 * Useful for avoiding nested native button elements.
 *
 * ## Event Handling (IMPORTANT PLEASE READ)
 *
 * This component uses React Aria's normalized event system, which **replaces** standard DOM events
 * with unified, accessible alternatives. You cannot mix standard DOM events (onClick, onKeyDown)
 * with React Aria events - use only the events provided by this component.
 *
 * **React Aria Events (use these):**
 * - `onPress`: Main interaction (replaces onClick)
 * - `onPressStart`: When press interaction begins
 * - `onPressEnd`: When press interaction ends
 * - `onPressChange`: When press state changes
 *
 * **Standard DOM Events (avoid these):**
 * - `onClick`, `onKeyDown`, `onKeyUp`, `onFocus`, `onBlur`, `onMouseDown`, `onMouseUp`
 *
 * ## When to use
 * - Button behavior in a div element
 * - To avoid nested native button elements (e.g., buttons inside other buttons)
 * - Custom button implementations with full accessibility
 *
 * ## Features
 * - Full button accessibility (keyboard, screen readers, focus management)
 * - Leverages existing Button component styling via `asChild`
 * - Accepts all div props (ARIA, className, style, etc.)
 * - **className merging**: Custom classes are merged with button variants using `cn()` utility
 *
 * @example
 * ```tsx
 * <A11yDivButton onPress={handleRemove} aria-label="Remove item">
 *   <LucideX />
 * </A11yDivButton>
 * ```
 *
 * @example
 * ```tsx
 * <A11yDivButton variant="ghost" size="icon" onPress={handleAction}>
 *   <LucideSettings />
 * </A11yDivButton>
 * ```
 *
 * @example
 * ```tsx
 * // Advanced: Using press state and timing events
 * <A11yDivButton
 *   onPress={handleAction}
 *   onPressStart={() => console.log('Press started')}
 *   onPressEnd={() => console.log('Press ended')}
 *   onPressChange={(isPressed) => console.log('Press state:', isPressed)}
 * >
 *   Interactive Button
 * </A11yDivButton>
 * ```
 *
 * @example
 * ```tsx
 * // Custom styling with cn() utility
 * <A11yDivButton
 *   variant="outline"
 *   size="sm"
 *   className={cn(
 *     "hover:bg-accent/50",
 *     "focus:ring-2 focus:ring-ring",
 *     "transition-all duration-200"
 *   )}
 *   onPress={handleAction}
 * >
 *   Custom Styled Button
 * </A11yDivButton>
 * ```
 */
export const A11yDivButton = React.forwardRef<
  HTMLDivElement,
  A11yDivButtonProps
>(
  (
    {
      disabled,
      variant,
      size,
      children,
      onPress,
      onPressStart,
      onPressEnd,
      onPressChange,
      className,
      ...props
    },
    ref
  ) => {
    const divRef = React.useRef<HTMLDivElement | null>(null);

    const { buttonProps, isPressed } = useButton(
      {
        isDisabled: Boolean(disabled),
        onPress,
        onPressStart,
        onPressEnd,
        onPressChange,
        elementType: "div",
        ...props, // Forward other props including ARIA attributes
      },
      divRef
    );

    // Handle unstyled variant - render div directly without Button wrapper
    if (variant === "unstyled") {
      return (
        <div
          ref={mergeRefs(divRef, ref)}
          {...buttonProps}
          {...props}
          className={cn(buttonProps.className, className)}
          data-pressed={isPressed || undefined}
        >
          {children}
        </div>
      );
    }

    // Handle styled variants - use Button component
    return (
      <Button
        asChild
        variant={variant}
        size={size}
        disabled={disabled}
        className={cn(
          // buttonProps.className contains the base button styles
          buttonProps.className,
          // Custom className from props
          className
        )}
        data-pressed={isPressed || undefined}
      >
        <div
          ref={mergeRefs(divRef, ref)}
          {...buttonProps}
          {...props} // Forward all props including style, etc.
        >
          {children}
        </div>
      </Button>
    );
  }
);

A11yDivButton.displayName = "A11yDivButton";

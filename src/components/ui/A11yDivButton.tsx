import { filterDOMProps, useObjectRef } from "@react-aria/utils";
import type {
  AriaLabelingProps,
  DOMProps,
  GlobalDOMAttributes,
  LinkDOMProps,
} from "@react-types/shared";
import * as React from "react";
import type { AriaButtonProps } from "react-aria";
import { mergeProps, useButton } from "react-aria";

import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonVariant = NonNullable<ButtonProps["variant"]>;
type ButtonSize = NonNullable<ButtonProps["size"]>;

/**
 * Props for `A11yDivButton`.
 *
 * A `div` that behaves like a button for flexible `asChild` composition while preserving
 * accessibility and cross-input behavior via React Aria.
 */
export interface A11yDivButtonProps
  extends Omit<AriaButtonProps<"div">, "elementType"> {
  /** Visual style to apply. Use `"unstyled"` to render a plain div with button semantics. */
  variant?: ButtonVariant | "unstyled";
  /** Size to apply (only used when variant is not `"unstyled"`). */
  size?: ButtonSize;
  /** Optional class to merge into the underlying div. */
  className?: string;
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
 * - Forwards valid DOM/ARIA props and events preserves all `data-*` and `aria-*` attributes.
 *
 * ## Event handling quirks
 * - Prefer React Aria press handlers (`onPress`, `onPressStart`, `onPressEnd`, `onPressUp`, `onPressChange`).
 *   These are routed to `useButton` and not spread to the DOM.
 * - When composing with overlay triggers (e.g., Radix Popover/Tooltip) identified by `aria-haspopup`/`aria-controls`,
 *   pointer-driven handlers (`onPointerDown`/`onMouseDown`/`onPointerUp`/`onMouseUp`) from `useButton` are removed so
 *   the overlay library receives the raw pointer events. Keyboard and click semantics remain via React Aria.
 * - `onClick` is allowed but not recommended `onPress` is richer and more consistent across inputs.
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
export const A11yDivButton = React.forwardRef<
  HTMLDivElement,
  A11yDivButtonProps
>(
  (
    { variant = "default", size = "default", className, children, ...rest },
    forwardedRef
  ) => {
    const objectRef = useObjectRef<HTMLDivElement>(forwardedRef);

    const {
      onPress,
      onPressStart,
      onPressEnd,
      onPressChange,
      onPressUp,
      isDisabled,
      ...otherProps
    } = rest;

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
    );

    // Detect overlay triggers (Radix Popover/Tooltip/Select triggers) to prevent pointer event conflicts
    const isOverlayTrigger =
      Object.prototype.hasOwnProperty.call(
        otherProps as Record<string, unknown>,
        "aria-haspopup"
      ) ||
      Object.prototype.hasOwnProperty.call(
        otherProps as Record<string, unknown>,
        "aria-controls"
      );

    const finalButtonProps = React.useMemo(() => {
      if (!isOverlayTrigger) return buttonProps;
      const clone: Record<string, unknown> = {
        ...(buttonProps as Record<string, unknown>),
      };
      // Remove pointer handlers to let Radix own pointer events while preserving keyboard semantics
      delete clone["onPointerDown"];
      delete clone["onMouseDown"];
      delete clone["onPointerUp"];
      delete clone["onMouseUp"];
      // Preserve any internal onClick from React Aria without affecting overlay/parent behavior
      const prevOnClick = clone["onClick"] as
        | React.MouseEventHandler<HTMLDivElement>
        | undefined;
      clone["onClick"] = (e: React.MouseEvent<HTMLDivElement>) => {
        prevOnClick?.(e);
      };
      return clone as typeof buttonProps;
    }, [buttonProps, isOverlayTrigger]);

    const domProps = filterDOMProps(
      otherProps as DOMProps &
        AriaLabelingProps &
        LinkDOMProps &
        GlobalDOMAttributes,
      {
        labelable: true,
        global: true,
        events: true,
        propNames: new Set(["data-state"]), // Preserve data-state for Radix state management
      }
    );

    const composedDomProps = React.useMemo(() => {
      if (!isOverlayTrigger) return domProps;
      const domOnClick = (domProps as unknown as Record<string, unknown>)[
        "onClick"
      ] as React.MouseEventHandler<HTMLDivElement> | undefined;
      return {
        ...(domProps as object),
        onClick: (e: React.MouseEvent<HTMLDivElement>) => {
          // Let Radix run first to open the overlay, then block navigation/parent handlers
          domOnClick?.(e);
          e.preventDefault();
          e.stopPropagation();
        },
      } as typeof domProps;
    }, [domProps, isOverlayTrigger]);

    // Extract data-* and aria-* attributes that filterDOMProps doesn't handle
    const dataAndAria: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      otherProps as Record<string, unknown>
    )) {
      if (key.startsWith("data-") || key.startsWith("aria-")) {
        dataAndAria[key] = value;
      }
    }

    // Prioritize Radix handlers to maintain proper event ordering
    const mergedProps = mergeProps(dataAndAria, finalButtonProps, composedDomProps);


    const computedClassName = cn(
      className,
      isDisabled ? "pointer-events-none opacity-50" : undefined
    );

    if (variant === "unstyled") {
      return (
        <div ref={objectRef} className={computedClassName} {...mergedProps}>
          {children}
        </div>
      );
    }

    return (
      <Button
        asChild
        variant={variant}
        size={size}
        className={computedClassName}
      >
        <div ref={objectRef} {...mergedProps}>
          {children}
        </div>
      </Button>
    );
  }
);
A11yDivButton.displayName = "A11yDivButton";

export default A11yDivButton;

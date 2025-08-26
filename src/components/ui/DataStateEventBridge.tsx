import { forwardRef, type ComponentProps, type ElementType } from "react";
import { Slot } from "@radix-ui/react-slot";

/**
 * `DataStateEventBridge` is a utility component designed to resolve `data-state`
 * attribute conflicts when composing multiple Radix UI primitives, especially with `asChild`.
 * This issue is tracked at: https://github.com/radix-ui/primitives/discussions/560
 *
 * When a `data-state` prop is provided to `DataStateEventBridge`, it "lifts" this
 * `data-state` and associated interactive event handlers (pointer and focus events)
 * onto an intermediate `<span>` element. This `<span>` uses `className="contents"`
 * to prevent layout interference. The original children are then rendered via `<Slot>`,
 * enabling them to manage their own `data-state` or receive `data-state` from
 * another Radix primitive without conflict.
 *
 * The component specifically handles and lifts the following props if present:
 * - `"data-state"`
 * - `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOver`, `onPointerOut`
 * - `onFocus`, `onBlur`
 *
 * All other props, including `children` and other event handlers (e.g., `onSelect`,
 * `onValueChange`), are passed through to the `<Slot>` and subsequently to its child.
 * The `ref` is also forwarded through the `<Slot>` to its underlying element.
 *
 * This explicit handling of pointer and focus events is crucial as they are
 * commonly tied to `data-state` in interactive Radix components.
 *
 * When nesting multiple asChild components (e.g., TooltipTrigger -> DropdownMenuItem -> ToggleGroupItem),
 * place DataStateEventBridge immediately before the component whose data-state
 * and interactive events you need to bridge (in this example, ToggleGroupItem).
 *
 * @example
 * import { Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
 * import { DropdownMenu, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
 * import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
 * // Assuming DataStateEventBridge is imported correctly, e.g.:
 * // import { DataStateEventBridge } from "./DataStateEventBridge";
 *
 * function MyComponent() {
 *   return (
 *     <Tooltip>
 *       <TooltipTrigger asChild>
 *         <DropdownMenuItem asChild>
 *           <DataStateEventBridge>
 *             <ToggleGroupItem value="example">
 *               Toggle Button
 *             </ToggleGroupItem>
 *           </DataStateEventBridge>
 *         </DropdownMenuItem>
 *       </TooltipTrigger>
 *       <TooltipContent>Tooltip text</TooltipContent>
 *     </Tooltip>
 *   );
 * }
 */
export const DataStateEventBridge = forwardRef<
  HTMLElement,
  ComponentProps<ElementType>
>((props, ref) => {
  const {
    "data-state": dataState,
    children,
    // Pointer events
    onPointerEnter,
    onPointerLeave,
    onPointerMove,
    onPointerOver,
    onPointerOut,
    // Focus events
    onFocus,
    onBlur,
    // Other props are passed to Slot
    ...rest
  } = props;

  if (dataState) {
    return (
      <span
        data-state={dataState}
        // Pointer events
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        // Focus events
        onFocus={onFocus}
        onBlur={onBlur}
        className="contents"
      >
        <Slot {...rest} ref={ref}>
          {children}
        </Slot>
      </span>
    );
  }

  // If no data-state, simply pass through using Slot.
  return (
    <Slot {...rest} ref={ref}>
      {children}
    </Slot>
  );
});

DataStateEventBridge.displayName = "DataStateEventBridge";

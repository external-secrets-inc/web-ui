// inspired by this repo: https://github.com/sersavan/shadcn-EsiSelect-component

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  useCommandState,
} from "@/components/ui/command";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { defaultFilter } from "cmdk";
import {
  LucideCheck,
  LucideCheckCheck,
  LucideEraser,
  LucideX,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Trimmer } from "@/components/ui/Trimmer";
import { useMemo } from "react";
import {
  BadgeGroup,
  type BadgeItem,
  type BadgeGroupProps,
} from "@/components/ui/BadgeGroup";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataStateEventBridge } from "@/components/ui/DataStateEventBridge";

/**
 * Context for EsiSelect component
 * This context is used to share state and functions across the EsiSelect
 * inner components.
 */
interface EsiSelectContextValue {
  selectedValues: string[];
  options: Option[];
  maxCount: number | "auto" | undefined;
  placeholder: string;
  isOpen: boolean;
  toggleOption: (value: string) => void;
  clearExtraOptions: () => void;
  handleClear: () => void;
  setIsOpen: (openOrUpdater: boolean | ((prev: boolean) => boolean)) => void;
  updateSelection: (values: string[]) => void;
  itemRefs: React.MutableRefObject<Map<string, CommandItemRef>>;
  setAutoVisibleCount: (n: number) => void;
  disabled: boolean;
  mode: "single" | "multiple";
}
const EsiSelectContext = React.createContext<EsiSelectContextValue | undefined>(
  undefined
);

export interface Option {
  /** The text to display for the option. */
  label: string;
  /** The unique value associated with the option. */
  value: string;
  /** Optional icon component to display alongside the option. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional group this option belongs to. Used for grouping options visually. */
  group?: string;
}

/**
 * Context object provided to EsiSelect render props.
 * Supplies selection state and imperative actions so overrides can integrate safely
 * without re-implementing internal wiring.
 */
export type EsiSelectRenderContext = {
  selectedValues: string[];
  options: Option[];
  mode: "single" | "multiple";
  isOpen: boolean;
  disabled: boolean;
  clear: () => void;
  toggleOption: (value: string) => void;
  setIsOpen: (open: boolean) => void;
};

type CommandItemRef = {
  id: string;
  value: string;
  element: HTMLElement;
};

/**
 * Shared props for EsiSelect component. Mode-specific props are defined below.
 */
export type BaseEsiSelectProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "value" | "onChange" | "defaultValue"
> & {
  /**
   * An array of option objects to be displayed in the EsiSelect component.
   * Each option object has a label, value, and an optional icon.
   */
  options: Option[];

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string;
  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean;

  /**
   * If true, renders the EsiSelect component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean;

  /**
   * Additional class names to apply custom styles to the EsiSelect component.
   * Optional, can be used to add custom styles.
   */
  className?: string;

  /**
   * The controlled open state of the popover. Must be used in conjunction with onOpenChange.
   */
  open?: boolean;

  /**
   * Event handler called when the open state of the popover changes.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * The open state of the popover when it is initially rendered. Use when you do not need to control its open state.
   */
  defaultOpen?: boolean;

  /** Disable trigger interaction and focus. */
  disabled?: boolean;

  /**
   * Override the inner content of the trigger while preserving the trigger chrome
   * (combobox role, caret icon, keyboard interactions).
   * Return `null` or `undefined` to fall back to the default trigger rendering.
   */
  renderTrigger?: (ctx: EsiSelectRenderContext) => React.ReactNode;

  /**
   * Override the scrollable list area content inside the popover while keeping
   * the search bar and (in multiple mode) the footer. Useful to render loading,
   * error, or empty states. Return `null`/`undefined` to use the default list.
   */
  renderListContent?: (ctx: EsiSelectRenderContext) => React.ReactNode;

  /**
   * Customizes the message displayed when no items match (or when there are no items).
   * Applies to the built-in empty state from CMDK. If `renderListContent` returns
   * a node, that takes precedence and the built-in empty state is suppressed.
   * Defaults to "No results found.".
   */
  emptyState?: React.ReactNode;

  /**
   * Customize how each option row renders inside the command list.
   * Provided nodes preserve default styling while enabling custom composition.
   */
  renderOption?: (ctx: {
    option: Option;
    isSelected: boolean;
    checkboxNode: React.ReactNode;
    iconNode?: React.ReactNode;
    labelNode: React.ReactNode;
  }) => React.ReactNode;
  /** Optional className for each option row. */
  optionItemClassName?: string;
  /**
   * Surface props for each option row. Accepts a static value or a function of context.
   */
  optionItemProps?:
    | Partial<React.ComponentProps<typeof CommandItem>>
    | ((ctx: {
        option: Option;
        isSelected: boolean;
      }) => Partial<React.ComponentProps<typeof CommandItem>>);
  /**
   * Customizes the selected option display in the trigger for single mode.
   * Provides the same API surface as renderSelectedBadge for consistency.
   */
  renderSelectedTrigger?: (ctx: {
    option: Option;
    selectedValue: string;
    labelNode: React.ReactNode;
    iconNode?: React.ReactNode;
  }) => React.ReactNode;
  /**
   * Surface props for the selected option in single mode trigger.
   * Accepts a static value or a function of context.
   */
  selectedTriggerProps?:
    | Partial<React.HTMLAttributes<HTMLSpanElement>>
    | ((ctx: {
        option: Option;
        selectedValue: string;
      }) => Partial<React.HTMLAttributes<HTMLSpanElement>>);
};

/**
 * Shared customization interface for badge-related props
 */
interface BadgeCustomization {
  /**
   * Customize how selected badges (shown in the trigger) are rendered.
   * `renderSelectedBadge` can override inner content while keeping BadgeGroup truncation via provided nodes.
   * `selectedExtraBadge` customizes the "+N" counter badge.
   */
  selectedBadgeDefaults?: Partial<BadgeItem>;
  selectedExtraBadge?: BadgeGroupProps["extraBadge"];
  renderSelectedBadge?: (ctx: {
    option: Option;
    resolved: BadgeItem;
    labelNode: React.ReactNode;
    iconNode?: React.ReactNode;
    remove: () => void;
    removeNode: React.ReactNode;
  }) => React.ReactNode;
  /**
   * Surface props for each selected badge. Accepts a static value or a function of context.
   */
  selectedBadgeProps?:
    | Partial<BadgeItem>
    | ((option: Option) => Partial<BadgeItem>);
}

export type EsiSelectSingleProps = BaseEsiSelectProps & {
  mode?: "single"; // default
  /**
   * Controlled value in single mode.
   * - undefined: uncontrolled (component manages selection internally)
   * - null: controlled empty (clears selection)
   * - string (including ""): controlled selected value (empty string is allowed as a real option)
   */
  value?: string | null;
  /**
   * Initial value in single mode (uncontrolled). Ignored when `value` is provided.
   * Accepts `null` for empty or a string (including "") to preselect an option.
   */
  defaultValue?: string | null;
  /**
   * Change handler in single mode. Called with `null` when the selection is cleared.
   */
  onValueChange: (value: string | null) => void;
};

export type EsiSelectMultipleProps = BaseEsiSelectProps &
  BadgeCustomization & {
    mode: "multiple";
    /**
     * Controlled values in multiple mode.
     * - undefined: uncontrolled (component manages selection internally)
     * - []: controlled empty (clears all selections)
     * - [..]: controlled selected values
     */
    value?: string[];
    /**
     * Initial values in multiple mode (uncontrolled). Ignored when `value` is provided.
     */
    defaultValue?: string[];
    /**
     * Change handler in multiple mode. Called with an empty array when the selection is cleared.
     */
    onValueChange?: (value: string[]) => void;
    /**
     * Maximum number of items to display. Extra selected items will be summarized.
     * - undefined: show all badges with dynamic height (alternatively, use can also set to `Infinity` too)
     * - number: hard limit of badges before showing +N more
     * - "auto": automatically determine limit based on available width
     * Optional, defaults to undefined.
     */
    maxCount?: number | "auto";
    /** ClassName applied to the BadgeGroup that renders the selected badges. */
    selectedBadgeGroupClassName?: string;
  };

export type EsiSelectProps = EsiSelectSingleProps | EsiSelectMultipleProps;

// Components
// Lightweight contexts to pass customization to inner components
const SelectedBadgeCustomizationContext = React.createContext<
  BadgeCustomization & { selectedBadgeGroupClassName?: string }
>({});

const SingleTriggerCustomizationContext = React.createContext<{
  renderSelectedTrigger?: BaseEsiSelectProps["renderSelectedTrigger"];
  selectedTriggerProps?: BaseEsiSelectProps["selectedTriggerProps"];
}>({});

type OptionCustomization = {
  renderOption?: (ctx: {
    option: Option;
    isSelected: boolean;
    checkboxNode: React.ReactNode;
    iconNode?: React.ReactNode;
    labelNode: React.ReactNode;
  }) => React.ReactNode;
  optionItemClassName?: string;
  /**
   * Surface props for each option row. Accepts a static value or a function of context.
   */
  optionItemProps?:
    | Partial<React.ComponentProps<typeof CommandItem>>
    | ((ctx: {
        option: Option;
        isSelected: boolean;
      }) => Partial<React.ComponentProps<typeof CommandItem>>);
};
const OptionCustomizationContext = React.createContext<OptionCustomization>({});

export const EsiSelect = React.forwardRef<HTMLDivElement, EsiSelectProps>(
  (props, ref) => {
    const {
      options,
      placeholder = "Select options",
      modalPopover = true,
      className,
      open,
      onOpenChange,
      defaultOpen = false,
      renderOption,
      optionItemClassName,
      optionItemProps,
      disabled,
      renderTrigger,
      renderListContent,
      emptyState,
      // Extract only the DOM props we explicitly want to pass through
      id,
      style,
    } = props;

    // Only pass through explicitly allowed DOM props
    const domProps = {
      ...(id && { id }),
      ...(style && { style }),
    };

    const mode: "single" | "multiple" =
      (props as EsiSelectProps).mode ?? "single";
    const isMultiple = mode === "multiple";

    const multipleProps = isMultiple
      ? (props as EsiSelectMultipleProps)
      : undefined;
    const singleProps = !isMultiple
      ? (props as EsiSelectSingleProps)
      : undefined;

    const maxCount = multipleProps?.maxCount;

    const controlledArrayValue = React.useMemo(() => {
      if (isMultiple) return multipleProps?.value;
      const v = singleProps?.value;
      // Controlled single-value cases:
      // - undefined => uncontrolled
      // - null => controlled empty selection
      // - string (including empty string) => controlled selected value
      if (v === undefined) return undefined;
      if (v === null) return [];
      return [v as string];
    }, [isMultiple, multipleProps?.value, singleProps?.value]);
    const defaultArrayValue = isMultiple
      ? multipleProps?.defaultValue ?? []
      : singleProps?.defaultValue
      ? [singleProps.defaultValue]
      : [];

    const [selectedValues, setSelectedValues] = React.useState<string[]>(
      controlledArrayValue ?? defaultArrayValue
    );
    const [internalIsOpen, setInternalIsOpen] = React.useState(defaultOpen);
    const [autoVisibleCount, setAutoVisibleCount] = React.useState<
      number | undefined
    >(undefined);

    // Keep internal state in sync when value is controlled
    React.useEffect(() => {
      if (controlledArrayValue) {
        setSelectedValues(controlledArrayValue);
      } else if (
        controlledArrayValue === null ||
        controlledArrayValue === undefined
      ) {
        // do nothing; uncontrolled
      }
    }, [controlledArrayValue]);

    // Use controlled open state if provided, otherwise use internal state
    const isOpen = open !== undefined ? open : internalIsOpen;

    const handleOpenChange = React.useCallback(
      (openOrUpdater: boolean | ((prev: boolean) => boolean)) => {
        const newOpen =
          typeof openOrUpdater === "function"
            ? openOrUpdater(isOpen)
            : openOrUpdater;

        // Update internal state only if not controlled
        if (open === undefined) {
          setInternalIsOpen(newOpen);
        }

        // Always call the callback
        onOpenChange?.(newOpen);
      },
      [onOpenChange, isOpen, open]
    );

    const itemRefs = React.useRef<Map<string, CommandItemRef>>(new Map());

    const updateSelection = React.useCallback(
      (newValues: string[]) => {
        if (isMultiple) {
          const fn = (multipleProps?.onValueChange ?? (() => {})) as (
            v: string[]
          ) => void;
          if (multipleProps?.value === undefined) {
            setSelectedValues(newValues);
          }
          fn(newValues);
          return;
        }
        const next = newValues.length > 0 ? newValues[0] : null;
        const fn = (singleProps?.onValueChange ?? (() => {})) as (
          v: string | null
        ) => void;
        if (singleProps?.value === undefined) {
          setSelectedValues(next ? [next] : []);
        }
        fn(next);
      },
      [isMultiple, multipleProps, singleProps]
    );

    const toggleOption = React.useCallback(
      (option: string) => {
        if (isMultiple) {
          const newValues = selectedValues.includes(option)
            ? selectedValues.filter((value) => value !== option)
            : [...selectedValues, option];
          updateSelection(newValues);
          return;
        }
        // single mode: selecting sets the single value; clicking same keeps it (clearing is via trigger X)
        updateSelection([option]);
        setInternalIsOpen(false);
      },
      [isMultiple, selectedValues, updateSelection]
    );

    const handleClear = React.useCallback(() => {
      updateSelection([]);
    }, [updateSelection]);

    const clearExtraOptions = React.useCallback(() => {
      if (maxCount === "auto") {
        updateSelection(
          selectedValues.slice(0, autoVisibleCount ?? selectedValues.length)
        );
      } else if (typeof maxCount === "number") {
        updateSelection(selectedValues.slice(0, maxCount)); // In numbered mode, use the maxCount prop directly
      }
    }, [selectedValues, maxCount, autoVisibleCount, updateSelection]);

    const contextValue = React.useMemo(
      () => ({
        selectedValues,
        options,
        maxCount,
        placeholder,
        isOpen,
        toggleOption,
        clearExtraOptions,
        handleClear,
        setIsOpen: handleOpenChange,
        updateSelection,
        itemRefs,
        setAutoVisibleCount,
        disabled: Boolean(disabled),
        mode,
      }),
      [
        selectedValues,
        options,
        maxCount,
        placeholder,
        isOpen,
        toggleOption,
        clearExtraOptions,
        handleClear,
        handleOpenChange,
        updateSelection,
        setAutoVisibleCount,
        disabled,
        mode,
      ]
    );

    /**
     * Customize CMDK fuzzy search for two complementary needs:
     * - Use stable IDs as option values (so duplicate labels don’t collide; correct hover/focus)
     * - Search by labels only for UX (not by IDs)
     *
     * Without this split we either match by IDs (poor UX) or break hover states with duplicate labels.
     * We score by label here (defaultFilter) and rely on CMDK’s filtered state (by item id)
     * to resolve the actual matched set (see useFilteredOptions).
     */
    const fuzzyFilterOptionsByLabels = React.useCallback(
      (value: string, search: string) => {
        const option = options.find((opt) => opt.value === value);
        if (!option) return 0;
        return (
          defaultFilter as (
            value: string,
            search: string,
            keywords?: string[]
          ) => number
        )(option.label, search, []);
      },
      [options]
    );

    const listboxId = React.useId();

    // Render-prop context (stable object shape for overrides)
    const renderCtx = React.useMemo<EsiSelectRenderContext>(
      () => ({
        selectedValues,
        options,
        mode,
        isOpen,
        disabled: Boolean(disabled),
        clear: handleClear,
        toggleOption,
        setIsOpen: (open) => handleOpenChange(open),
      }),
      [selectedValues, options, mode, isOpen, disabled, handleClear, toggleOption, handleOpenChange]
    );

    // If a custom list content is provided, we use it to replace the default list.
    // This also disables the Select-All control, while keeping Search and Footer intact.
    const customListContent = renderListContent?.(renderCtx);

    return (
      <EsiSelectContext.Provider value={contextValue}>
        <SelectedBadgeCustomizationContext.Provider
          value={{
            selectedExtraBadge: multipleProps?.selectedExtraBadge,
            renderSelectedBadge: multipleProps?.renderSelectedBadge,
            selectedBadgeProps: multipleProps?.selectedBadgeProps,
            selectedBadgeGroupClassName:
              multipleProps?.selectedBadgeGroupClassName,
          }}
        >
          <SingleTriggerCustomizationContext.Provider
            value={{
              renderSelectedTrigger: singleProps?.renderSelectedTrigger,
              selectedTriggerProps: singleProps?.selectedTriggerProps,
            }}
          >
            <OptionCustomizationContext.Provider
              value={{ renderOption, optionItemClassName, optionItemProps }}
            >
              <Popover
                open={!disabled && isOpen}
                onOpenChange={handleOpenChange}
                modal={modalPopover}
              >
                <EsiSelectPopoverTrigger
                  ref={ref}
                  {...domProps}
                  disabled={disabled}
                  listboxId={listboxId}
                  className={cn(className)}
                  renderTrigger={renderTrigger}
                  renderCtx={renderCtx}
                />
                <PopoverContent
                  id={listboxId}
                  sticky="always"
                  collisionPadding={8}
                  aria-hidden={disabled || undefined}
                  className={cn(
                    "min-w-[--radix-popover-trigger-width] origin-[--radix-popover-content-transform-origin] max-h-[--radix-popover-content-available-height] flex flex-col p-0",
                    disabled && "pointer-events-none select-none"
                  )}
                >
                  <Command
                    className="outline-none"
                    filter={fuzzyFilterOptionsByLabels}
                    loop
                  >
                    <CommandList
                      aria-multiselectable={isMultiple}
                      className="max-h-[unset] overflow-clip min-h-0 [&_[cmdk-list-sizer]]:min-h-0 grid grid-cols-1 [&_[cmdk-list-sizer]]:flex [&_[cmdk-list-sizer]]:flex-col"
                    >
                      {/**
                       * !!The markup order here is crucial!!
                       *
                       * - The `<Command />` component focuses on the first item during filtering.
                       *   Therefore, list options must be rendered before ToggleAll, which uses
                       *   `forceMount` to always display. This ensures that the focus remains on
                       *   the list options rather than the ToggleAll if it were to be rendered first.
                       *
                       * - CSS `order` properties adjust visual positions without changing markup.
                       *
                       * - The `loop` prop on `<Command />` enables cycling through options
                       *   in the expected visual order via keyboard navigation.
                       *
                       * - ToggleAll is conditionally rendered only when filtered options exist.
                       */}
                      <div className="flex flex-col min-h-0">
                        <ScrollArea className="max-h-96" type="always">
                          {customListContent ?? <EsiSelectListOptions />}
                        </ScrollArea>
                        {!customListContent && (
                          <CommandEmpty>
                            {emptyState ?? "No results found"}
                          </CommandEmpty>
                        )}
                        {isMultiple && (
                          <CommandGroup
                            forceMount
                            className="border-t order-last flex-none"
                          >
                            <EsiSelectFooterOptions />
                          </CommandGroup>
                        )}
                        <div className="order-first h-9 flex flex-none pl-3 items-center border-b [&_[cmdk-input-wrapper]]:border-none [&_[cmdk-input-wrapper]]:p-0 [&_[cmdk-input-wrapper]]:flex-1 [&_[cmdk-input-wrapper]>svg]:order-last [&_[cmdk-input-wrapper]>svg]:mx-2.5">
                          {isMultiple && !customListContent && (
                            <EsiSelectToggleAllOptions className="flex -ml-1.5 p-0 items-center justify-center order-first flex-none" />
                          )}
                          <CommandInput className="" placeholder="Search..." />
                        </div>
                      </div>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </OptionCustomizationContext.Provider>
          </SingleTriggerCustomizationContext.Provider>
        </SelectedBadgeCustomizationContext.Provider>
      </EsiSelectContext.Provider>
    );
  }
);
EsiSelect.displayName = "EsiSelect";

/**
 * Renders the currently selected options as badges with a "+N more" badge if exceeding `maxCount`.
 */
const EsiSelectCurrentBadges: React.FC = () => {
  const {
    selectedValues,
    options,
    maxCount,
    toggleOption,
    clearExtraOptions,
    setAutoVisibleCount,
    disabled,
  } = useEsiSelect();
  const {
    renderSelectedBadge,
    selectedBadgeProps,
    selectedExtraBadge,
    selectedBadgeGroupClassName,
  } = React.useContext(SelectedBadgeCustomizationContext);

  const badges: BadgeItem[] = useMemo(() => {
    return selectedValues
      .map((value) => options.find((o) => o.value === value))
      .filter((opt): opt is NonNullable<typeof opt> => Boolean(opt))
      .map((opt) => {
        const perOption =
          typeof selectedBadgeProps === "function"
            ? selectedBadgeProps(opt)
            : selectedBadgeProps ?? {};
        const resolved: BadgeItem = {
          id: opt.value,
          label: opt.label,
          icon: opt.icon,
          ...(perOption ?? {}),
        };
        return {
          ...resolved,
          // Compose default label/icon from BadgeGroup or allow custom render
          children: ({ labelNode, iconNode }) => {
            const defaultRemoveNode = !disabled ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="size-5 -my-2 -ml-1.5 -mr-2 hover:bg-destructive/25 focus-visible:bg-destructive/25 focus-visible:opacity-100 opacity-50 hover:opacity-100 transition-all"
                    variant="ghost"
                    asChild
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(opt.value);
                    }}
                    aria-label={`Remove ${opt.label}`}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleOption(opt.value);
                        }
                      }}
                    >
                      <LucideX className="size-3" />
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove</TooltipContent>
              </Tooltip>
            ) : null;
            if (renderSelectedBadge) {
              return renderSelectedBadge({
                option: opt,
                resolved,
                labelNode,
                iconNode,
                remove: () => toggleOption(opt.value),
                removeNode: defaultRemoveNode,
              });
            }
            return (
              <>
                {iconNode}
                {labelNode}
                {defaultRemoveNode}
              </>
            );
          },
        } as BadgeItem;
      });
  }, [
    selectedValues,
    options,
    toggleOption,
    disabled,
    renderSelectedBadge,
    selectedBadgeProps,
  ]);

  return (
    <BadgeGroup
      badges={badges}
      maxCount={maxCount}
      className={cn("w-[stretch] -ml-1.5", selectedBadgeGroupClassName)}
      onLayoutUpdate={({ visibleCount }) => setAutoVisibleCount(visibleCount)}
      extraBadge={{
        id: "extra",
        variant: "outline",
        className: cn(
          "pl-1.5 pr-0.5 gap-0",
          disabled && "pr-1.5 pointer-events-auto" // explicitly set pointer-events-auto to ensure users can still open the tooltip to see hidden selected options
        ),
        ...(selectedExtraBadge ?? {}),
        children: (countNode) => (
          <>
            {selectedExtraBadge?.children
              ? selectedExtraBadge.children(countNode)
              : countNode}
            {!disabled && (
              <Button
                size="icon"
                className="size-5 -my-2 -mx-0.5 hover:bg-destructive/25 opacity-50 hover:opacity-100 transition-all"
                variant="ghost"
                asChild
                onClick={(e) => {
                  e.stopPropagation();
                  clearExtraOptions();
                }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      clearExtraOptions();
                    }
                  }}
                >
                  <LucideX className="size-3" />
                </div>
              </Button>
            )}
          </>
        ),
      }}
    />
  );
};

/**
 * Props for the EsiSelectPopoverTrigger component
 */
interface EsiSelectPopoverTriggerProps {
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
  disabled?: boolean;
  listboxId?: string;
  // Only allow specific DOM props we explicitly want to pass through
  id?: string;
  style?: React.CSSProperties;
  /**
   * Render-prop override for the trigger inner content. If it returns `null`/`undefined`,
   * the default trigger UI is rendered.
   */
  renderTrigger?: (ctx: EsiSelectRenderContext) => React.ReactNode;
  /**
   * Context passed to `renderTrigger`.
   */
  renderCtx?: EsiSelectRenderContext;
}

/**
 * The trigger button for the EsiSelect popover.
 * Displays selected options as badges and can handle clearing all selections.
 * Uses role="combobox" on a div to avoid button nesting while maintaining accessibility.
 */
const EsiSelectPopoverTrigger = React.forwardRef<
  HTMLDivElement,
  EsiSelectPopoverTriggerProps
>(
  (
    { className, onClick, onKeyDown, onKeyUp, disabled, listboxId, ...props },
    ref
  ) => {
    // Extract only the DOM props we explicitly want to pass through
    const { id, style, renderTrigger, renderCtx } = props;

    // Only pass through explicitly allowed DOM props
    const domProps = {
      ...(id && { id }),
      ...(style && { style }),
    };

    const {
      selectedValues,
      placeholder,
      handleClear,
      setIsOpen,
      isOpen,
      mode,
      options,
    } = useEsiSelect();

    // Get single mode trigger customization context
    const { renderSelectedTrigger, selectedTriggerProps } = React.useContext(
      SingleTriggerCustomizationContext
    );

    const isUnselected = selectedValues.length === 0;
    const isDisabled = Boolean(disabled);
    const isMultiple = mode === "multiple";
    const selectedSingle =
      !isMultiple && selectedValues[0]
        ? options.find((o) => o.value === selectedValues[0])
        : undefined;

    // Compute surface props for single mode trigger
    const triggerSurfaceProps = React.useMemo(() => {
      if (!selectedSingle || !selectedTriggerProps) return {};

      if (typeof selectedTriggerProps === "function") {
        return selectedTriggerProps({
          option: selectedSingle,
          selectedValue: selectedValues[0],
        });
      }

      return selectedTriggerProps;
    }, [selectedSingle, selectedValues, selectedTriggerProps]);

    /**
     * WHY: Trigger is a div via Button(asChild) with role="combobox" to avoid
     * nested buttons. Radix does not add button-like keyboard behavior to
     * non-buttons, so we wire keys:
     * - Enter/Space/ArrowDown: open list from trigger (combobox affordance)
     * - Escape: close when focus stayed on trigger
     *
     * It's easier to do this on the trigger rather than on any buttons within the
     * content, as there may be multiple buttons inside it.
     */
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      setIsOpen((prev) => !prev);
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      // Non-button trigger needs explicit open on activation/navigation keys
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
      }
      // Space should activate on keyup to mirror native button behavior
      if (e.key === " ") {
        e.preventDefault();
      }
      // Allow closing from trigger when focus has not moved into content yet
      if (e.key === "Escape") {
        setIsOpen(false);
      }
      onKeyDown?.(e);
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      if (e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      onKeyUp?.(e);
    };

    const customTrigger = renderTrigger?.(renderCtx as EsiSelectRenderContext);

    return (
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full min-w-24 py-1.5 px-3 min-h-9 h-auto gap-3 items-center justify-between hover:bg-inherit relative overflow-clip cursor-pointer group font-normal",
            className
          )}
          disabled={isDisabled}
          asChild
        >
          {/* Render a div as the trigger to avoid button-inside-button. Use combobox role on it */}
          <div
            ref={ref}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-disabled={isDisabled || undefined}
            tabIndex={isDisabled ? -1 : 0}
            onClick={isDisabled ? undefined : handleClick}
            onKeyDown={isDisabled ? undefined : handleKeyDown}
            onKeyUp={isDisabled ? undefined : handleKeyUp}
            {...domProps}
          >
            {customTrigger ?? (isUnselected ? (
              <span className="text-sm text-muted-foreground font-normal truncate">
                {placeholder}
              </span>
            ) : (
              <>
                {isMultiple ? (
                  <EsiSelectCurrentBadges />
                ) : renderSelectedTrigger && selectedSingle ? (
                  renderSelectedTrigger({
                    option: selectedSingle,
                    selectedValue: selectedValues[0],
                    labelNode: (
                      <span className="text-sm truncate flex-1 text-foreground">
                        {selectedSingle.label}
                      </span>
                    ),
                    iconNode: selectedSingle.icon && (
                      <selectedSingle.icon className="text-muted-foreground" />
                    ),
                  })
                ) : (
                  <span
                    className={cn(
                      "text-sm truncate flex-1 text-foreground inline-flex items-center gap-2",
                      triggerSurfaceProps.className
                    )}
                    {...triggerSurfaceProps}
                  >
                    {selectedSingle?.icon && (
                      <selectedSingle.icon className="text-muted-foreground" />
                    )}
                    <span className="truncate">
                      {selectedSingle?.label ?? selectedValues[0]}
                    </span>
                  </span>
                )}
                {!isDisabled && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="size-8 opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:bg-destructive/25 focus-visible:bg-destructive/25 focus-visible:!opacity-100 group-focus-within:opacity-50 absolute right-px rounded-sm translate-x-full group-hover:translate-x-0 group-focus-within:translate-x-0 transition-all duration-300 z-10"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClear();
                        }}
                        aria-label="Clear selection"
                      >
                        <LucideX />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear selection</TooltipContent>
                  </Tooltip>
                )}
              </>
            ))}
            <CaretSortIcon
              className={cn(
                "text-muted-foreground opacity-50 flex-none",
                !isUnselected &&
                  "group-hover:opacity-0 group-focus-within:opacity-0 transition-opacity duration-300 group-hover:delay-0 delay-100"
              )}
            />
          </div>
        </Button>
      </PopoverTrigger>
    );
  }
);
EsiSelectPopoverTrigger.displayName = "EsiSelectPopoverTrigger";

/**
 * Renders the list of all available options inside the Command menu.
 * Manages refs for CMDK's internal filtering state!
 */
const EsiSelectListOptions: React.FC = () => {
  const {
    options,
    selectedValues,
    toggleOption,
    updateSelection,
    itemRefs,
    mode,
  } = useEsiSelect();
  const { renderOption, optionItemClassName, optionItemProps } =
    React.useContext(OptionCustomizationContext);
  const isMultiple = mode === "multiple";
  const isAnySelected = !isMultiple && selectedValues.length > 0;

  // Group options by the `group` field
  const groupedOptions = useMemo(() => {
    const groups: Record<string, typeof options> = {};
    for (const option of options) {
      const groupName = option.group || "Other"; // default group name
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(option);
    }
    return groups;
  }, [options]);

  const groupNames = Object.keys(groupedOptions);
  const shouldShowGroups = !(
    groupNames.length === 1 && groupNames[0] === "Other"
  );
  const { matchingOptions, hasActiveSearch } = useFilteredOptions();
  const matchingValueSet = React.useMemo(
    () => new Set(matchingOptions.map((o) => o.value)),
    [matchingOptions]
  );

  return (
    <>
      {shouldShowGroups ? (
        groupNames.map((groupName) => {
          const groupOptions = groupedOptions[groupName];
          const visibleGroupValues = computeVisibleGroupValues(
            groupOptions,
            matchingValueSet,
            hasActiveSearch
          );
          const groupChecked = isMultiple
            ? computeGroupCheckedState(visibleGroupValues, selectedValues)
            : false;
          const areAllInGroupSelected = groupChecked === true;

          const toggleGroupSelection = () => {
            if (!isMultiple) return;
            const next = computeSelectionAfterGroupToggle(
              selectedValues,
              visibleGroupValues,
              areAllInGroupSelected
            );
            updateSelection(next);
          };

          return (
            <CommandGroup
              className="
                overflow-clip py-1 [&:not(:first-child)]:border-t
                [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-px
                [&_[cmdk-group-heading]]:sticky [&_[cmdk-group-heading]]:top-0 [&_[cmdk-group-heading]]:z-10
                [&_[cmdk-group-heading]]:w-[stretch] [&_[cmdk-group-heading]]:-mx-1 [&_[cmdk-group-heading]]:-mt-1.5
                [&_[cmdk-group-heading]]:bg-background [&_[cmdk-group-heading]]:p-0 [&_[cmdk-group-heading]]:cursor-pointer
                [&_[cmdk-group-heading]]:select-none [&_[cmdk-group-heading]]:transition-colors
                before:sticky before:top-7 before:z-10 before:block
                before:w-[stretch] before:h-px before:mt-0.5 before:-mx-1
                before:bg-border/40
              "
              key={groupName}
              heading={
                isMultiple ? (
                  <GroupHeading
                    groupName={groupName}
                    checked={groupChecked}
                    hasActiveSearch={hasActiveSearch}
                    onToggle={toggleGroupSelection}
                  />
                ) : (
                  <div className="px-1 py-0.5 bg-background">
                    <div className="px-2 py-1 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        {groupName}
                      </span>
                    </div>
                  </div>
                )
              }
            >
              {groupOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                const resolvedItemProps = (() => {
                  const base =
                    typeof optionItemProps === "function"
                      ? optionItemProps({ option, isSelected })
                      : optionItemProps ?? {};
                  // merge className with optionItemClassName
                  const cls = cn(
                    "cursor-pointer [&:where([data-state=checked])]:bg-accent/40 transition-all",
                    optionItemClassName,
                    base?.className
                  );
                  return { ...base, className: cls } as Partial<
                    React.ComponentProps<typeof CommandItem>
                  >;
                })();
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                    {...resolvedItemProps}
                    value={option.value}
                    data-state={isSelected ? "checked" : undefined}
                    ref={(element) => {
                      if (element) {
                        itemRefs.current.set(option.value, {
                          id: element.id,
                          value: option.value,
                          element,
                        });
                      } else {
                        itemRefs.current.delete(option.value);
                      }
                    }}
                  >
                    {renderOption ? (
                      renderOption({
                        option,
                        isSelected,
                        checkboxNode: isMultiple ? (
                          <Checkbox tabIndex={-1} checked={isSelected} />
                        ) : null,
                        iconNode: option.icon ? (
                          <option.icon className="text-muted-foreground" />
                        ) : undefined,
                        labelNode: <Trimmer>{option.label}</Trimmer>,
                      })
                    ) : (
                      <>
                        {isMultiple ? (
                          <Checkbox tabIndex={-1} checked={isSelected} />
                        ) : (
                          isAnySelected && (
                            <span
                              aria-hidden
                              className="inline-flex w-4 justify-center"
                            >
                              <LucideCheck
                                className={cn(
                                  "text-primary-muted",
                                  !isSelected && "invisible"
                                )}
                              />
                            </span>
                          )
                        )}
                        {option.icon && (
                          <option.icon className="text-muted-foreground" />
                        )}
                        <Trimmer>{option.label}</Trimmer>
                      </>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          );
        })
      ) : (
        <CommandGroup className="[&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-px">
          {groupedOptions["Other"].map((option) => {
            const isSelected = selectedValues.includes(option.value);
            const resolvedItemProps = (() => {
              const base =
                typeof optionItemProps === "function"
                  ? optionItemProps({ option, isSelected })
                  : optionItemProps ?? {};
              const cls = cn(
                "cursor-pointer data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground transition-all",
                optionItemClassName,
                base?.className
              );
              return { ...base, className: cls } as Partial<
                React.ComponentProps<typeof CommandItem>
              >;
            })();
            return (
              <CommandItem
                key={option.value}
                onSelect={() => toggleOption(option.value)}
                {...resolvedItemProps}
                value={option.value}
                data-state={isSelected ? "checked" : undefined}
                ref={(element) => {
                  if (element) {
                    itemRefs.current.set(option.value, {
                      id: element.id,
                      value: option.value,
                      element,
                    });
                  } else {
                    itemRefs.current.delete(option.value);
                  }
                }}
              >
                {isMultiple && <Checkbox tabIndex={-1} checked={isSelected} />}
                {!isMultiple && isAnySelected && (
                  <span aria-hidden className="inline-flex w-5 justify-center">
                    <LucideCheck className={cn(!isSelected && "invisible")} />
                  </span>
                )}
                {option.icon && (
                  <option.icon className="text-muted-foreground" />
                )}
                <Trimmer>{option.label}</Trimmer>
              </CommandItem>
            );
          })}
        </CommandGroup>
      )}
    </>
  );
};

/**
 * Footer component with Clear and Close actions.
 */
const EsiSelectFooterOptions: React.FC = () => {
  const { selectedValues, handleClear, setIsOpen, disabled, mode } =
    useEsiSelect();
  const hasSelectedValues = selectedValues.length > 0;
  const isMultiple = mode === "multiple";

  return (
    <div className="flex items-center justify-between gap-0.5">
      {isMultiple && hasSelectedValues && !disabled && (
        <>
          <CommandItem
            onSelect={handleClear}
            className="flex-1 justify-center cursor-pointer text-xs"
          >
            Clear
          </CommandItem>
          <Separator orientation="vertical" className="flex min-h-6 h-full" />
        </>
      )}
      <CommandItem
        onSelect={() => setIsOpen(false)}
        className="flex-1 justify-center cursor-pointer max-w-full text-xs"
      >
        Close
      </CommandItem>
    </div>
  );
};

/**
 * Toggle component to select/deselect all currently visible options.
 * Adapts its behavior based on CMDK's filtering state:
 * - When not filtering: affects all options
 * - When filtering: only affects currently filtered options
 */
const EsiSelectToggleAllOptions: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { hasMatchingResults, matchingOptions, hasActiveSearch } =
    useFilteredOptions();
  const { areAllMatchingOptionsSelected, toggleAllMatchingOptions } =
    useFilteredSelection(matchingOptions);
  const { selectedValues, options } = useEsiSelect();

  // Don't show if there are no matching results OR if there are no options at all
  if (!hasMatchingResults || options.length === 0) return null;

  const hasPartialSelection =
    selectedValues.length > 0 && !areAllMatchingOptionsSelected;
  const checked = areAllMatchingOptionsSelected
    ? true
    : hasPartialSelection
    ? "indeterminate"
    : false;
  const toggleAllActionText = renderSelectionToggleLabel(
    areAllMatchingOptionsSelected,
    hasActiveSearch
  );

  return (
    <CommandGroup className={cn(className)} forceMount>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <DataStateEventBridge>
            <CommandItem
              className="cursor-pointer size-7 mr-0.5 flex items-center justify-center"
              onSelect={toggleAllMatchingOptions}
              value="toggle-all"
            >
              <Checkbox
                className="opacity-70 mx-0.5"
                tabIndex={-1}
                checked={checked}
                size="xs"
              />
            </CommandItem>
          </DataStateEventBridge>
        </TooltipTrigger>
        <TooltipContent side="left">
          <span className="text-xs inline-flex items-center gap-1">
            {toggleAllActionText}
          </span>
        </TooltipContent>
      </Tooltip>
    </CommandGroup>
  );
};

/**
 * Hook to access the EsiSelect context.
 * @returns The EsiSelect context value
 * @throws Error if used outside of a EsiSelectProvider
 */
function useEsiSelect() {
  const context = React.useContext(EsiSelectContext);
  if (!context) {
    throw new Error("useEsiSelect must be used within a EsiSelectProvider");
  }
  return context;
}

/**
 * These hooks MUST be used within CMDK's <Command/> component tree.
 * They rely on CMDK's internal state which is only available within Command's context.
 */

/**
 * Hook to get CMDK's current filtering state.
 * @requires CMDK Command context
 */
function useCommandFiltering() {
  const searchQuery = useCommandState((state) => state.search);
  const filteredState = useCommandState((state) => state.filtered);
  const hasActiveSearch = Boolean(searchQuery);
  const hasMatchingResults = !hasActiveSearch || filteredState.count > 0;

  return { searchQuery, filteredState, hasMatchingResults, hasActiveSearch };
}

/**
 * Hook to get options that match CMDK's current filtering state.
 * WHY: CMDK stores filtered match scores keyed by its internal item ids, not
 * our option values. We keep a map from option value -> rendered CommandItem
 * (with its Radix-generated id) so we can look up which items CMDK considers
 * matches (score > 0) and map back to our domain options.
 * This preserves:
 * - correct fuzzy matches even with duplicate labels
 * - stable roving focus/hover behavior tied to CMDK's items
 * - grouping/toggle logic that depends on the true visible set
 * @requires Must be used within a <Command/> component context
 */
function useFilteredOptions() {
  const { options, itemRefs } = useEsiSelect();
  const { filteredState, hasMatchingResults, hasActiveSearch } =
    useCommandFiltering();
  const matchingOptions = !hasActiveSearch
    ? options
    : options.filter((option) => {
        // Get the Radix-generated ID for this option through our refs, because
        // CMDK uses these IDs for filtering instead of our values (dumb, I know)
        const ref = itemRefs.current.get(option.value);
        // Check if CMDK considers this option a match. They basically set a score
        // in the items Map and if it is above 0, is a fuzzy match!
        return ref?.id && (filteredState.items.get(ref.id) ?? 0) > 0;
      });

  return { hasMatchingResults, matchingOptions, hasActiveSearch };
}

/**
 * Hook to manage selection state for visible options.
 * Handles the logic for selecting/deselecting filtered options.
 * @requires Must be used within a <Command/> component context (as it depends on useFilteredOptions)
 */
function useFilteredSelection(matchingOptions: Option[]) {
  const { selectedValues, updateSelection } = useEsiSelect();
  const matchingOptionValues = matchingOptions.map((opt) => opt.value);
  const selectedMatchingValues = selectedValues.filter((value) =>
    matchingOptionValues.includes(value)
  );
  const areAllMatchingOptionsSelected =
    matchingOptionValues.length > 0 &&
    selectedMatchingValues.length === matchingOptionValues.length;

  const toggleAllMatchingOptions = React.useCallback(() => {
    if (areAllMatchingOptionsSelected) {
      const valuesExceptMatching = selectedValues.filter(
        (value) => !matchingOptionValues.includes(value)
      );
      updateSelection(valuesExceptMatching);
      return;
    }
    const valuesWithAllMatching = [
      ...new Set([...selectedValues, ...matchingOptionValues]),
    ];
    updateSelection(valuesWithAllMatching);
  }, [
    areAllMatchingOptionsSelected,
    selectedValues,
    matchingOptionValues,
    updateSelection,
  ]);

  return { areAllMatchingOptionsSelected, toggleAllMatchingOptions };
}

function renderSelectionToggleLabel(
  isAllSelected: boolean,
  hasActiveSearch: boolean
): React.ReactNode {
  if (hasActiveSearch) {
    return isAllSelected ? (
      <>
        Deselect Filtered <LucideEraser />
      </>
    ) : (
      <>
        Select Filtered <LucideCheckCheck />
      </>
    );
  }
  return isAllSelected ? (
    <>
      Deselect All <LucideEraser />
    </>
  ) : (
    <>
      Select All <LucideCheckCheck />
    </>
  );
}

type GroupHeadingProps = {
  groupName: string;
  checked: boolean | "indeterminate";
  hasActiveSearch: boolean;
  onToggle: () => void;
};
/**
 * GroupHeading
 * Renders an interactive, pointer-only group heading for CMDK's CommandGroup.
 * Displays a tri-state checkbox and a hover-only action hint (Select/Deselect All/Filtered).
 */
const GroupHeading: React.FC<GroupHeadingProps> = ({
  groupName,
  checked,
  hasActiveSearch,
  onToggle,
}) => {
  const actionNode = renderSelectionToggleLabel(
    checked === true,
    hasActiveSearch
  );
  return (
    <div className="px-1 py-0.5 bg-background group">
      <div
        className="px-2 py-1 flex items-center gap-2 group-hover:bg-accent/50 rounded-sm"
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        onClick={() => {
          onToggle();
        }}
      >
        <Checkbox
          className="opacity-70 mx-0.5"
          size="xs"
          checked={checked}
          onCheckedChange={onToggle}
          tabIndex={-1}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
        <span className="cursor-pointer flex items-center gap-1">
          {groupName}
          <span
            className="text-xs text-muted-foreground opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 delay-0 group-hover:delay-200 pointer-events-none select-none"
            aria-hidden
          >
            <span className="flex ml-2 items-center gap-1 font-normal text-muted-foreground/50">
              {actionNode}
            </span>
          </span>
        </span>
      </div>
    </div>
  );
};
function computeVisibleGroupValues(
  groupOptions: Option[],
  matchingValueSet: Set<string>,
  hasActiveSearch: boolean
): string[] {
  const visible = hasActiveSearch
    ? groupOptions.filter((o) => matchingValueSet.has(o.value))
    : groupOptions;
  return visible.map((o) => o.value);
}

function computeGroupCheckedState(
  visibleGroupValues: string[],
  selectedValues: string[]
): boolean | "indeterminate" {
  if (visibleGroupValues.length === 0) return false;
  const selectedInGroup = selectedValues.filter((v) =>
    visibleGroupValues.includes(v)
  ).length;
  if (selectedInGroup === 0) return false;
  if (selectedInGroup === visibleGroupValues.length) return true;
  return "indeterminate";
}

function computeSelectionAfterGroupToggle(
  selectedValues: string[],
  visibleGroupValues: string[],
  areAllInGroupSelected: boolean
): string[] {
  if (areAllInGroupSelected) {
    return selectedValues.filter(
      (value) => !visibleGroupValues.includes(value)
    );
  }
  return [...new Set([...selectedValues, ...visibleGroupValues])];
}

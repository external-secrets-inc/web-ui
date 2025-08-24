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
import { LucideCheckCheck, LucideEraser, LucideX } from "lucide-react";
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

// Badge rendering and overflow are handled by BadgeGroup; no local observers needed

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
}
const EsiSelectContext = React.createContext<
  EsiSelectContextValue | undefined
>(undefined);

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

type CommandItemRef = {
  id: string;
  value: string;
  element: HTMLElement;
};

/**
 * Props for EsiSelect component
 */
interface EsiSelectProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * An array of option objects to be displayed in the EsiSelect component.
   * Each option object has a label, value, and an optional icon.
   */
  options: Option[];

  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: string[]) => void;

  /** The default selected values when the component mounts. */
  defaultValue?: string[];

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string;

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * - undefined: show all badges with dynamic height (alternatively, use can also set to `Infinity` too)
   * - number: hard limit of badges before showing +N more
   * - "auto": automatically determine limit based on available width
   * Optional, defaults to undefined.
   */
  maxCount?: number | "auto";

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
   * Customize how selected badges (shown in the trigger) are rendered.
   * `selectedBadgeDefaults` controls base Badge props (variant, className, etc.).
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
  }) => React.ReactNode;

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
}

// Components
// Lightweight contexts to pass customization to inner components
type SelectedBadgeCustomization = {
  selectedBadgeDefaults?: Partial<BadgeItem>;
  selectedExtraBadge?: BadgeGroupProps["extraBadge"];
  renderSelectedBadge?: (ctx: {
    option: Option;
    resolved: BadgeItem;
    labelNode: React.ReactNode;
    iconNode?: React.ReactNode;
    remove: () => void;
  }) => React.ReactNode;
};
const SelectedBadgeCustomizationContext =
  React.createContext<SelectedBadgeCustomization>({});

type OptionCustomization = {
  renderOption?: (ctx: {
    option: Option;
    isSelected: boolean;
    checkboxNode: React.ReactNode;
    iconNode?: React.ReactNode;
    labelNode: React.ReactNode;
  }) => React.ReactNode;
  optionItemClassName?: string;
};
const OptionCustomizationContext = React.createContext<OptionCustomization>({});

export const EsiSelect = React.forwardRef<HTMLDivElement, EsiSelectProps>(
  (
    {
      options,
      onValueChange,
      defaultValue = [],
      placeholder = "Select options",
      maxCount,
      modalPopover = true,
      className,
      open,
      onOpenChange,
      defaultOpen = false,
      selectedBadgeDefaults,
      selectedExtraBadge,
      renderSelectedBadge,
      renderOption,
      optionItemClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] =
      React.useState<string[]>(defaultValue);
    const [internalIsOpen, setInternalIsOpen] = React.useState(defaultOpen);
    const [autoVisibleCount, setAutoVisibleCount] = React.useState<
      number | undefined
    >(undefined);

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

    // using BadgeGroup for overflow logic; no local auto measurement flags needed

    const itemRefs = React.useRef<Map<string, CommandItemRef>>(new Map());

    const updateSelection = React.useCallback(
      (newValues: string[]) => {
        setSelectedValues(newValues);
        onValueChange(newValues);
      },
      [onValueChange]
    );

    const toggleOption = React.useCallback(
      (option: string) => {
        const newValues = selectedValues.includes(option)
          ? selectedValues.filter((value) => value !== option)
          : [...selectedValues, option];
        updateSelection(newValues);
      },
      [selectedValues, updateSelection]
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

    // No local measurement state to reset; BadgeGroup computes visibility in auto mode

    const listboxId = React.useId();

    return (
      <EsiSelectContext.Provider value={contextValue}>
        <SelectedBadgeCustomizationContext.Provider
          value={{
            selectedBadgeDefaults,
            selectedExtraBadge,
            renderSelectedBadge,
          }}
        >
          <OptionCustomizationContext.Provider
            value={{ renderOption, optionItemClassName }}
          >
            <Popover
              open={!disabled && isOpen}
              onOpenChange={handleOpenChange}
              modal={modalPopover}
            >
              <EsiSelectPopoverTrigger
                ref={ref}
                {...props}
                disabled={disabled}
                listboxId={listboxId}
                className={cn(className)}
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
                  <CommandInput placeholder="Search..." />
                  <CommandList className="max-h-[unset] overflow-clip min-h-0 [&_[cmdk-list-sizer]]:min-h-0 grid grid-cols-1 [&_[cmdk-list-sizer]]:flex [&_[cmdk-list-sizer]]:flex-col">
                    <CommandEmpty>No results found.</CommandEmpty>
                    <div className="flex flex-col min-h-0">
                      <ScrollArea className="max-h-96" type="always">
                        <EsiSelectListOptions />
                      </ScrollArea>
                      <CommandGroup
                        forceMount
                        className="border-t order-last flex-none"
                      >
                        <EsiSelectFooterOptions />
                      </CommandGroup>
                      <EsiSelectToggleAllOptions className="p-0 border-b order-first flex-none" />
                    </div>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </OptionCustomizationContext.Provider>
        </SelectedBadgeCustomizationContext.Provider>
      </EsiSelectContext.Provider>
    );
  }
);
EsiSelect.displayName = "EsiSelect";

// Local badge renderers removed in favor of BadgeGroup

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
  const { selectedExtraBadge } = React.useContext(
    SelectedBadgeCustomizationContext
  );

  const badges: BadgeItem[] = useMemo(() => {
    return selectedValues
      .map((value) => options.find((o) => o.value === value))
      .filter((opt): opt is NonNullable<typeof opt> => Boolean(opt))
      .map((opt) => ({
        id: opt.value,
        label: opt.label,
        icon: opt.icon,
        // Compose default label/icon from BadgeGroup and add a trailing X button.
        children: ({ labelNode, iconNode }) => (
          <>
            {iconNode}
            {labelNode}
            {!disabled && (
              <Button
                size="icon"
                className="size-5 -my-2 -ml-1.5 -mr-2 hover:bg-destructive/25 focus-visible:bg-destructive/25 focus-visible:opacity-100 opacity-50 hover:opacity-100 transition-all"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(opt.value);
                }}
              >
                <LucideX className="size-3" />
              </Button>
            )}
          </>
        ),
      }));
  }, [selectedValues, options, toggleOption, disabled]);

  return (
    <BadgeGroup
      badges={badges}
      maxCount={maxCount}
      className="w-[stretch] -ml-1.5"
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
                onClick={(e) => {
                  e.stopPropagation();
                  clearExtraOptions();
                }}
              >
                <LucideX className="size-3" />
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
  [key: string]:
    | React.HTMLAttributes<HTMLDivElement>[keyof React.HTMLAttributes<HTMLDivElement>]
    | undefined;
}

/**
 * The trigger button for the EsiSelect popover.
 * Displays selected options as badges and can handle clearing all selections.
 * Uses role="combobox" on a div to avoid button nesting while maintaining accessibility.
 */
const EsiSelectPopoverTrigger = React.forwardRef<
  HTMLDivElement,
  EsiSelectPopoverTriggerProps
>(({ className, onClick, onKeyDown, onKeyUp, disabled, listboxId, ...props }, ref) => {
  const { selectedValues, placeholder, handleClear, setIsOpen, isOpen } =
    useEsiSelect();
  const isUnselected = selectedValues.length === 0;
  const isDisabled = Boolean(disabled);

  /**
   * WHY: Trigger is a div via Button(asChild) with role="combobox" to avoid
   * nested buttons. Radix does not add button-like keyboard behavior to
   * non-buttons, so we wire keys:
   * - Enter/Space/ArrowDown: open list from trigger (combobox affordance)
   * - Escape: close when focus stayed on trigger
   *
   * It’s easier to do this on the trigger rather than on any buttons within the
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

  return (
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "w-full min-w-24 py-1.5 px-3 min-h-9 h-auto gap-4 items-center justify-between hover:bg-inherit relative overflow-clip cursor-pointer group",
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
          {...props}
        >
          {isUnselected ? (
            <span className="text-sm text-muted-foreground font-normal truncate">
              {placeholder}
            </span>
          ) : (
            <>
              <EsiSelectCurrentBadges />
              {!isDisabled && (
                <Button
                  className="size-8 opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:bg-destructive/25 focus-visible:bg-destructive/25 focus-visible:!opacity-100 group-focus-within:opacity-50 absolute right-px rounded-sm translate-x-full group-hover:translate-x-0 group-focus-within:translate-x-0 transition-all duration-300 z-10"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                >
                  <LucideX />
                </Button>
              )}
            </>
          )}
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
});
EsiSelectPopoverTrigger.displayName = "EsiSelectPopoverTrigger";

/**
 * Renders the list of all available options inside the Command menu.
 * Manages refs for CMDK's internal filtering state!
 */
const EsiSelectListOptions: React.FC = () => {
  const { options, selectedValues, toggleOption, updateSelection, itemRefs } =
    useEsiSelect();
  const { renderOption, optionItemClassName } = React.useContext(
    OptionCustomizationContext
  );

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
          const groupChecked = computeGroupCheckedState(
            visibleGroupValues,
            selectedValues
          );
          const areAllInGroupSelected = groupChecked === true;

          const toggleGroupSelection = () => {
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
                <GroupHeading
                  groupName={groupName}
                  checked={groupChecked}
                  hasActiveSearch={hasActiveSearch}
                  onToggle={toggleGroupSelection}
                />
              }
            >
              {groupOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                    className={cn(
                      "cursor-pointer data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground transition-all",
                      optionItemClassName
                    )}
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
                        checkboxNode: (
                          <Checkbox tabIndex={-1} checked={isSelected} />
                        ),
                        iconNode: option.icon ? (
                          <option.icon className="text-muted-foreground" />
                        ) : undefined,
                        labelNode: <Trimmer>{option.label}</Trimmer>,
                      })
                    ) : (
                      <>
                        <Checkbox tabIndex={-1} checked={isSelected} />
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
            return (
              <CommandItem
                key={option.value}
                onSelect={() => toggleOption(option.value)}
                className="cursor-pointer data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground transition-all"
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
                <Checkbox tabIndex={-1} checked={isSelected} />
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
  const { selectedValues, handleClear, setIsOpen, disabled } = useEsiSelect();
  const hasSelectedValues = selectedValues.length > 0;

  return (
    <div className="flex items-center justify-between gap-0.5">
      {hasSelectedValues && !disabled && (
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
      <CommandItem
        onSelect={toggleAllMatchingOptions}
        className="cursor-pointer rounded-none px-3"
        value="toggle-all"
      >
        <Checkbox
          className="opacity-70 mx-0.5"
          tabIndex={-1}
          checked={checked}
          size="xs"
        />
        <span className="text-muted-foreground text-xs inline-flex items-center gap-1">
          {toggleAllActionText}
        </span>
      </CommandItem>
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
  const matchingOptions = React.useMemo(() => {
    if (!hasActiveSearch) return options;
    return options.filter((option) => {
      // Get the Radix-generated ID for this option through our refs, because
      // CMDK uses these IDs for filtering instead of our values (dumb, I know)
      const ref = itemRefs.current.get(option.value);
      // Check if CMDK considers this option a match. They basically set a score
      // in the items Map and if it is above 0, is a fuzzy match!
      return ref?.id && (filteredState.items.get(ref.id) ?? 0) > 0;
    });
  }, [options, filteredState.items, itemRefs, hasActiveSearch]);

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

// Label renderer for selection toggle actions (reused for group and global toggles)
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
const GroupHeading: React.FC<GroupHeadingProps> = ({ groupName, checked, hasActiveSearch, onToggle }) => {
  const actionNode = renderSelectionToggleLabel(checked === true, hasActiveSearch);
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
            <span className="flex ml-2 items-center gap-1 font-normal text-muted-foreground/50">{actionNode}</span>
          </span>
        </span>
      </div>
    </div>
  );
};
// Helper utilities (kept at end of file with hooks)
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

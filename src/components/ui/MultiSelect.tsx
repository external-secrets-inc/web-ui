// source: https://github.com/sersavan/shadcn-multi-select-component
// TODO: tweak styles for consistency with our current theme. It seems this repo assumes everyone uses the default Shadcn theme, while ours is the new-york theme.

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  useCommandState,
} from "@/components/ui/command";
import {
  CaretSortIcon,
} from "@radix-ui/react-icons";
import { defaultFilter } from "cmdk";
import {
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
import { BadgeGroup, type BadgeItem, type BadgeGroupProps } from "@/components/ui/BadgeGroup";

// Badge rendering and overflow are handled by BadgeGroup; no local observers needed

/**
 * Context for MultiSelect component
 * This context is used to share state and functions across the MultiSelect
 * inner components.
 */
interface MultiSelectContextValue {
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
}
const MultiSelectContext = React.createContext<MultiSelectContextValue | undefined>(undefined);

interface Option {
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
 * Props for MultiSelect component
 */
interface MultiSelectProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * An array of option objects to be displayed in the multi-select component.
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
   * If true, renders the multi-select component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean;

  /**
   * Additional class names to apply custom styles to the multi-select component.
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
const SelectedBadgeCustomizationContext = React.createContext<SelectedBadgeCustomization>({});

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

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(({
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
  ...props
}, ref) => {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue);
  const [internalIsOpen, setInternalIsOpen] = React.useState(defaultOpen);
  const [autoVisibleCount, setAutoVisibleCount] = React.useState<number | undefined>(undefined);

  // Use controlled open state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalIsOpen;

  const handleOpenChange = React.useCallback((openOrUpdater: boolean | ((prev: boolean) => boolean)) => {
    const newOpen = typeof openOrUpdater === 'function' ? openOrUpdater(isOpen) : openOrUpdater;

    // Update internal state only if not controlled
    if (open === undefined) {
      setInternalIsOpen(newOpen);
    }

    // Always call the callback
    onOpenChange?.(newOpen);
  }, [onOpenChange, isOpen, open]);

  // using BadgeGroup for overflow logic; no local auto measurement flags needed

  const itemRefs = React.useRef<Map<string, CommandItemRef>>(new Map());

  const updateSelection = React.useCallback((newValues: string[]) => {
    setSelectedValues(newValues);
    onValueChange(newValues);
  }, [onValueChange]);

  const toggleOption = React.useCallback((option: string) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter((value) => value !== option)
      : [...selectedValues, option];
    updateSelection(newValues);
  }, [selectedValues, updateSelection]);

  const handleClear = React.useCallback(() => {
    updateSelection([]);
  }, [updateSelection]);

  const clearExtraOptions = React.useCallback(() => {
    if (maxCount === "auto") {
      updateSelection(selectedValues.slice(0, autoVisibleCount ?? selectedValues.length));
    } else if (typeof maxCount === "number") {
      updateSelection(selectedValues.slice(0, maxCount)); // In numbered mode, use the maxCount prop directly
    }
  }, [selectedValues, maxCount, autoVisibleCount, updateSelection]);

  const contextValue = React.useMemo(() => ({
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
  }), [
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
    setAutoVisibleCount
  ]);

  /**
   * Customizes cmdk's fuzzy search to work with our dual needs:
   * - Using IDs as values (for unique hover states when duplicate labels exist)
   * - Searching by labels ONLY, not ID values (for UX)
   *
   * Without this, we would either match only by IDs or have broken hover states.
   *
   * This redirects cmdk's fuzzy search (`defaultFilter`) to focus solely on labels.
   */
  const fuzzyFilterOptionsByLabels = React.useCallback((value: string, search: string) => {
    const option = options.find(opt => opt.value === value);
    if (!option) return 0;
    return (defaultFilter as (value: string, search: string, keywords?: string[]) => number)(
      option.label,
      search,
      []
    );
  }, [options]);

  // No local measurement state to reset; BadgeGroup computes visibility in auto mode

  return (
    <MultiSelectContext.Provider value={contextValue}>
      <SelectedBadgeCustomizationContext.Provider value={{ selectedBadgeDefaults, selectedExtraBadge, renderSelectedBadge }}>
        <OptionCustomizationContext.Provider value={{ renderOption, optionItemClassName }}>
          <Popover
            open={isOpen}
            onOpenChange={handleOpenChange}
            modal={modalPopover}
          >
            <MultiSelectPopoverTrigger
              ref={ref}
              {...props}
              className={cn(className)}
            />
            <PopoverContent className="min-w-[--radix-popover-trigger-width] p-0">
              <Command filter={fuzzyFilterOptionsByLabels} loop>
                <CommandInput placeholder="Search..."/>
                <CommandList className="max-h-none">
                  <CommandEmpty>No results found.</CommandEmpty>
                  <div className="grid grid-cols-1">
                    <ScrollArea className="max-h-[calc(theme(spacing.52)+theme(spacing.1))] pb-1" type="always">
                      <MultiSelectListOptions />
                    </ScrollArea>
                    <CommandGroup forceMount className="border-t order-last" >
                      <MultiSelectFooterOptions />
                    </CommandGroup>
                    <MultiSelectToggleAllOptions className="p-1 pb-0 order-first" />
                  </div>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </OptionCustomizationContext.Provider>
      </SelectedBadgeCustomizationContext.Provider>
    </MultiSelectContext.Provider>
  );
});
MultiSelect.displayName = "MultiSelect";

// Local badge renderers removed in favor of BadgeGroup

/**
 * Renders the currently selected options as badges with a "+N more" badge if exceeding `maxCount`.
 */
const MultiSelectCurrentBadges: React.FC = () => {
  const { selectedValues, options, maxCount, toggleOption, clearExtraOptions, setAutoVisibleCount } = useMultiSelect();
  const { selectedExtraBadge } = React.useContext(SelectedBadgeCustomizationContext);

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
          </>
        ),
      }));
  }, [selectedValues, options, toggleOption]);

  return (
    <BadgeGroup
      badges={badges}
      maxCount={maxCount}
      className="w-full"
      onLayoutUpdate={({ visibleCount }) => setAutoVisibleCount(visibleCount)}
      extraBadge={{
        id: "extra",
        variant: "outline",
        className: "pl-1.5 pr-0.5 gap-0",
        ...(selectedExtraBadge ?? {}),
        children: (countNode) => (
          <>
            {selectedExtraBadge?.children ? selectedExtraBadge.children(countNode) : countNode}
            <Button
              size="icon"
              className="size-5 -my-2 -mx-0.5 hover:bg-destructive/25 opacity-50 hover:opacity-100 transition-all"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                clearExtraOptions();
              }}
            >
              <LucideX />
            </Button>
          </>
        ),
      }}
    />
  );
};

/**
 * The trigger button for the multi-select popover.
 * Displays selected options as badges and can handle clearing all selections.
 */
const MultiSelectPopoverTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithRef<typeof Button>>(({
  className,
  ...props
}, ref) => {
  const { selectedValues, placeholder, handleClear, setIsOpen } = useMultiSelect();
  const isUnselected = selectedValues.length === 0;

  return (
    <PopoverTrigger asChild>
      <Button
        ref={ref}
        {...props}
        onClick={() => setIsOpen(prev => !prev)}
        variant="outline"
        className={cn(
          "w-full min-w-24 py-1.5 px-3 min-h-9 h-auto items-center justify-between hover:bg-inherit relative overflow-clip group",
          className
        )}
      >
        {isUnselected
        ? <span className="text-sm text-muted-foreground font-normal truncate">{placeholder}</span>
        : <>
            <MultiSelectCurrentBadges />
            <Button
              className="size-9 opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:bg-destructive/25 focus-visible:bg-destructive/25 focus-visible:!opacity-100 group-focus-within:opacity-50 absolute right-0 translate-x-full group-hover:translate-x-0 group-focus-within:translate-x-0 transition-all duration-300 z-10"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
              <LucideX />
            </Button>
          </>
        }
        <CaretSortIcon
          className={cn(
            "opacity-50 flex-none",
            !isUnselected && "group-hover:opacity-0 group-focus-within:opacity-0 transition-opacity duration-300 group-hover:delay-0 delay-100"
          )}
        />
      </Button>
    </PopoverTrigger>
  );
});
MultiSelectPopoverTrigger.displayName = "MultiSelectPopoverTrigger";

/**
 * Renders the list of all available options inside the Command menu.
 * Manages refs for CMDK's internal filtering state!
 */
const MultiSelectListOptions: React.FC<{ className?: string }> = ({ className }) => {
  const { options, selectedValues, toggleOption, itemRefs } = useMultiSelect();
  const { renderOption, optionItemClassName } = React.useContext(OptionCustomizationContext);

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
  const shouldShowGroups = !(groupNames.length === 1 && groupNames[0] === "Other");

  return (
    <div className={cn(className)}>
      {shouldShowGroups ? (
        groupNames.map((groupName) => (
          <CommandGroup key={groupName} heading={groupName}>
            {groupedOptions[groupName].map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <CommandItem
                  key={option.value}
                  onSelect={() => toggleOption(option.value)}
                  className={cn(
                    "cursor-pointer mx-1 has-[[data-state=checked]]:bg-accent/50 border border-transparent has-[[data-state=checked]]:border-background transition-all",
                    optionItemClassName
                  )}
                  value={option.value}
                  ref={(element) => {
                    if (element) {
                      itemRefs.current.set(option.value, { id: element.id, value: option.value, element });
                    } else {
                      itemRefs.current.delete(option.value);
                    }
                  }}
                >
                  {renderOption
                    ? renderOption({
                        option,
                        isSelected,
                        checkboxNode: <Checkbox checked={isSelected} />,
                        iconNode: option.icon ? (
                          <option.icon className="mr-2 text-muted-foreground" />
                        ) : undefined,
                        labelNode: <Trimmer>{option.label}</Trimmer>,
                      })
                    : (
                        <>
                          <Checkbox checked={isSelected} />
                          {option.icon && (
                            <option.icon className="mr-2 text-muted-foreground" />
                          )}
                          <Trimmer>{option.label}</Trimmer>
                        </>
                      )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))
      ) : (
        <CommandGroup className="p-0">
        {groupedOptions["Other"].map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <CommandItem
              key={option.value}
              onSelect={() => toggleOption(option.value)}
              className="cursor-pointer mx-1 has-[[data-state=checked]]:bg-accent/50 border border-transparent has-[[data-state=checked]]:border-background transition-all"
              value={option.value}
              ref={(element) => {
                if (element) {
                  itemRefs.current.set(option.value, { id: element.id, value: option.value, element });
                } else {
                  itemRefs.current.delete(option.value);
                }
              }}
            >
              <Checkbox checked={isSelected} />
              {option.icon && (
                <option.icon className="mr-2 text-muted-foreground" />
              )}
              <Trimmer>{option.label}</Trimmer>
            </CommandItem>
          );
        })}
        </CommandGroup>
      )}
    </div>
  );
};

/**
 * Footer component with Clear and Close actions.
 */
const MultiSelectFooterOptions: React.FC = () => {
  const { selectedValues, handleClear, setIsOpen } = useMultiSelect();
  const hasSelectedValues = selectedValues.length > 0;

  return (
    <div className="flex items-center justify-between gap-1">
      {hasSelectedValues && (
        <>
          <CommandItem onSelect={handleClear} className="flex-1 justify-center cursor-pointer">
            Clear
          </CommandItem>
          <Separator orientation="vertical" className="flex min-h-6 h-full" />
        </>
      )}
      <CommandItem onSelect={() => setIsOpen(false)} className="flex-1 justify-center cursor-pointer max-w-full">
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
const MultiSelectToggleAllOptions: React.FC<{ className?: string }> = ({ className }) => {
  const { hasMatchingResults, matchingOptions, hasActiveSearch } = useFilteredOptions();
  const { areAllMatchingOptionsSelected, toggleAllMatchingOptions } = useFilteredSelection(matchingOptions);
  const { selectedValues, options } = useMultiSelect();

  // Don't show if there are no matching results OR if there are no options at all
  if (!hasMatchingResults || options.length === 0) return null;

  const hasPartialSelection = selectedValues.length > 0 && !areAllMatchingOptionsSelected;
  const checked = areAllMatchingOptionsSelected ? true : hasPartialSelection ? "indeterminate" : false;

  return (
    <CommandGroup className={cn(className)} forceMount>
      <CommandItem
        onSelect={toggleAllMatchingOptions}
        className="cursor-pointer"
        value="toggle-all"
      >
        <Checkbox checked={checked} />
        <span className="text-muted-foreground">
          {hasActiveSearch
            ? `(${areAllMatchingOptionsSelected ? "Deselect" : "Select"} Filtered)`
            : `(${areAllMatchingOptionsSelected ? "Deselect" : "Select"} All)`}
        </span>
      </CommandItem>
    </CommandGroup>
  );
};

/**
 * Hook to access the MultiSelect context.
 * @returns The MultiSelect context value
 * @throws Error if used outside of a MultiSelectProvider
 */
function useMultiSelect() {
  const context = React.useContext(MultiSelectContext);
  if (!context) {
    throw new Error("useMultiSelect must be used within a MultiSelectProvider");
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
  const searchQuery = useCommandState(state => state.search);
  const filteredState = useCommandState(state => state.filtered);
  const hasActiveSearch = Boolean(searchQuery);
  const hasMatchingResults = !hasActiveSearch || filteredState.count > 0;

  return { searchQuery, filteredState, hasMatchingResults, hasActiveSearch };
}

/**
 * Hook to get options that match CMDK's current filtering state.
 * Uses our item refs to match Radix-generated IDs with our option values.
 * @requires Must be used within a <Command/> component context
 */
function useFilteredOptions() {
  const { options, itemRefs } = useMultiSelect();
  const { filteredState, hasMatchingResults, hasActiveSearch } = useCommandFiltering();
  const matchingOptions = React.useMemo(() => {
    if (!hasActiveSearch) return options;
    return options.filter(option => {
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
  const { selectedValues, updateSelection } = useMultiSelect();
  const matchingOptionValues = matchingOptions.map(opt => opt.value);
  const selectedMatchingValues = selectedValues.filter(value => matchingOptionValues.includes(value));
  const areAllMatchingOptionsSelected = matchingOptionValues.length > 0 && selectedMatchingValues.length === matchingOptionValues.length;

  const toggleAllMatchingOptions = React.useCallback(() => {
    if (areAllMatchingOptionsSelected) {
      const valuesExceptMatching = selectedValues.filter(value => !matchingOptionValues.includes(value));
      updateSelection(valuesExceptMatching);
      return;
    }
    const valuesWithAllMatching = [...new Set([...selectedValues, ...matchingOptionValues])];
    updateSelection(valuesWithAllMatching);
  }, [areAllMatchingOptionsSelected, selectedValues, matchingOptionValues, updateSelection]);

  return { areAllMatchingOptionsSelected, toggleAllMatchingOptions };
}

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

import { Badge } from "@/components/ui/badge";
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

/**
 * Global resize observer for all MultiSelect instances.
 * This singleton manages subscriptions for all MultiSelect components that need
 * to observe their mirrored badge lists for wrapping detection.
 */
class MultiSelectGlobalResizeObserver {
  private observer: ResizeObserver | null = null;
  private callbacks = new Map<Element, () => void>();

  private ensureObserver() {
    if (!this.observer) {
      this.observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const callback = this.callbacks.get(entry.target);
          if (callback) callback();
        }
      });
    }
    return this.observer;
  }

  observe(element: Element, callback: () => void) {
    this.callbacks.set(element, callback);
    this.ensureObserver().observe(element);
  }

  unobserve(element: Element) {
    this.callbacks.delete(element);
    if (this.observer) {
      this.observer.unobserve(element);

      // If no more elements are being observed, disconnect the observer
      if (this.callbacks.size === 0) {
        this.observer.disconnect();
        this.observer = null;
      }
    }
  }
}

// Single instance to be shared across all MultiSelect components
const multiSelectGlobalResizeObserver = new MultiSelectGlobalResizeObserver();

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
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  updateSelection: (values: string[]) => void;
  itemRefs: React.MutableRefObject<Map<string, CommandItemRef>>;
  visibleBadgesCount: number;
  extraBadgesCount: number;
  shouldShowExtraCounterBadge: boolean;
  isAutoMaxCount: boolean;
  computedMaxCount: number | undefined;
  badgeRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  observedMirroredBadgeListRef: React.RefObject<HTMLDivElement>;
}
const MultiSelectContext = React.createContext<MultiSelectContextValue | undefined>(undefined);

interface Option {
  /** The text to display for the option. */
  label: string;
  /** The unique value associated with the option. */
  value: string;
  /** Optional icon component to display alongside the option. */
  icon?: React.ComponentType<{ className?: string }>;
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
}

// Components
export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(({
  options,
  onValueChange,
  defaultValue = [],
  placeholder = "Select options",
  maxCount,
  modalPopover = true,
  className,
  ...props
}, ref) => {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue);
  const [isOpen, setIsOpen] = React.useState(false);
  const [computedMaxCount, setComputedMaxCount] = React.useState<number | undefined>(typeof maxCount === "number" ? maxCount : undefined);

  const isAutoMaxCount = maxCount === "auto";
  const visibleBadgesCount = computedMaxCount !== undefined ? Math.min(computedMaxCount, selectedValues.length) : selectedValues.length;
  const extraBadgesCount = selectedValues.length - visibleBadgesCount;
  const shouldShowExtraCounterBadge = extraBadgesCount > 0;

  const itemRefs = React.useRef<Map<string, CommandItemRef>>(new Map());
  const badgeRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
  const observedMirroredBadgeListRef = React.useRef<HTMLDivElement>(null);

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
      updateSelection(selectedValues.slice(0, computedMaxCount)); // In auto mode, use the computed max count from wrapping calculation
    } else if (typeof maxCount === "number") {
      updateSelection(selectedValues.slice(0, maxCount)); // In numbered mode, use the maxCount prop directly
    }
  }, [selectedValues, maxCount, computedMaxCount, updateSelection]);

  const contextValue = React.useMemo(() => ({
    selectedValues,
    options,
    maxCount,
    placeholder,
    isOpen,
    toggleOption,
    clearExtraOptions,
    handleClear,
    setIsOpen,
    updateSelection,
    itemRefs,
    visibleBadgesCount,
    extraBadgesCount,
    shouldShowExtraCounterBadge,
    isAutoMaxCount,
    computedMaxCount,
    badgeRefs,
    observedMirroredBadgeListRef,
  }), [
    selectedValues,
    options,
    maxCount,
    placeholder,
    isOpen,
    toggleOption,
    clearExtraOptions,
    handleClear,
    setIsOpen,
    updateSelection,
    visibleBadgesCount,
    extraBadgesCount,
    shouldShowExtraCounterBadge,
    isAutoMaxCount,
    computedMaxCount
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

  const detectFlexWrap = React.useCallback(() => {
    const baselineTop = 0; // Relative to first `position: relative` parent

    for (let i = 0; i < selectedValues.length; i++) {
      const badge = badgeRefs.current.get(selectedValues[i]);
      if (!badge) continue;

      if (badge.offsetTop > baselineTop) {
        setComputedMaxCount(i);
        return;
      }
    }

    setComputedMaxCount(selectedValues.length);
  }, [selectedValues]);

  // Effect to handle measurement and resize observer
  React.useEffect(() => {
    if (maxCount !== "auto") return;
    if (selectedValues.length <= 1) {
      setComputedMaxCount(selectedValues.length);
      return;
    }

    const mirrorRef = observedMirroredBadgeListRef.current;
    if (!mirrorRef) return;

    multiSelectGlobalResizeObserver.observe(mirrorRef, detectFlexWrap);

    // Initial measurement
    queueMicrotask(detectFlexWrap);

    return () => {
      if (mirrorRef) multiSelectGlobalResizeObserver.unobserve(mirrorRef);
    };
  }, [maxCount, selectedValues, detectFlexWrap]);

  // Reset computedMaxCount when maxCount prop changes
  React.useEffect(() => {
    setComputedMaxCount(typeof maxCount === "number" ? maxCount : undefined);
  }, [maxCount]);

  return (
    <MultiSelectContext.Provider value={contextValue}>
      <Popover
        open={isOpen}
        onOpenChange={setIsOpen}
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
              <div className="grid grid-cols-1">
                <ScrollArea className="max-h-[calc(theme(spacing.52)+theme(spacing.1))] pb-1" type="always">
                  <CommandGroup className="p-0">
                    <MultiSelectListOptions />
                  </CommandGroup>
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
    </MultiSelectContext.Provider>
  );
});
MultiSelect.displayName = "MultiSelect";

/**
 * Badge with an optional icon and a remove button representing a selected option.
 */
const MultiSelectBadge = React.forwardRef<HTMLDivElement, {
  label: string;
  onRemove?: () => void;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  interactive?: boolean;
}>(({
  label,
  onRemove,
  className,
  icon: IconComponent,
}, ref) => {
  return (
    <Badge
      variant="secondary"
      ref={ref}
      className={cn(
        "flex items-center gap-0.5 pl-2 pr-0.5",
        className,
      )}
    >
      {IconComponent && <IconComponent className="size-3"/>}
      <Trimmer className="flex-1 min-w-0">{label}</Trimmer>
      <Button
        size="icon"
        className="size-5 -my-2 -mx-0.5 hover:bg-destructive/25 focus-visible:bg-destructive/25 focus-visible:opacity-100 opacity-50 hover:opacity-100 transition-all"
        variant="ghost"
        onClick={onRemove ? (e) => {
          e.stopPropagation();
          onRemove();
        } : undefined}>
          <LucideX className="size-3"/>
      </Button>
    </Badge>
  );
});
MultiSelectBadge.displayName = "MultiSelectBadge";

/**
 * Extra badge that shows the count of hidden/wrapped items.
 * Uses the same base as MultiSelectBadge but with slightly different styling and behavior.
 */
const MultiSelectExtraBadge: React.FC = () => {
  const { clearExtraOptions, extraBadgesCount } = useMultiSelect();

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-0.5 pl-1.5 pr-0.5 font-mono"
      )}
    >
      {`+${extraBadgesCount}`}
      <Button
      size="icon"
      className="size-5 -my-2 -mx-0.5 hover:bg-destructive/25 opacity-50 hover:opacity-100 transition-all"
      variant="ghost"
      onClick={(e) => {
        e.stopPropagation();
        clearExtraOptions();
      }}>
        <LucideX className="size-3"/>
      </Button>
    </Badge>
  );
};
MultiSelectExtraBadge.displayName = "MultiSelectExtraBadge";

/**
 * Renders the currently selected options as badges with a "+N more" badge if exceeding `maxCount`.
 */
const MultiSelectCurrentBadges: React.FC = () => {
  const {
    selectedValues,
    options,
    maxCount,
    toggleOption,
    isAutoMaxCount,
    shouldShowExtraCounterBadge,
    visibleBadgesCount,
    extraBadgesCount,
    badgeRefs,
    observedMirroredBadgeListRef,
  } = useMultiSelect();

  return (
    <div className={cn(
      "grid w-full [&>*]:row-start-1 [&>*]:column-start-1 relative overflow-clip items-start", // grid with cell overlaping, similar to absolute positioning but more robust
      maxCount === "auto" && "grid-rows-[22px]" // max height same as badge height (22px) to render a single-row for the automatic extra badge numbering mode
    )}>
      {/* Actual interactive badges visible to the user */}
      <div className="[grid-area:1/-1] flex gap-1 min-w-12 items-start">
        {extraBadgesCount < selectedValues.length && (
          <div className={cn("flex gap-1 min-w-12", !isAutoMaxCount && "flex-wrap")}>
            {selectedValues.slice(0, visibleBadgesCount).map((value) => {
              const option = options.find((o) => o.value === value);
              if (!option) return null;
              return (
                <MultiSelectBadge
                  key={value}
                  label={option.label}
                  icon={option.icon}
                  onRemove={() => toggleOption(value)}
                  className={cn(
                    (!isAutoMaxCount || visibleBadgesCount === 1) && "min-w-12 flex-auto max-w-fit", // Ensure shrinking only when wrapping or when only one badge is visible in auto mode to use most of the available real estate
                  )}
                />
              );
            })}
            {/* When not on auto mode, we just keep the extra badge at the end of the list */}
            {!isAutoMaxCount && shouldShowExtraCounterBadge && (
              <MultiSelectExtraBadge />
            )}
          </div>
        )}
        {/* When on auto mode, we render the extra badge outside of the list to avoid it being wrapped first */}
        {isAutoMaxCount && shouldShowExtraCounterBadge && (
          <div className="flex flex-1 justify-start">
            <MultiSelectExtraBadge />
          </div>
        )}
      </div>

      {/*
        Non-Interactive Badge List Mirror:
        -------------------------
        Why:
          In "auto" mode for maxCount, our goal is to determine exactly how many
          badges can fit in the available width. We need to detect when badges
          are forced to wrap onto a new line so we can replace the overflow with
          a "N more" badge. Measuring this directly on the interactive badge
          list is problematic because hiding or removing badges for layout
          adjustments would break the measurement logic (creating a circular
          dependency where layout changes remove the very elements needed for
          observation). This invisible mirrored list allows us to observe the
          full, unhindered badge layout using a ResizeObserver, without disturbing
          the user's interactive view.

        Note:
          Ensure that any visual changes applied to the interactive badges for
          "auto" mode are also reflected in this mirrored list to keep the
          measurements accurate.

        TODO:
        - Explore a DRYier solution with the same effect so it's easier to read.
        - Monitor performance due to duplicate render and resize observer usage.
      */}
      {isAutoMaxCount && (
        <div className="invisible [grid-area:1/-1] flex min-w-12 gap-1 [&>*]:pointer-events-none flex-wrap-reverse items-end">
          <div
            className="flex flex-wrap gap-1 flex-1 min-w-12 outline outline-1 -outline-offset-1"
            ref={observedMirroredBadgeListRef}
          >
              {selectedValues.map((value) => {
                const option = options.find((o) => o.value === value);
                if (!option) return null;
                return (
                  <MultiSelectBadge
                    key={value}
                    ref={el => {
                      if (el) badgeRefs.current.set(value, el);
                      else badgeRefs.current.delete(value);
                    }}
                    label={option.label}
                    icon={option.icon}
                  />
                );
              })}
            </div>
            {shouldShowExtraCounterBadge && (
            <div className="flex flex-wrap justify-start min-w-12 flex-none outline outline-1 -outline-offset-1">
              <MultiSelectExtraBadge />
            </div>
          )}
        </div>
      )}
    </div>
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
              className="size-7 opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:bg-destructive/25 focus-visible:bg-destructive/25 focus-visible:!opacity-100 group-focus-within:opacity-50 absolute right-1.5 translate-x-full group-hover:translate-x-0 group-focus-within:translate-x-0 transition-all duration-300 z-10"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
              <LucideX/>
            </Button>
          </>
        }
        <CaretSortIcon
          className={cn(
            "opacity-50 ",
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

  return (
    <div className={cn(className)}>
      {options.map((option) => {
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
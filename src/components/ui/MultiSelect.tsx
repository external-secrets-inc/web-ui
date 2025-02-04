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
import { cva, type VariantProps } from "class-variance-authority";
import { defaultFilter } from "cmdk";
import {
  XCircle,
  XIcon,
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

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva(
  "transition ease-in-out",
  {
    variants: {
      variant: {
        default:
          "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Context
interface MultiSelectContextValue {
  selectedValues: string[];
  options: Option[];
  maxCount: number;
  variant: MultiSelectProps['variant'];
  placeholder: string;
  isOpen: boolean;
  toggleOption: (value: string) => void;
  clearExtraOptions: () => void;
  handleClear: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  updateSelection: (values: string[]) => void;
  itemRefs: React.MutableRefObject<Map<string, CommandItemRef>>;
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
interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
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
   * Optional, defaults to 3.
   */
  maxCount?: number;

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
  variant,
  defaultValue = [],
  placeholder = "Select options",
  maxCount = 3,
  modalPopover = true,
  className,
  ...props
}, ref) => {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue);
  const [isOpen, setIsOpen] = React.useState(false);
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
    updateSelection(selectedValues.slice(0, maxCount));
  }, [selectedValues, maxCount, updateSelection]);

  const contextValue = React.useMemo(() => ({
    selectedValues,
    options,
    maxCount,
    variant,
    placeholder,
    isOpen,
    toggleOption,
    clearExtraOptions,
    handleClear,
    setIsOpen,
    updateSelection,
    itemRefs,
  }), [
    selectedValues,
    options,
    maxCount,
    variant,
    placeholder,
    isOpen,
    toggleOption,
    clearExtraOptions,
    handleClear,
    setIsOpen,
    updateSelection
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
const MultiSelectBadge: React.FC<{ option: Option; onRemove: () => void }> = ({
  option,
  onRemove,
}) => {
  const { variant } = useMultiSelect();
  const IconComponent = option.icon;

  return (
    <Badge
      className={cn("flex min-w-14 items-center gap-2 pr-0.5", multiSelectVariants({ variant }))}
    >
      {IconComponent && <IconComponent className="size-3"/>}
      <span className="flex-1 min-w-4 truncate">{option.label}</span>
      <XCircle
        className="size-4 cursor-pointer opacity-50 hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      />
    </Badge>
  );
};

/**
 * Renders the currently selected options as badges with a "+N more" badge if exceeding `maxCount`.
 */
const MultiSelectCurrentBadges: React.FC<{ className?: string }> = ({ className }) => {
  const { selectedValues, options, maxCount, toggleOption, clearExtraOptions } = useMultiSelect();
  const extraOptionsCount = selectedValues.length - maxCount;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {selectedValues.slice(0, maxCount).map((value) => {
        const option = options.find((o) => o.value === value);
        if (!option) return null;
        return (
          <MultiSelectBadge
            key={value}
            option={option}
            onRemove={() => toggleOption(value)}
          />
        );
      })}
      {extraOptionsCount > 0 && (
        <MultiSelectBadge
          option={{ label: `+${extraOptionsCount} more`, value: "extra-options" }}
          onRemove={clearExtraOptions}
        />
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
          "w-full min-w-24 py-1 px-3 min-h-9 h-auto items-center justify-between hover:bg-inherit [:where(&_svg)]:pointer-events-auto relative group",
          className
        )}
      >
        {isUnselected
        ? <span className="text-sm text-muted-foreground font-normal truncate">{placeholder}</span>
        : <>
            <MultiSelectCurrentBadges className="flex flex-wrap items-center gap-1 min-w-12" />
            <XIcon
              className="opacity-0 group-hover:opacity-50 hover:!opacity-100 absolute right-3 translate-x-full group-hover:translate-x-0 transition-all duration-300 z-10"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          </>
        }
        <CaretSortIcon
          className={cn(
            "opacity-50 ",
            !isUnselected && "group-hover:opacity-0 transition-opacity duration-300 group-hover:delay-0 delay-100"
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
            className="cursor-pointer mx-1"
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
            <span>{option.label}</span>
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
  const { selectedValues } = useMultiSelect();

  if (!hasMatchingResults) return null;

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

  // Keep debug logs for now
  console.log('Search:', searchQuery, 'Filtered state:', filteredState);
  console.log('Filtered items Map:', Array.from(filteredState?.items?.entries() ?? []));

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

  console.log('Our options:', options);

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
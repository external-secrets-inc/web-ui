import type { Meta, StoryObj } from "@storybook/react";
import { EsiSelect } from "@/components/ui/EsiSelect";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  baseOptions,
  iconOptions,
  createStoryRender,
  createFormStoryRender,
  baseStoryArgs,
  iconStoryArgs,
  largeStoryArgs,
  ungroupedStoryArgs,
  createSingleStoryRender,
  createSingleFormStoryRender,
  singleBaseStoryArgs,
  singleIconStoryArgs,
  singleUngroupedStoryArgs,
} from "./stories.utils";
import { LucideAtom, LucideCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { Loader } from "@/components/ui/Loader";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrapper, Field } from "./stories.utils";
import { Button } from "@/components/ui/button";

// Utility function for shared customizations to keep code DRY
const createSharedCustomizations = () => ({
  // Badge styling based on group
  getBadgeProps: (option: { group?: string }) => {
    const groupToBadgeClass: Record<string, string> = {
      Team: "bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200 border-blue-600/40 dark:border-blue-900/70",
      Infra:
        "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200 border-emerald-600/40 dark:border-emerald-900/70",
      Security:
        "bg-rose-100 text-rose-900 dark:bg-rose-900/20 dark:text-rose-200 border-rose-600/40 dark:border-rose-900/70",
      Bug: "bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200 border-amber-600/40 dark:border-amber-900/70",
      Atom: "bg-purple-100 text-purple-900 dark:bg-purple-900/20 dark:text-purple-200 border-purple-600/40 dark:border-purple-900/70",
    };
    return {
      className: cn("border-2", groupToBadgeClass[option.group ?? ""]),
      variant: "secondary" as const,
    };
  },

  // Option rendering with enhanced design
  renderEnhancedOption: ({
    option,
    isSelected,
    iconNode,
    labelNode,
  }: {
    option: {
      label: string;
      value: string;
      icon?: React.ComponentType;
      group?: string;
    };
    isSelected: boolean;
    iconNode?: React.ReactNode;
    labelNode: React.ReactNode;
  }) => (
    <div className="flex items-center gap-3 w-full group">
      {/* Custom icon with dynamic background and animations */}
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 shadow-sm",
          isSelected
            ? "bg-gradient-to-br from-primary to-primary/80 [&_svg]:text-primary-foreground scale-110 rotate-3 shadow-lg shadow-primary/25"
            : "bg-gradient-to-br from-muted to-muted/60 text-muted-foreground group-hover:bg-muted/80 group-hover:scale-105 group-hover:shadow-md group-hover:ring-1 group-hover:ring-primary/20"
        )}
      >
        {iconNode || <LucideAtom className="w-5 h-5" />}
      </div>

      {/* Enhanced content layout with group badges */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "font-semibold transition-all duration-200",
              isSelected ? "text-primary" : "text-foreground"
            )}
          >
            {labelNode}
          </div>
          {option.group && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-2 py-0.5 border-dashed transition-all duration-200",
                isSelected
                  ? "border-primary/50 bg-primary/10 text-primary scale-110"
                  : "border-muted-foreground/30 text-muted-foreground group-hover:border-muted-foreground/50"
              )}
            >
              {option.group}
            </Badge>
          )}
        </div>

        {/* Secondary info with enhanced styling */}
        <div className="flex items-center gap-2 text-xs">
          <span
            className={cn(
              "font-mono transition-colors duration-200",
              isSelected ? "text-primary/70" : "text-muted-foreground"
            )}
          >
            {option.value}
          </span>
          <span
            className={cn(
              "w-1 h-1 rounded-full transition-all duration-200",
              isSelected ? "bg-primary/50 scale-150" : "bg-muted-foreground/40"
            )}
          />
          <span
            className={cn(
              "transition-colors duration-200",
              isSelected ? "text-primary/60" : "text-muted-foreground/70"
            )}
          >
            {isSelected ? "Selected" : "Available"}
          </span>
        </div>
      </div>

      {/* Custom selection indicator with enhanced animations */}
      <div
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all duration-300",
          isSelected
            ? "border-primary bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/25"
            : "border-muted-foreground/20 text-transparent group-hover:border-muted-foreground/40 group-hover:scale-105"
        )}
      >
        {isSelected && (
          <LucideCheck className="w-4 h-4 animate-in zoom-in-50 duration-200" />
        )}
      </div>
    </div>
  ),

  // Badge content rendering
  renderEnhancedBadge: ({
    option,
    labelNode,
    iconNode,
    removeNode,
  }: {
    option: {
      label: string;
      value: string;
      icon?: React.ComponentType;
      group?: string;
    };
    labelNode: React.ReactNode;
    iconNode?: React.ReactNode;
    removeNode: React.ReactNode;
  }) => (
    <>
      {option.group && (
        <Badge
          className="text-[10px] leading-none font-medium px-1.5 -ml-2 -my-0.5 flex items-center gap-1"
          variant="outline"
        >
          {React.cloneElement(iconNode as React.ReactElement, {
            className: cn(
              "w-3 h-3",
              option.group === "Team" && "text-blue-600",
              option.group === "Infra" && "text-emerald-600",
              option.group === "Security" && "text-rose-600",
              option.group === "Bug" && "text-amber-600",
              option.group === "Atom" && "text-purple-600"
            ),
          })}
          {option.group}
        </Badge>
      )}
      <span className="font-semibold leading-none text-[10px]">{labelNode}</span>
      <span className="ml-1 text-[10px] leading-none opacity-60">
        {option.value}
      </span>
      {removeNode}
    </>
  ),
});

const meta = {
  title: "UI/EsiSelect",
  component: EsiSelect,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof EsiSelect>;

export default meta;
type Story = StoryObj<typeof EsiSelect>;

// ============================================================================
// MULTIPLE MODE STORIES
// ============================================================================

export const MultipleDefault: Story = {
  name: "Multiple: Default (Grouped)",
  args: baseStoryArgs,
  render: createStoryRender("Basic multiple selection"),
};

export const MultipleWithIconsAndGroups: Story = {
  name: "Multiple: With Icons and Groups",
  args: iconStoryArgs,
  render: createStoryRender("Icons and group organization"),
};

export const MultipleDefaultUngrouped: Story = {
  name: "Multiple: Default (Ungrouped)",
  args: ungroupedStoryArgs,
  render: createStoryRender("Ungrouped options"),
};

export const MultipleWithForm: Story = {
  name: "Multiple: Form Integration (react-hook-form)",
  args: iconStoryArgs,
  render: createFormStoryRender("With Form integration"),
};

export const MultipleLargeDataset: Story = {
  name: "Multiple: Large Dataset (200 items, grouped)",
  args: { ...largeStoryArgs, maxCount: "auto" },
  render: createStoryRender("Try searching and group toggles"),
};

export const MultipleFixedOverflow: Story = {
  name: "Multiple: Fixed Overflow (maxCount=3)",
  args: {
    options: [...baseOptions, ...iconOptions.slice(0, 4)],
    defaultValue: baseOptions.slice(0, 2).map((o) => o.value),
    maxCount: 3,
  },
  render: createStoryRender("Fixed Overflow (maxCount=3)"),
};

export const MultipleOverflowAuto: Story = {
  name: "Multiple: Overflow (Auto Badge Count)",
  args: {
    options: [...baseOptions, ...iconOptions],
    defaultValue: [...baseOptions.slice(0, 3), ...iconOptions.slice(0, 4)].map((o) => o.value),
    maxCount: "auto",
  },
  render: createStoryRender("Auto overflow with dynamic badge counting"),
};

// ============================================================================
// MULTIPLE MODE - CUSTOMIZATION STORIES
// ============================================================================

export const MultipleCustomBadges: Story = {
  name: "Multiple: Custom Badge Styling & Content",
  args: {
    options: iconOptions,
    defaultValue: iconOptions.slice(0, 4).map((o) => o.value),
    selectedBadgeProps: (option) => createSharedCustomizations().getBadgeProps(option),
    renderSelectedBadge: ({ option, labelNode, iconNode, removeNode }) =>
      createSharedCustomizations().renderEnhancedBadge({ option, labelNode, iconNode, removeNode }),
    selectedBadgeGroupClassName: "[overflow-clip-margin:1px]",
    selectedExtraBadge: { id: "extra", variant: "secondary" as const },
  },
  render: createStoryRender("Custom badge styling and content layout"),
};

export const MultipleCustomOptionRenderer: Story = {
  name: "Multiple: Custom Option Rendering",
  args: {
    ...iconStoryArgs,
    optionItemClassName: "px-3 py-2",
    renderOption: ({ option, isSelected, iconNode, labelNode }) =>
      createSharedCustomizations().renderEnhancedOption({ option, isSelected, iconNode, labelNode }),
  },
  render: createStoryRender("Enhanced option design with animations"),
};

export const MultipleCombinedCustomizations: Story = {
  name: "Multiple: Combined Badge & Option Customizations",
  args: {
    ...iconStoryArgs,
    optionItemClassName: "px-3 py-2",
    selectedBadgeProps: (option) => createSharedCustomizations().getBadgeProps(option),
    renderSelectedBadge: ({ option, labelNode, iconNode, removeNode }) =>
      createSharedCustomizations().renderEnhancedBadge({ option, labelNode, iconNode, removeNode }),
    renderOption: ({ option, isSelected, iconNode, labelNode }) =>
      createSharedCustomizations().renderEnhancedOption({ option, isSelected, iconNode, labelNode }),
    selectedBadgeGroupClassName: "[overflow-clip-margin:1px]",
    selectedExtraBadge: { id: "extra", variant: "secondary" as const },
  },
  render: createStoryRender("Both badge and option customizations together"),
};

export const MultipleUngroupedCustomOptionRenderer: Story = {
  name: "Multiple: Custom Option Rendering (Ungrouped)",
  args: {
    ...ungroupedStoryArgs,
    optionItemClassName: "px-3 py-2",
    renderOption: ({ option, isSelected, iconNode, labelNode }) =>
      createSharedCustomizations().renderEnhancedOption({ option, isSelected, iconNode, labelNode }),
  },
  render: createStoryRender("Ungrouped custom option design"),
};

// ============================================================================
// SINGLE MODE STORIES
// ============================================================================

export const SingleDefault: Story = {
  name: "Single: Default (Grouped)",
  args: singleBaseStoryArgs,
  render: createSingleStoryRender("Pick one item"),
};

export const SingleWithIcons: Story = {
  name: "Single: With Icons and Groups",
  args: singleIconStoryArgs,
  render: createSingleStoryRender("Pick one team/system"),
};

export const SingleUngrouped: Story = {
  name: "Single: Default (Ungrouped)",
  args: singleUngroupedStoryArgs,
  render: createSingleStoryRender("Pick one fruit"),
};

export const SingleWithForm: Story = {
  name: "Single: Form Integration",
  args: singleIconStoryArgs,
  render: createSingleFormStoryRender("With Form integration (single)"),
};

export const SingleLargeDataset: Story = {
  name: "Single: Large Dataset (200 items, grouped)",
  args: largeStoryArgs,
  render: createSingleStoryRender("Try searching (single)"),
};

// ============================================================================
// SINGLE MODE - CUSTOMIZATION STORIES
// ============================================================================

export const SingleCustomOptionRenderer: Story = {
  name: "Single: Custom Option Rendering",
  args: {
    ...singleIconStoryArgs,
    optionItemClassName: "px-3 py-2",
    renderOption: ({
      option,
      isSelected,
      iconNode,
      labelNode,
    }: {
      option: {
        label: string;
        value: string;
        icon?: React.ComponentType;
        group?: string;
      };
      isSelected: boolean;
      checkboxNode: React.ReactNode;
      iconNode?: React.ReactNode;
      labelNode: React.ReactNode;
    }) => (
      <div className="flex items-center gap-3 w-full group">
        {/* Custom icon with background */}
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full transition-all",
            isSelected
              ? "bg-primary [&_svg]:text-primary-foreground scale-110"
              : "bg-muted text-muted-foreground group-hover:bg-muted/80"
          )}
        >
          {iconNode || <LucideAtom className="w-4 h-4" />}
        </div>

        {/* Label with custom styling */}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "font-medium transition-colors",
              isSelected ? "text-primary" : "text-foreground"
            )}
          >
            {labelNode}
          </div>
          <div className="text-xs text-muted-foreground">
            {option.group} • {option.value}
          </div>
        </div>

        {/* Custom selection indicator */}
        <div
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full border transition-all",
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30 text-transparent"
          )}
        >
          {isSelected && <LucideCheck className="w-3 h-3" />}
        </div>
      </div>
    ),
  },
  render: createSingleStoryRender("Custom option design"),
};

export const SingleCustomTrigger: Story = {
  name: "Single: Custom Trigger Display",
  args: {
    ...singleIconStoryArgs,
    defaultValue: "team-1",
    renderSelectedTrigger: ({ option, iconNode }) => (
      <div className="flex items-center gap-2 w-full">
        {/* Custom icon with background */}
        {iconNode && (
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary">
            {React.cloneElement(iconNode as React.ReactElement, { className: "w-3 h-3" })}
          </div>
        )}

        {/* Label with custom styling */}
        <span className="mr-auto text-sm font-medium text-foreground">
          {option.label}
        </span>

        {/* Group badge */}
        {option.group && (
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {option.group}
          </Badge>
        )}
      </div>
    ),
    selectedTriggerProps: {
      className: "px-2 py-1 rounded-md bg-muted/50 hover:bg-muted/70 transition-colors",
    },
  },
  render: createSingleStoryRender("Custom trigger display with enhanced styling"),
};

export const SingleCombinedCustomizations: Story = {
  name: "Single: Combined Trigger & Option Customizations",
  args: {
    ...singleIconStoryArgs,
    defaultValue: "team-1",
    optionItemClassName: "px-3 py-2",
    renderOption: ({ option, isSelected, iconNode, labelNode }) =>
      createSharedCustomizations().renderEnhancedOption({ option, isSelected, iconNode, labelNode }),
    renderSelectedTrigger: ({ option, iconNode }) => (
      <div className="flex items-center gap-2 w-full">
        {/* Custom icon with background - matching option styling */}
        {iconNode && (
          <div
            className={cn(
              "flex items-center justify-center w-5 h-5 rounded-full transition-all",
              "bg-primary/10 text-primary"
            )}
          >
            {React.cloneElement(iconNode as React.ReactElement, { className: "w-3 h-3" })}
          </div>
        )}

        {/* Label with custom styling */}
        <span className="mr-auto text-sm font-medium text-foreground">
          {option.label}
        </span>

        {/* Group badge - matching option styling */}
        {option.group && (
          <Badge
            variant="outline"
            className={cn(
              "text-xs px-1.5 py-0.5",
              option.group === "Team" && "border-blue-600/40 dark:border-blue-900/70 text-blue-700 dark:text-blue-300",
              option.group === "Infra" && "border-orange-600/40 dark:border-orange-900/70 text-orange-700 dark:text-orange-300",
              option.group === "Security" && "border-red-600/40 dark:border-red-900/70 text-red-700 dark:text-red-300",
              option.group === "Bug" && "border-yellow-600/40 dark:border-yellow-900/70 text-yellow-700 dark:text-yellow-300",
              option.group === "Atom" && "border-purple-600/40 dark:border-purple-900/70 text-purple-700 dark:text-purple-300"
            )}
          >
            {option.group}
          </Badge>
        )}
      </div>
    ),
    selectedTriggerProps: {
      className: "px-2 py-1 rounded-md bg-muted/50 hover:bg-muted/70 transition-colors border border-border/50",
    },
  },
  render: createSingleStoryRender("Both trigger and option customizations working together"),
};

export const SingleUngroupedCustomOptionRenderer: Story = {
  name: "Single: Custom Option Rendering (Ungrouped)",
  args: {
    ...singleUngroupedStoryArgs,
    renderOption: ({ option, isSelected, iconNode, labelNode }) =>
      createSharedCustomizations().renderEnhancedOption({ option, isSelected, iconNode, labelNode }),
  },
  render: createSingleStoryRender("Ungrouped custom option design"),
};

export const CustomEmptyState: Story = {
  name: "Custom Empty State",
  args: { options: [], placeholder: "Nothing to pick" },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Wrapper>
        <Field label="Single mode (emptyState)">
          <EsiSelect
            mode="single"
            options={args.options}
            placeholder={args.placeholder}
            emptyState={
              <div className="flex flex-col items-center justify-center text-center gap-3 text-muted-foreground">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg">🙂</span>
                </div>
                <div className="text-base font-medium text-foreground">
                  Nothing here yet
                </div>
                <div className="text-xs max-w-xs">
                  Try adjusting your filters or come back later when items are
                  available.
                </div>
              </div>
            }
            defaultValue={null}
            onValueChange={() => {}}
          />
        </Field>
      </Wrapper>
      <Wrapper>
        <Field label="Multiple mode (emptyState)">
          <EsiSelect
            mode="multiple"
            options={args.options}
            placeholder={args.placeholder}
            emptyState={
              <div className="flex flex-col items-center justify-center text-center gap-3 text-muted-foreground">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg">🗂️</span>
                </div>
                <div className="text-base font-medium text-foreground">
                  No options to select
                </div>
                <div className="text-xs max-w-xs">
                  Start by adding data or choose a different source.
                </div>
              </div>
            }
            defaultValue={[]}
            onValueChange={() => {}}
          />
        </Field>
      </Wrapper>
    </div>
  ),
};

export const SingleListOverrideLoading: Story = {
  name: "List Override - Loading",
  args: singleBaseStoryArgs,
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Wrapper>
        <Field label="Single mode (renderListContent)">
          <EsiSelect
            mode="single"
            options={args.options}
            placeholder="Fetching..."
            renderListContent={() => (
              <div className="flex items-center justify-center py-4 text-sm text-muted-foreground" aria-busy>
                <Loader />
              </div>
            )}
            defaultValue={null}
            onValueChange={() => {}}
          />
        </Field>
      </Wrapper>
      <Wrapper>
        <Field label="Multiple mode (renderListContent)">
          <EsiSelect
            mode="multiple"
            options={args.options}
            placeholder="Fetching..."
            renderListContent={() => (
              <div className="flex items-center justify-center py-4 text-sm text-muted-foreground" aria-busy>
                <Loader />
              </div>
            )}
            defaultValue={[]}
            onValueChange={() => {}}
          />
        </Field>
      </Wrapper>
    </div>
  ),
};

export const SingleListOverrideError: Story = {
  name: "List Override - Error",
  args: singleBaseStoryArgs,
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Wrapper>
        <Field label="Single mode (renderListContent)">
          <EsiSelect
            mode="single"
            options={args.options}
            placeholder="Select an option"
            renderListContent={() => (
              <div className="flex items-center justify-center py-4 text-sm text-destructive">
                Failed to load options: Something went wrong
              </div>
            )}
            defaultValue={null}
            onValueChange={() => {}}
          />
        </Field>
      </Wrapper>
      <Wrapper>
        <Field label="Multiple mode (renderListContent)">
          <EsiSelect
            mode="multiple"
            options={args.options}
            placeholder="Select an option"
            renderListContent={() => (
              <div className="flex items-center justify-center py-4 text-sm text-destructive">
                Failed to load options: Something went wrong
              </div>
            )}
            defaultValue={[]}
            onValueChange={() => {}}
          />
        </Field>
      </Wrapper>
    </div>
  ),
};

export const SingleTriggerLoadingSkeleton: Story = {
  name: "Trigger Override - Loading Skeleton",
  args: singleBaseStoryArgs,
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Wrapper>
        <Field label="Single mode (renderTrigger)">
          <EsiSelect
            mode="single"
            options={args.options}
            placeholder="Pick an item"
            renderTrigger={({ selectedValues }) =>
              selectedValues.length === 0 ? (
                <span className="flex items-center gap-2 w-full">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </span>
              ) : (
                <span className="text-sm truncate flex-1 text-foreground inline-flex items-center gap-2">
                  Loaded value
                </span>
              )
            }
            disabled
            defaultValue={null}
            onValueChange={() => {}}
          />
        </Field>
      </Wrapper>
      <Wrapper>
        <Field label="Multiple mode (renderTrigger)">
          <EsiSelect
            mode="multiple"
            options={args.options}
            placeholder="Pick items"
            renderTrigger={({ selectedValues }) =>
              selectedValues.length === 0 ? (
                <span className="flex items-center gap-2 w-full">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </span>
              ) : (
                <span className="text-sm truncate flex-1 text-foreground inline-flex items-center gap-2">
                  Loaded values
                </span>
              )
            }
            disabled
            defaultValue={[]}
            onValueChange={() => {}}
          />
        </Field>
      </Wrapper>
    </div>
  ),
};

const ControlledNormalizationSemanticsComponent: React.FC<{
  options: React.ComponentProps<typeof EsiSelect>["options"];
}> = ({ options }) => {
  // Single-mode: undefined => uncontrolled; null => controlled empty; "" and other strings => controlled selected
  const [singleValue, setSingleValue] = React.useState<string | null | undefined>(undefined);
  const [singleLastChange, setSingleLastChange] = React.useState<string | null>(null);

  // Multiple-mode: undefined => uncontrolled; [] => controlled empty; [..] => controlled selected
  const [multiValue, setMultiValue] = React.useState<string[] | undefined>(undefined);
  const [multiLastChange, setMultiLastChange] = React.useState<string[]>([]);

  const first = options[0]?.value ?? "alpha-1";
  const second = options[1]?.value ?? "beta-2";

  return (
    <div className="flex flex-col gap-8">
      <Wrapper>
        <Field label="Single mode - Controlled vs Uncontrolled">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => setSingleValue(undefined)}>Prop: value undefined (uncontrolled)</Button>
            <Button size="sm" variant="secondary" onClick={() => setSingleValue(null)}>Prop: value null (clear)</Button>
            <Button size="sm" variant="secondary" onClick={() => setSingleValue("")}>Prop: value "" (empty string)</Button>
            <Button size="sm" variant="secondary" onClick={() => setSingleValue(first)}>Prop: value first option</Button>
          </div>
          <div className="mt-3" />
          <EsiSelect
            mode="single"
            options={options}
            placeholder="Pick an item"
            {...(singleValue !== undefined ? { value: singleValue } : {})}
            onValueChange={(v) => setSingleLastChange(v)}
          />
          <div className="text-xs text-muted-foreground mt-2 space-y-1">
            <div>Prop value: {singleValue === undefined ? "undefined" : singleValue === null ? "null" : `"${singleValue}"`}</div>
            <div>onValueChange last: {singleLastChange === null ? "null" : `"${singleLastChange}"`}</div>
            <div className="opacity-70">Normalization: undefined ⇒ uncontrolled; null ⇒ internal [] (cleared); string (incl. empty) ⇒ internal [string]</div>
          </div>
        </Field>
      </Wrapper>

      <Wrapper>
        <Field label="Multiple mode - Controlled vs Uncontrolled">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => setMultiValue(undefined)}>Prop: value undefined (uncontrolled)</Button>
            <Button size="sm" variant="secondary" onClick={() => setMultiValue([])}>Prop: value [] (clear)</Button>
            <Button size="sm" variant="secondary" onClick={() => setMultiValue([first])}>Prop: value [first]</Button>
            <Button size="sm" variant="secondary" onClick={() => setMultiValue([first, second])}>Prop: value [first, second]</Button>
          </div>
          <div className="mt-3" />
          <EsiSelect
            mode="multiple"
            options={options}
            placeholder="Pick items"
            {...(multiValue !== undefined ? { value: multiValue } : {})}
            onValueChange={(v) => setMultiLastChange(v)}
          />
          <div className="text-xs text-muted-foreground mt-2 space-y-1">
            <div>Prop value: {multiValue === undefined ? "undefined" : JSON.stringify(multiValue)}</div>
            <div>onValueChange last: {JSON.stringify(multiLastChange)}</div>
            <div className="opacity-70">Normalization: undefined ⇒ uncontrolled; [] ⇒ internal [] (cleared); [..] ⇒ internal same array</div>
          </div>
        </Field>
      </Wrapper>
    </div>
  );
};

export const ControlledNormalizationSemantics: Story = {
  name: "Controlled vs Uncontrolled (Normalization)",
  args: singleBaseStoryArgs,
  render: (args) => (
    <ControlledNormalizationSemanticsComponent options={args.options} />
  ),
};


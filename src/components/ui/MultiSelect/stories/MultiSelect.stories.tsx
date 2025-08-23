import type { Meta, StoryObj } from "@storybook/react";
import { MultiSelect } from "../../MultiSelect";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  baseOptions,
  iconOptions,
  longLabelOptions,
  createStoryRender,
  createFormStoryRender,
  baseStoryArgs,
  iconStoryArgs,
  largeStoryArgs,
  ungroupedStoryArgs,
} from "./stories.utils";
import { LucideCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const meta = {
  title: "UI/MultiSelect",
  component: MultiSelect,
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
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof MultiSelect>;

export const Default: Story = {
  name: "Default (Grouped)",
  args: baseStoryArgs,
  render: createStoryRender("Pick items"),
};

export const WithIconsAndGroups: Story = {
  name: "With Icons and Groups",
  args: iconStoryArgs,
  render: createStoryRender("Teams and Systems"),
};

export const MaxCountAuto: Story = {
  name: "Overflow: Auto Badge Count",
  args: {
    ...iconStoryArgs,
    defaultValue: iconOptions.slice(0, 8).map((o) => o.value),
    maxCount: "auto" as const,
  },
  render: createStoryRender("Auto Overflow (responsive)"),
};

export const MaxCountFixed: Story = {
  name: "Overflow: Fixed Badge Count",
  args: {
    ...baseStoryArgs,
    defaultValue: baseOptions.slice(0, 6).map((o) => o.value),
    maxCount: 3,
  },
  render: createStoryRender("Fixed Overflow (maxCount=3)"),
};

export const CustomBadges: Story = {
  name: "Custom Selected Badges",
  args: {
    options: [...longLabelOptions, ...iconOptions.slice(0, 4)],
    defaultValue: longLabelOptions.slice(0, 2).map((o) => o.value),
    selectedBadgeDefaults: { variant: "secondary" as const },
    selectedExtraBadge: { id: "extra", variant: "outline" as const },
  },
  render: createStoryRender("Customized badges (+N)"),
};

export const CustomOptionRenderer: Story = {
  name: "Custom Option Rendering",
  args: {
    ...iconStoryArgs,
    optionItemClassName: "px-2",
    renderOption: ({
      isSelected,
      iconNode,
      labelNode,
    }: {
      isSelected: boolean;
      checkboxNode: React.ReactNode;
      iconNode?: React.ReactNode;
      labelNode: React.ReactNode;
    }) => (
      <div className="flex items-center gap-2 w-full">
        <div className="ml-auto">{iconNode}</div>
        <div className="flex items-center gap-2 min-w-0 w-full">
          <span className="truncate mr-auto">{labelNode}</span>
          <LucideCheck className={cn(!isSelected && "invisible")} />
        </div>
      </div>
    ),
  },
  render: createStoryRender("Composed option row"),
};

export const LargeDataset: Story = {
  name: "Large Dataset (200 items, grouped)",
  args: { ...largeStoryArgs, maxCount: "auto" },
  render: createStoryRender("Try searching and group toggles"),
};

export const WithForm: Story = {
  name: "Form Integration (react-hook-form)",
  args: iconStoryArgs,
  render: createFormStoryRender("With Form integration"),
};

export const DefaultUngrouped: Story = {
  name: "Default (Ungrouped)",
  args: ungroupedStoryArgs,
  render: createStoryRender("Ungrouped options"),
};

import * as React from "react";
import type { StoryFn } from "@storybook/react";
import { EsiSelect, type EsiSelectMultipleProps, type Option } from "@/components/ui/EsiSelect";
import { Card } from "@/components/ui/card";
import { CodeTextarea } from "@/components/ui/CodeTextarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { LucideAtom, LucideBug, LucideKey, LucideServer, LucideUser } from "lucide-react";

export const baseOptions: Option[] = [
  { label: "Alpha Item 1", value: "alpha-1", group: "Alpha" },
  { label: "Beta Item 2", value: "beta-2", group: "Beta" },
  { label: "Gamma Item 3", value: "gamma-3", group: "Gamma" },
  { label: "Alpha Item 4", value: "alpha-4", group: "Alpha" },
  { label: "Beta Item 5", value: "beta-5", group: "Beta" },
  { label: "Gamma Item 6", value: "gamma-6", group: "Gamma" },
  { label: "Alpha Item 7", value: "alpha-7", group: "Alpha" },
  { label: "Beta Item 8", value: "beta-8", group: "Beta" },
  { label: "Gamma Item 9", value: "gamma-9", group: "Gamma" },
  { label: "Alpha Item 10", value: "alpha-10", group: "Alpha" },
  { label: "Beta Item 11", value: "beta-11", group: "Beta" },
  { label: "Gamma Item 12", value: "gamma-12", group: "Gamma" },
];

export const iconOptions: Option[] = [
  { label: "Team Item 1", value: "team-1", group: "Team", icon: LucideUser },
  { label: "Infra Item 2", value: "infra-2", group: "Infra", icon: LucideServer },
  { label: "Security Item 3", value: "security-3", group: "Security", icon: LucideKey },
  { label: "Bug Item 4", value: "bug-4", group: "Bug", icon: LucideBug },
  { label: "Atom Item 5", value: "atom-5", group: "Atom", icon: LucideAtom },
  { label: "Team Item 6", value: "team-6", group: "Team", icon: LucideUser },
  { label: "Infra Item 7", value: "infra-7", group: "Infra", icon: LucideServer },
  { label: "Security Item 8", value: "security-8", group: "Security", icon: LucideKey },
  { label: "Bug Item 9", value: "bug-9", group: "Bug", icon: LucideBug },
  { label: "Atom Item 10", value: "atom-10", group: "Atom", icon: LucideAtom },
  { label: "Team Item 11", value: "team-11", group: "Team", icon: LucideUser },
  { label: "Atom Item 12", value: "atom-12", group: "Atom", icon: LucideAtom },
];

export const longLabelOptions: Option[] = [
  {
    label: "Extremely long label that should test truncation and overflow within the badge group rendering pipeline",
    value: "long-1",
    group: "Alpha",
    icon: LucideAtom,
  },
  { label: "Moderately long label for visual testing", value: "long-2", group: "Alpha", icon: LucideUser },
  { label: "Short", value: "short-1", group: "Beta", icon: LucideKey },
  { label: "Medium length label demo", value: "med-1", group: "Gamma", icon: LucideServer },
];

export const largeOptions: Option[] = Array.from({ length: 200 }, (_, i) => {
  const groups = ["Group A", "Group B", "Group C", "Group D"];
  const icons = [LucideUser, LucideServer, LucideKey, LucideBug, LucideAtom];
  const group = groups[i % groups.length];
  const icon = icons[i % icons.length];
  return {
    label: `${group} Item ${i + 1}`,
    value: `${group.toLowerCase()}-${i + 1}`,
    group,
    icon,
  };
});

export const ungroupedOptions: Option[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Date", value: "date" },
];

export const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Card className="p-4 w-[640px] space-y-3">{children}</Card>
);

export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid gap-2">
    <Label>{label}</Label>
    {children}
  </div>
);

export const SelectedEcho: React.FC<{ values: string[] }> = ({ values }) => (
  <div className="text-xs text-muted-foreground">
    <div className="font-medium mb-1">Value</div>
    <CodeTextarea
      language="json"
      value={values.length ? JSON.stringify(values) : "[]"}
      disabled
      className="p-2 dark"
    />
  </div>
);

export const SelectedEchoSingle: React.FC<{ value: string | null }> = ({ value }) => (
  <div className="text-xs text-muted-foreground">
    <div className="font-medium mb-1">Value</div>
    <CodeTextarea
      language="json"
      value={value ? JSON.stringify(value) : "null"}
      disabled
      className="p-2 dark"
    />
  </div>
);

export const createStoryRender = (
  fieldLabel: string,
  additionalProps?: Partial<EsiSelectMultipleProps>
): StoryFn<React.ComponentProps<typeof EsiSelect>> => {
  return (args) => {
    const startDefault = (args as unknown as { defaultValue?: string[] }).defaultValue ?? [];
    const [values, setValues] = React.useState<string[]>(startDefault);
    const passThrough = args as React.ComponentProps<typeof EsiSelect>;
    const passAdditional = additionalProps as Partial<EsiSelectMultipleProps> | undefined;

    // Cast to multiple props for badge-related properties
    const multipleProps = passThrough as EsiSelectMultipleProps;

    return (
      <Wrapper>
        <Field label={fieldLabel}>
          <EsiSelect
            mode="multiple"
            options={(passAdditional?.options ?? passThrough.options) as Option[]}
            placeholder={passAdditional?.placeholder ?? passThrough?.placeholder}
            optionItemClassName={passAdditional?.optionItemClassName ?? passThrough?.optionItemClassName}
            renderOption={passAdditional?.renderOption ?? passThrough?.renderOption}
            className={passAdditional?.className ?? passThrough?.className}
            disabled={passAdditional?.disabled ?? passThrough?.disabled}
            maxCount={(additionalProps as Partial<{ maxCount?: number | "auto" }>)?.maxCount ?? (args as Partial<{ maxCount?: number | "auto" }>)?.maxCount}
            selectedExtraBadge={passAdditional?.selectedExtraBadge ?? multipleProps?.selectedExtraBadge}
            renderSelectedBadge={passAdditional?.renderSelectedBadge ?? multipleProps?.renderSelectedBadge}
            selectedBadgeProps={passAdditional?.selectedBadgeProps ?? multipleProps?.selectedBadgeProps}
            selectedBadgeGroupClassName={passAdditional?.selectedBadgeGroupClassName ?? multipleProps?.selectedBadgeGroupClassName}
            defaultValue={startDefault}
            onValueChange={setValues}
          />
        </Field>
        <SelectedEcho values={values} />
      </Wrapper>
    );
  };
};

export const createSingleStoryRender = (
  fieldLabel: string,
  additionalProps?: Partial<React.ComponentProps<typeof EsiSelect>>
): StoryFn<React.ComponentProps<typeof EsiSelect>> => {
  return (args) => {
    const startDefault = (args as unknown as { defaultValue?: string | null }).defaultValue ?? null;
    const [value, setValue] = React.useState<string | null>(startDefault);
    type SingleStoryArgs = Pick<React.ComponentProps<typeof EsiSelect>,
      | "options"
      | "placeholder"
      | "optionItemClassName"
      | "renderOption"
      | "className"
      | "disabled"
      | "renderSelectedTrigger"
      | "selectedTriggerProps"
    >;
    const passThrough = args as unknown as Partial<SingleStoryArgs>;
    const passAdditional = additionalProps as Partial<SingleStoryArgs> | undefined;
    return (
      <Wrapper>
        <Field label={fieldLabel}>
          <EsiSelect
            mode="single"
            options={(passAdditional?.options ?? passThrough.options) as Option[]}
            placeholder={passAdditional?.placeholder ?? passThrough?.placeholder}
            optionItemClassName={passAdditional?.optionItemClassName ?? passThrough?.optionItemClassName}
            renderOption={passAdditional?.renderOption ?? passThrough?.renderOption}
            className={passAdditional?.className ?? passThrough?.className}
            disabled={passAdditional?.disabled ?? passThrough?.disabled}
            renderSelectedTrigger={passAdditional?.renderSelectedTrigger ?? passThrough?.renderSelectedTrigger}
            selectedTriggerProps={passAdditional?.selectedTriggerProps ?? passThrough?.selectedTriggerProps}
            defaultValue={startDefault}
            onValueChange={setValue}
          />
        </Field>
        <SelectedEchoSingle value={value ?? null} />
      </Wrapper>
    );
  };
};

export const createFormStoryRender = (
  fieldLabel: string,
  additionalProps?: Partial<EsiSelectMultipleProps>
): StoryFn<React.ComponentProps<typeof EsiSelect>> => {
  return (args) => {
    const form = useForm<{ selections: string[] }>({ defaultValues: { selections: [] }, mode: "onChange" });
    const watched = form.watch("selections");
    const passThrough = args as React.ComponentProps<typeof EsiSelect>;
    const passAdditional = additionalProps as Partial<EsiSelectMultipleProps> | undefined;

    // Cast to multiple props for badge-related properties
    const multipleProps = passThrough as EsiSelectMultipleProps;

    return (
      <Wrapper>
        <Form {...form}>
          <FormField
            control={form.control}
            name="selections"
            rules={{ validate: (val?: string[]) => (val && val.length > 0) || "Select at least one option" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex">{fieldLabel}</FormLabel>
                <FormControl>
                  <EsiSelect
                    mode="multiple"
                    options={(passAdditional?.options ?? passThrough.options) as Option[]}
                    placeholder={passAdditional?.placeholder ?? passThrough?.placeholder}
                    optionItemClassName={passAdditional?.optionItemClassName ?? passThrough?.optionItemClassName}
                    renderOption={passAdditional?.renderOption ?? passThrough?.renderOption}
                    className={passAdditional?.className ?? passThrough?.className}
                    disabled={passAdditional?.disabled ?? passThrough?.disabled}
                    maxCount={(additionalProps as Partial<{ maxCount?: number | "auto" }>)?.maxCount ?? (args as Partial<{ maxCount?: number | "auto" }>)?.maxCount}
                    selectedExtraBadge={passAdditional?.selectedExtraBadge ?? multipleProps?.selectedExtraBadge}
                    renderSelectedBadge={passAdditional?.renderSelectedBadge ?? multipleProps?.renderSelectedBadge}
                    selectedBadgeProps={passAdditional?.selectedBadgeProps ?? multipleProps?.selectedBadgeProps}
                    selectedBadgeGroupClassName={passAdditional?.selectedBadgeGroupClassName ?? multipleProps?.selectedBadgeGroupClassName}
                    defaultValue={field.value ?? []}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <SelectedEcho values={watched} />
        </Form>
      </Wrapper>
    );
  };
};

export const createSingleFormStoryRender = (
  fieldLabel: string,
  additionalProps?: Partial<React.ComponentProps<typeof EsiSelect>>
): StoryFn<React.ComponentProps<typeof EsiSelect>> => {
  return (args) => {
    const form = useForm<{ selection: string | null }>({ defaultValues: { selection: null }, mode: "onChange" });
    const watched = form.watch("selection");
    type SingleStoryArgs = Pick<React.ComponentProps<typeof EsiSelect>,
      | "options"
      | "placeholder"
      | "optionItemClassName"
      | "renderOption"
      | "className"
      | "disabled"
    >;
    const passThrough = args as unknown as Partial<SingleStoryArgs>;
    const passAdditional = additionalProps as Partial<SingleStoryArgs> | undefined;
    return (
      <Wrapper>
        <Form {...form}>
          <FormField
            control={form.control}
            name="selection"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex">{fieldLabel}</FormLabel>
                <FormControl>
                  <EsiSelect
                    mode="single"
                    options={(passAdditional?.options ?? passThrough.options) as Option[]}
                    placeholder={passAdditional?.placeholder ?? passThrough?.placeholder}
                    optionItemClassName={passAdditional?.optionItemClassName ?? passThrough?.optionItemClassName}
                    renderOption={passAdditional?.renderOption ?? passThrough?.renderOption}
                    className={passAdditional?.className ?? passThrough?.className}
                    disabled={passAdditional?.disabled ?? passThrough?.disabled}
                    defaultValue={field.value ?? null}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
        <SelectedEchoSingle value={watched ?? null} />
      </Wrapper>
    );
  };
};

export const commonStoryArgs = { placeholder: "Select options" };
export const iconStoryArgs = { options: iconOptions, placeholder: "Search by label only" };
export const baseStoryArgs = { options: baseOptions, placeholder: "Select options" };
export const largeStoryArgs = { options: largeOptions, placeholder: "Type to filter by label" };
export const ungroupedStoryArgs = { options: ungroupedOptions, placeholder: "Pick fruits" };

export const singleBaseStoryArgs = baseStoryArgs;
export const singleIconStoryArgs = iconStoryArgs;
export const singleUngroupedStoryArgs = ungroupedStoryArgs;

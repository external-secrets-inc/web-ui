import * as React from "react";
import type { StoryFn } from "@storybook/react";
import { MultiSelect, type Option } from "@/components/ui/MultiSelect";
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
  <div className="grid gap-1">
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

export const createStoryRender = (
  fieldLabel: string,
  additionalProps?: Partial<React.ComponentProps<typeof MultiSelect>>
): StoryFn<React.ComponentProps<typeof MultiSelect>> => {
  return (args) => {
    const [values, setValues] = React.useState<string[]>(args.defaultValue || []);
    return (
      <Wrapper>
        <Field label={fieldLabel}>
          <MultiSelect {...args} {...additionalProps} onValueChange={setValues} />
        </Field>
        <SelectedEcho values={values} />
      </Wrapper>
    );
  };
};

export const createFormStoryRender = (
  fieldLabel: string,
  additionalProps?: Partial<React.ComponentProps<typeof MultiSelect>>
): StoryFn<React.ComponentProps<typeof MultiSelect>> => {
  return (args) => {
    const form = useForm<{ selections: string[] }>({ defaultValues: { selections: [] }, mode: "onChange" });
    const watched = form.watch("selections");
    return (
      <Wrapper>
        <Form {...form}>
          <FormField
            control={form.control}
            name="selections"
            rules={{ validate: (val?: string[]) => (val && val.length > 0) || "Select at least one option" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldLabel}</FormLabel>
                <FormControl>
                  <MultiSelect {...args} {...additionalProps} defaultValue={field.value ?? []} onValueChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
        <SelectedEcho values={watched ?? []} />
      </Wrapper>
    );
  };
};

export const commonStoryArgs = { placeholder: "Select options" };
export const iconStoryArgs = { options: iconOptions, placeholder: "Search by label only" };
export const baseStoryArgs = { options: baseOptions, placeholder: "Select options" };
export const largeStoryArgs = { options: largeOptions, placeholder: "Type to filter by label" };
export const ungroupedStoryArgs = { options: ungroupedOptions, placeholder: "Pick fruits" };

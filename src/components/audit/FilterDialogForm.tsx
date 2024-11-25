import { zodResolver } from "@hookform/resolvers/zod";
import { Control, useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ComponentType, useState } from "react";
import { MultiSelect } from "../ui/Multi-select";

const filterSchema = z.object({
  provider: z.array(z.string()),
  policy: z.string().optional(),
  secretName: z.string().optional(),
  policyStatus: z.string().optional(),
  duplicates: z.string().optional(),
  lastAccess: z.string().optional(),
  lastRotation: z.string().optional(),
  accessors: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

const InputFilter = ({
  formControl,
  name,
  label,
  placeholder,
  suggestions,
}: {
  formControl: Control<FilterFormValues>;
  name: keyof FilterFormValues;
  label: string;
  placeholder: string;
  suggestions: string[];
}) => (
  <FormField
    control={formControl}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <div>
            <Input
              placeholder={placeholder}
              list={`${name}-suggestions`}
              {...field}
            />
            <datalist id={`${name}-suggestions`}>
              {suggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const BooleanFilter = ({
  formControl,
  name,
  label,
  placeholder,
  trueItem,
  falseItem,
}: {
  formControl: Control<FilterFormValues>;
  name: keyof FilterFormValues;
  label: string;
  placeholder: string;
  trueItem: string;
  falseItem: string;
}) => (
  <FormField
    control={formControl}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <Select
          value={field.value === "" || !field.value ? "null" : field.value.toString()}
          onValueChange={(value) =>
            field.onChange(
              value === "true" ? "true" : value === "false" ? "false" : ""
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null">All</SelectItem>
            <SelectItem value="true">{trueItem}</SelectItem>
            <SelectItem value="false">{falseItem}</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);

const DateFilter = ({
  form,
  name,
  label,
  minDate,
  maxDate,
}: {
  form: UseFormReturn<FilterFormValues>;
  name: Extract<keyof FilterFormValues, "lastAccess" | "lastRotation">;
  label: string;
  minDate?: string;
  maxDate?: string;
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="date"
              min={minDate}
              max={maxDate}
              className="mt-2"
              value={
                field.value && !isNaN(Date.parse(field.value)) // Pre-fill if the value is a valid date
                  ? field.value
                  : ""
              }
              onChange={(e) => field.onChange(e.target.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};


const FilterDialogForm = ({
  initialValues,
  onSubmit,
  secretsNames,
  policiesNames,
  toFilterProvidersList,
}: {
  initialValues: FilterFormValues;
  onSubmit: (data: FilterFormValues) => void;
  secretsNames: string[];
  policiesNames: string[];
  toFilterProvidersList: {
    label: string;
    value: string;
    icon?: ComponentType<{ className?: string | undefined; }> | undefined;
  }[];
}) => {
  const [resetKey, setResetKey] = useState(0);

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: initialValues,
  });

  const handleClear = () => {
    form.reset({
      provider: [],
      policy: "",
      secretName: "",
      policyStatus: "",
      duplicates: "",
      lastAccess: "",
      lastRotation: "",
      accessors: "",
    });

    setResetKey((prev) => prev + 1);
  };

  return (
    <DialogContent
      className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(100px,1fr)_auto] grid-cols-[minmax(100%,1fr)]"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle>Filters</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-4">
              {/* Provider Filter */}
              <FormField
                key={"provider" + resetKey}
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Providers</FormLabel>
                    <MultiSelect
                      options={toFilterProvidersList}
                      onValueChange={function (value: string[]): void { field.onChange(value) }}
                      defaultValue={field.value}
                      placeholder="Select providers"
                      variant="inverted"
                      maxCount={3}
                    />
                  </FormItem>
                )}
              />

              {/* Secret Name Input */}
              <InputFilter
                formControl={form.control}
                name="secretName"
                label="Secret Name"
                placeholder="Enter secret name"
                suggestions={secretsNames}
              />

              {/* Policy Input */}
              <InputFilter
                formControl={form.control}
                name="policy"
                label="Policy"
                placeholder="Enter policy"
                suggestions={policiesNames}
              />
            </div>

            <div className="grid gap-4">
              {/* Policy Status */}
              <BooleanFilter
                formControl={form.control}
                name="policyStatus"
                label="Policy Status"
                placeholder="Select policy status"
                trueItem="Compliant"
                falseItem="Non-Compliant"
              />

              {/* Duplicates  */}
              <BooleanFilter
                formControl={form.control}
                name="duplicates"
                label="Duplicates"
                placeholder="Select duplicates"
                trueItem="Contains"
                falseItem="Does not Contain"
              />

              {/* Accessors  */}
              <BooleanFilter
                formControl={form.control}
                name="accessors"
                label="Accessors"
                placeholder="Select accessors"
                trueItem="Contains"
                falseItem="Does not Contain"
              />
            </div>

            <DateFilter
              form={form}
              name="lastAccess"
              label="Last Access"
              minDate=""
              maxDate={new Date().toISOString().split("T")[0]} // Current date
            />

            <DateFilter
              form={form}
              name="lastRotation"
              label="Last Rotation"
              minDate={new Date(new Date().setDate(new Date().getDate() - 90))
                .toISOString()
                .split("T")[0]} // 90 days ago
              maxDate={new Date().toISOString().split("T")[0]} // Current date
            />
          </div>

          {/* Clear and Apply Buttons */}
          <DialogFooter className="flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={handleClear}>
              Clear
            </Button>
            <Button type="submit">Apply</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default FilterDialogForm;

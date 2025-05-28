// TODO: investigate less manual approaches to deal with stringified values from query params

import { zodResolver } from "@hookform/resolvers/zod";
import { Control, useForm, UseFormReturn } from "react-hook-form";
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
import { MultiSelect } from "@/components/ui/MultiSelect";
import { AuditSecretData, filterSchema, FilterSchema } from "./Audit.interfaces";
import useGetAuditProviders from "@/services/audit/queries/useGetAuditProviders";
import useGetPolicies from "@/services/audit/queries/useGetPolicies";
import { useMemo, useState, useEffect } from "react";
import { useAuditFilter } from "./AuditFilterContext";
import { Loader } from "@/components/ui/Loader";

interface FilterDialogFormProps {
  initialValues: FilterSchema;
  onSubmit: (data: FilterSchema) => void;
  listenerID: string;
}
import { formatDate } from "@/utils/dateUtils";
import useGetAuditSecrets from "@/services/audit/queries/useGetAuditSecrets";
import { AUDIT_QUERY_STALE_TIME } from "@/components/Audit/Audit.constants";

const BooleanFilter = ({
  formControl,
  name,
  label,
  placeholder,
  trueItem,
  falseItem,
}: {
  formControl: Control<FilterSchema>;
  name: keyof FilterSchema;
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
            <SelectItem value="null">Show all</SelectItem>
            <SelectItem value="true">{trueItem}</SelectItem>
            <SelectItem value="false">{falseItem}</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);

type DateKeys = Extract<
  keyof FilterSchema,
  "startLastAccess" | "endLastAccess" | "startLastRotation" | "endLastRotation"
>;

const DateRangeFilter = ({
  form,
  names,
  label,
  minDate,
  maxDate,
}: {
  form: UseFormReturn<FilterSchema>;
  names: { start: DateKeys; end: DateKeys };
  label: string;
  minDate?: string;
  maxDate?: string;
}) => {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="flex gap-2 items-center">
        {/* Start Date Input */}
        <FormField
          control={form.control}
          name={names.start}
          render={({ field }) => (
            <FormControl>
              <Input
                type="date"
                min={minDate}
                max={maxDate}
                value={
                  field.value && !isNaN(Date.parse(field.value))
                    ? field.value
                    : ""
                }
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Start Date"
              />
            </FormControl>
          )}
        />
        <span className="text-sm text-muted-foreground">to</span>
        {/* End Date Input */}
        <FormField
          control={form.control}
          name={names.end}
          render={({ field }) => (
            <FormControl>
              <Input
                type="date"
                min={minDate}
                max={maxDate}
                value={
                  field.value && !isNaN(Date.parse(field.value))
                    ? field.value
                    : ""
                }
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="End Date"
              />
            </FormControl>
          )}
        />
      </div>
      <FormMessage />
    </FormItem>
  );
};

type ArrayKeys = Extract<keyof FilterSchema, "providerIDs" | "secretIDs" | "policyIDs" | "duplicateIDs" | "accessorNames">
const MultiSelectFilter = ({
  formControl,
  name,
  label,
  options,
  placeholder,
}: {
  formControl: Control<FilterSchema>;
  name: ArrayKeys;
  label?: string;
  options: {
    label: string;
    value: string;
  }[];
  placeholder: string;
}) => (
  <FormField
    control={formControl}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <MultiSelect
          options={options}
          onValueChange={field.onChange}
          value={field.value}
          defaultValue={field.value}
          placeholder={placeholder}
          maxCount="auto"
        />
      </FormItem>
    )}
  />
);

function mapUniqueAccessors(auditSecrets?: AuditSecretData[]): { label: string; value: string }[] {
  if (!auditSecrets) {
    return []
  }

  const accessorSet = new Set<string>(); // To avoid duplicate names

  // Collect all accessors
  auditSecrets.forEach(secret => {
    secret.accessors.forEach(accessor => {
      if (!accessorSet.has(accessor.name)) {
        accessorSet.add(accessor.name);
      }
    });
  });

  // Convert to desired format
  return Array.from(accessorSet).map(accessorName => ({
    label: accessorName,
    value: accessorName
  }));
}

const FilterDialogForm = (
  {
    initialValues,
    onSubmit,
    listenerID,
  }: FilterDialogFormProps
) => {
  const [resetKey, setResetKey] = useState(0);
  const [accessorsVisible, setAccessorsVisible] = useState(false);
  const [duplicatesVisible, setDuplicatesVisible] = useState(false);
  const { handleFilterChange, isFiltersDialogOpen } = useAuditFilter();

  const form = useForm<FilterSchema>({
    resolver: zodResolver(filterSchema),
    defaultValues: initialValues,
  });

  // Sync form with APPLIED filters when dialog opens/closes
  useEffect(() => {
    if (isFiltersDialogOpen) {
      form.reset(initialValues);
    }
  }, [isFiltersDialogOpen, initialValues, form]);

  const { data: auditSecrets, isLoading: isLoadingSecrets } = useGetAuditSecrets(
    false,
    listenerID,
    {
      staleTime: AUDIT_QUERY_STALE_TIME,
      enabled: isFiltersDialogOpen,
    }
  );

  const { data: providers, isLoading: isLoadingProviders } = useGetAuditProviders(
    false,
    listenerID,
    {
      staleTime: AUDIT_QUERY_STALE_TIME,
      enabled: isFiltersDialogOpen,
    }
  );

  const { data: policies, isLoading: isLoadingPolicies } = useGetPolicies(
    false,
    {
      staleTime: AUDIT_QUERY_STALE_TIME,
      enabled: isFiltersDialogOpen,
    }
  );

  const isLoadingFilters = isLoadingSecrets || isLoadingProviders || isLoadingPolicies;

  // Transform data for filter options
  const filterOptions = useMemo(() => ({
    secretsNames: auditSecrets?.map(secret => ({
      label: secret.name,
      value: secret.id,
    })) || [],
    providersNames: providers?.map(provider => ({
      label: provider.name,
      value: provider.providerID,
    })) || [],
    policiesNames: policies?.map(policy => ({
      label: policy.name,
      value: policy.policyID,
    })) || [],
    accessorsNames: mapUniqueAccessors(auditSecrets)
  }), [auditSecrets, providers, policies]);

  const handleSubmit = (data: FilterSchema) => {
    handleFilterChange(data);
    onSubmit(data);
  };

  const handleClear = () => {
    form.reset({
      providerIDs: [],
      policyIDs: [],
      secretIDs: [],
      duplicateIDs: [],
      accessorNames: [],
      policyStatus: "",
      duplicates: "",
      startLastAccess: "",
      endLastAccess: "",
      startLastRotation: "",
      endLastRotation: "",
      accessors: "",
    });

    setResetKey((prev) => prev + 1);
  };

  const filterMinDate = formatDate(new Date(new Date().setDate(new Date().getDate() - 90)), { format: 'isoDateOnlyUTC' }); // 90 days ago
  const filterMaxDate = formatDate(new Date(), { format: 'isoDateOnlyUTC' }); // Current date
  const accessorsValue = form.watch("accessors");
  const duplicatesValue = form.watch("duplicates");

  useEffect(() => {
    if (accessorsValue === "true" || accessorsValue === "false")
      setAccessorsVisible(true);
    else {
      setAccessorsVisible(false);
      form.setValue("accessorNames", [])
    }
  }, [accessorsValue, form]);

  useEffect(() => {
    if (duplicatesValue === "true" || duplicatesValue === "false")
      setDuplicatesVisible(true);
    else {
      setDuplicatesVisible(false);
      form.setValue("duplicateIDs", [])
    }
  }, [duplicatesValue, form]);

  return (
    <DialogContent
      className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(100px,1fr)_auto] grid-cols-[minmax(100%,1fr)]"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle>Filters</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      {isLoadingFilters ? (
        <Loader size="lg" className="h-96 m-auto" />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-4 grid-cols-1">
                {/* Provider Filter */}
                <MultiSelectFilter
                  key={"provider" + resetKey}
                  formControl={form.control}
                  name="providerIDs"
                  label="Providers"
                  options={filterOptions.providersNames}
                  placeholder="Select providers"
                />

                {/* Secret Name Input */}
                <MultiSelectFilter
                  key={"secret_id" + resetKey}
                  formControl={form.control}
                  name="secretIDs"
                  label="Secrets"
                  options={filterOptions.secretsNames}
                  placeholder="Select secrets"
                />

                {/* Policy Input */}
                <MultiSelectFilter
                  key={"policy_id" + resetKey}
                  formControl={form.control}
                  name="policyIDs"
                  label="Policies"
                  options={filterOptions.policiesNames}
                  placeholder="Select policies"
                />

                {/* Policy Status */}
                <BooleanFilter
                  formControl={form.control}
                  name="policyStatus"
                  label="Policy Status"
                  placeholder="Select policy status"
                  trueItem="Compliant"
                  falseItem="Non-Compliant"
                />
              </div>

              <div className="grid gap-4 grid-cols-1">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-2 items-end">
                  {/* Duplicates */}
                  <BooleanFilter
                    formControl={form.control}
                    name="duplicates"
                    label="Duplicates"
                    placeholder="Select duplicates"
                    trueItem="Contains..."
                    falseItem="Does not contain..."
                  />

                  {/* Duplicates specific */}
                  {duplicatesVisible && (
                    <MultiSelectFilter
                      key={"duplicate_id" + resetKey}
                      formControl={form.control}
                      name="duplicateIDs"
                      options={filterOptions.secretsNames}
                      placeholder="Any Duplicate"
                    />
                  )}
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-2 items-end">
                  {/* Accessors */}
                  <BooleanFilter
                    formControl={form.control}
                    name="accessors"
                    label="Accessors"
                    placeholder="Select accessors"
                    trueItem="Contains..."
                    falseItem="Does not contain..."
                  />
                  {/* Accessors specific */}
                  {accessorsVisible && (
                    <MultiSelectFilter
                      key={"accessor_id" + resetKey}
                      formControl={form.control}
                      name="accessorNames"
                      options={filterOptions.accessorsNames}
                      placeholder="Any Accessor"
                    />
                  )}
                </div>

                <DateRangeFilter
                  form={form}
                  names={{
                    start: "startLastAccess",
                    end: "endLastAccess",
                  }}
                  label="Last Access"
                  minDate={filterMinDate}
                  maxDate={filterMaxDate}
                />

                <DateRangeFilter
                  form={form}
                  names={{
                    start: "startLastRotation",
                    end: "endLastRotation",
                  }}
                  label="Last Rotation"
                  minDate={filterMinDate}
                  maxDate={filterMaxDate}
                />
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-4">
              <Button type="button" variant="secondary" onClick={handleClear}>
                Clear
              </Button>
              <Button type="submit">Apply</Button>
            </DialogFooter>
          </form>
        </Form>
      )}
    </DialogContent>
  );
};

export default FilterDialogForm;

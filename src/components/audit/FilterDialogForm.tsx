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
import { MultiSelect } from "../ui/Multi-select";
import { filterSchema, FilterSchema } from "./Audit.interfaces";
import useGetDashboarSecretTable from "@/services/audit/queries/useGetDashboarSecretTable";
import useGetAuditProviders from "@/services/audit/queries/useGetAuditProviders";
import useGetPolicies from "@/services/audit/queries/useGetPolicies";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { IUserData } from "@/types";
import { useMemo, useState, useEffect } from "react";
import { useAuditFilter } from "./AuditFilterProvider";
import { ONE_SECOND_IN_MILLISECONDS } from "@/constants";
import { Loader } from "@/components/ui/Loader";

interface FilterDialogFormProps {
  initialValues: FilterSchema;
  onSubmit: (data: FilterSchema) => void;
  listenerID: string;
}

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
  form: UseFormReturn<FilterSchema>;
  name: Extract<keyof FilterSchema, "lastAccess" | "lastRotation">;
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

const MultiSelectFilter = ({
  formControl,
  name,
  label,
  options,
  placeholder,
}: {
  formControl: Control<FilterSchema>;
  name: Extract<keyof FilterSchema, "providers" | "secretIDs" | "policyIDs">;
  label: string;
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
          variant="inverted"
          maxCount={1}
        />
      </FormItem>
    )}
  />
);

const FilterDialogForm = (
  {
    initialValues,
    onSubmit,
    listenerID,
  }: FilterDialogFormProps
) => {
  const [resetKey, setResetKey] = useState(0);
  const authUser = useAuthUser<IUserData>();
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

  const { data: unfilteredSecretsData, isLoading: isLoadingSecrets } = useGetDashboarSecretTable(
    false,
    listenerID,
    new URLSearchParams(),
    {
      enabled: isFiltersDialogOpen,
      staleTime: 20 * ONE_SECOND_IN_MILLISECONDS,
    }
  );

  const { data: providers, isLoading: isLoadingProviders } = useGetAuditProviders(
    false,
    listenerID,
    {
      enabled: isFiltersDialogOpen,
      staleTime: 20 * ONE_SECOND_IN_MILLISECONDS,
    }
  );

  const { data: policies, isLoading: isLoadingPolicies } = useGetPolicies(
    false,
    authUser?.tenantId || '',
    {
      enabled: isFiltersDialogOpen,
      staleTime: 20 * ONE_SECOND_IN_MILLISECONDS,
    }
  );

  const isLoadingFilters = isLoadingSecrets || isLoadingProviders || isLoadingPolicies;

  // Transform data for filter options
  const filterOptions = useMemo(() => ({
    secretsNames: unfilteredSecretsData?.secretsNames || [],
    providersNames: providers?.map(provider => ({
      label: provider.name,
      value: provider.providerID,
    })) || [],
    policiesNames: policies?.map(policy => ({
      label: policy.name,
      value: policy.policyID,
    })) || []
  }), [unfilteredSecretsData?.secretsNames, providers, policies]);

  const handleSubmit = (data: FilterSchema) => {
    handleFilterChange(data);
    onSubmit(data);
  };

  const handleClear = () => {
    form.reset({
      providers: [],
      policyIDs: [],
      secretIDs: [],
      policyStatus: "",
      duplicates: "",
      lastAccess: "",
      lastRotation: "",
      accessors: "",
    });

    setResetKey((prev) => prev + 1);
  };

  const filterMinDate = new Date(new Date().setDate(new Date().getDate() - 90)).toISOString().split("T")[0] // 90 days ago
  const filterMaxDate = new Date().toISOString().split("T")[0]  // Current date

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
              <div className="grid gap-4">
                {/* Provider Filter */}
                <MultiSelectFilter
                  key={"provider" + resetKey}
                  formControl={form.control}
                  name="providers"
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

                {/* Duplicates */}
                <BooleanFilter
                  formControl={form.control}
                  name="duplicates"
                  label="Duplicates"
                  placeholder="Select duplicates"
                  trueItem="Contains"
                  falseItem="Does not Contain"
                />

                {/* Accessors */}
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
                minDate={filterMinDate}
                maxDate={filterMaxDate}
              />

              <DateFilter
                form={form}
                name="lastRotation"
                label="Last Rotation"
                minDate={filterMinDate}
                maxDate={filterMaxDate}
              />
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

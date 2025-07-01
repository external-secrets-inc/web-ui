import { FieldBase } from "./FieldBase";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { useController } from "react-hook-form";
import useGetEsiSchemaOptionsFromApi from "@/services/esi-schemas/queries/useGetEsiSchemaOptionsFromApi";
import type { AnyOfApiOption } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import { useMemo, useState } from "react";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface FieldMultiSelectProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  options?: MultiSelectOption[];
  placeholder?: string;
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  descriptionInline?: boolean;
  disabled?: boolean;
  // TODO: Add loading, error, emptyMessage props when MultiSelect component supports them

  /**
   * API configuration for fetching options.
   * When provided, options will be fetched from the API instead of using the static `options` prop.
   * The API call is triggered lazily when the user interacts with the component.
   */
  apiOptions?: AnyOfApiOption;
}

export function FieldMultiSelect({
  name,
  label,
  description,
  required,
  rules,
  options = [],
  placeholder = "Select options...",
  defaultValue,
  onValueChange,
  descriptionInline,
  disabled,
  apiOptions,
}: FieldMultiSelectProps) {
  const { field } = useController({
    name,
    rules,
    defaultValue: defaultValue ?? [],
  });

  const [isOpen, setIsOpen] = useState(false);

  const { data: apiData, isLoading: apiLoading } =
    useGetEsiSchemaOptionsFromApi(apiOptions?.href, {
      enabled: !!apiOptions?.href && isOpen,
    });

  const normalizedOptions: MultiSelectOption[] = useMemo(() => {
    if (apiOptions && apiData) {
      return apiData
        .map((item: Record<string, unknown>) => {
          const labelValue = item[apiOptions.labelRef];
          const value =
            typeof labelValue === "string" ? labelValue : String(labelValue);

          if (!value || value.trim() === "") {
            return null;
          }

          return {
            value,
            label: value,
          };
        })
        .filter((option): option is MultiSelectOption => option !== null);
    }

    return Array.isArray(options)
      ? options
          .map((option) => {
            if (typeof option === "string") {
              return { value: option, label: option };
            }
            return option;
          })
          .filter(
            (option) =>
              option &&
              option.value !== null &&
              option.value !== undefined &&
              typeof option.value === "string" &&
              option.value.trim() !== ""
          )
      : [];
  }, [options, apiOptions, apiData]);

  // Handle value transformation - convert between array and comma-separated string
  const handleValueChange = (selectedValues: string[]) => {
    // For anyOf API options, store as comma-separated string for submission
    if (apiOptions) {
      field.onChange(selectedValues.join(","));
    } else {
      // For regular options, keep as array
      field.onChange(selectedValues);
    }
    onValueChange?.(selectedValues);
  };

  // Convert stored value back to array for the MultiSelect component
  const currentValue = apiOptions
    ? typeof field.value === "string"
      ? field.value.split(",").filter(Boolean)
      : []
    : field.value || [];

  return (
    <FieldBase
      name={name}
      label={label}
      description={description}
      required={required}
      rules={rules}
      defaultValue={defaultValue ?? []}
      descriptionInline={descriptionInline}
    >
      <MultiSelect
        options={normalizedOptions}
        onValueChange={handleValueChange}
        defaultValue={currentValue}
        placeholder={apiLoading ? "Loading options..." : placeholder} // TODO[cfviotti]: Use proper inner loading state inside multiselect open content when available
        onOpenChange={(open) => {
          if (open && !isOpen) {
            setIsOpen(true);
          }
        }}
        open={apiLoading ? false : undefined} // TODO: Remove this defer once MultiSelect supports proper loading states - it's REALLY BAD waiting for select to open
        disabled={disabled}
      />
    </FieldBase>
  );
}

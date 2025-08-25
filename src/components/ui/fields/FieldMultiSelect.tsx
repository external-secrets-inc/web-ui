import { FieldBase } from "./FieldBase";
import { EsiSelect } from "@/components/ui/EsiSelect";
import { useController } from "react-hook-form";
import { useMemo, useState } from "react";
import type {
  UISchemaField,
  SelectOption,
  SelectFieldOptions,
} from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import { useGetEsiSchemaOptionsFromApi } from "@/services/esi-schemas/queries/useGetEsiSchemaOptionsFromApi";

/**
 * Prefix used to serialize complex object values into strings for UI components.
 *
 * HTML select/option elements and most UI libraries only accept string values.
 * When we need to store complex objects (like valueRef objects with nested properties),
 * we serialize them to JSON strings with this prefix to distinguish them from
 * regular string values.
 *
 * Example:
 * - Regular string value: "simple-text"
 * - Object value: "__object_value__{\"apiVersion\":\"v1\",\"kind\":\"SecretStore\"}"
 *
 * @see handleValueChange - Deserializes prefixed values back to objects
 * @see currentValues - Serializes current values for UI display
 */
const VALUE_PREFIX = "__object_value__";

export interface FieldMultiSelectProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  options?: SelectFieldOptions;
  placeholder?: string;
  defaultValue?: (string | Record<string, unknown>)[];
  onValueChange?: (value: (string | Record<string, unknown>)[]) => void;
  descriptionInline?: boolean;
  disabled?: boolean;
  field: UISchemaField;
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
  field,
}: FieldMultiSelectProps) {
  const { field: controllerField } = useController({
    name,
    rules,
    defaultValue: defaultValue ?? [],
  });

  const [isOpen, setIsOpen] = useState(false);

  const {
    options: apiOptions,
    isLoading: apiLoading,
  } = useGetEsiSchemaOptionsFromApi(field, {
    enabled: isOpen,
  });

  const normalizedOptions: SelectOption[] = useMemo(() => {
    const allOptions = apiOptions.length > 0 ? apiOptions : options;
    return Array.isArray(allOptions)
      ? allOptions
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
              (typeof option.value === "string"
                ? option.value.trim() !== ""
                : true)
          )
      : [];
  }, [options, apiOptions]);

  /**
   * Handles value changes from the EsiSelect component.
   *
   * Since UI components only work with string values, complex objects are serialized
   * with the VALUE_PREFIX. This function deserializes them back to their original form.
   *
   * @param selectedValues - Array of string values from the EsiSelect component
   * @example
   * // Regular string values
   * handleValueChange(["text1", "text2"]) // → ["text1", "text2"]
   *
   * // Mixed string and serialized object values
   * handleValueChange(["text1", "__object_value__{\"apiVersion\":\"v1\"}"])
   * // → ["text1", {apiVersion: "v1"}]
   */
  const handleValueChange = (selectedValues: string[]) => {
    const finalValues = selectedValues.map((value) => {
      if (value.startsWith(VALUE_PREFIX)) {
        try {
          return JSON.parse(value.substring(VALUE_PREFIX.length));
        } catch {
          return value; // Should not happen
        }
      }
      return value;
    });
    controllerField.onChange(finalValues);
    onValueChange?.(finalValues);
  };

  /**
   * Serialize the current field values for UI display.
   *
   * The EsiSelect component expects string values, so we serialize complex objects
   * with the VALUE_PREFIX to maintain the object structure while being UI-compatible.
   */
  const currentValues = (controllerField.value as (string | Record<string, unknown>)[]).map((v) => {
    if (typeof v === "string") {
      return v;
    }
    return `${VALUE_PREFIX}${JSON.stringify(v)}`;
  });

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
      <EsiSelect
        mode="multiple"
        options={normalizedOptions.map((option) => ({
          ...option,
          /**
           * Serialize option values for UI compatibility.
           *
           * String values are used as-is, while object values are serialized
           * with the VALUE_PREFIX to distinguish them from regular strings.
           */
          value:
            typeof option.value === "string"
              ? option.value
              : `${VALUE_PREFIX}${JSON.stringify(option.value)}`,
        }))}
        onValueChange={handleValueChange}
        defaultValue={currentValues}
        placeholder={apiLoading ? "Loading options..." : placeholder}
        onOpenChange={(open) => {
          if (open && !isOpen) {
            setIsOpen(true);
          }
        }}
        open={apiLoading ? false : undefined}
        disabled={disabled}
      />
    </FieldBase>
  );
}

import type {
  SelectFieldOptions,
  SelectOption,
  UISchemaField,
} from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import { EsiSelect } from "@/components/ui/EsiSelect";
import { Loader } from "@/components/ui/Loader";
import { useGetEsiSchemaOptionsFromApi } from "@/services/esi-schemas/queries/useGetEsiSchemaOptionsFromApi";
import { useMemo, useState } from "react";
import { useController } from "react-hook-form";
import { FieldBase } from "./FieldBase";

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
 * @see stringifiedValue - Serializes current value for UI display
 */
const VALUE_PREFIX = "__object_value__";
const FALLBACK_EMPTY_MESSAGE = "No options available";

export interface FieldSelectProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  options?: SelectFieldOptions;
  placeholder?: string;
  defaultValue?: string;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onValueChange?: (value: string | Record<string, unknown>) => void;
  descriptionInline?: boolean;
  disabled?: boolean;
  field: UISchemaField;
}

export function FieldSelect({
  name,
  label,
  description,
  required,
  rules,
  options = [],
  placeholder = "Select an option...",
  defaultValue,
  loading = false,
  error = null,
  emptyMessage = "",
  onValueChange,
  descriptionInline,
  disabled,
  field,
}: FieldSelectProps) {
  const { field: controllerField } = useController({
    name,
    rules,
    defaultValue: defaultValue ?? "",
  });

  const [isOpen, setIsOpen] = useState(false);

  const {
    options: apiOptions,
    isLoading: apiLoading,
    error: apiError,
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
   * Handles value changes from the Select component.
   *
   * Since UI components only work with string values, complex objects are serialized
   * with the VALUE_PREFIX. This function deserializes them back to their original form.
   *
   * @param value - The string value from the Select component
   * @example
   * // Regular string value
   * handleValueChange("simple-text") // → "simple-text"
   *
   * // Serialized object value
   * handleValueChange("__object_value__{\"apiVersion\":\"v1\"}") // → {apiVersion: "v1"}
   */
  const handleValueChange = (value: string | null) => {
    const v = value ?? "";
    let finalValue: string | Record<string, unknown> = v;
    if (v.startsWith?.(VALUE_PREFIX)) {
      try {
        finalValue = JSON.parse(v.substring(VALUE_PREFIX.length));
      } catch {
        // ignore if parsing fails, should not happen
      }
    }
    controllerField.onChange(finalValue);
    onValueChange?.(finalValue);
  };

  const isLoading = loading || apiLoading;
  const combinedError =
    error || (apiError ? `Failed to load options: ${apiError.message}` : null);

  /**
   * Serialize the current field value for UI display.
   *
   * The Select component expects a string value, so we serialize complex objects
   * with the VALUE_PREFIX to maintain the object structure while being UI-compatible.
   */
  const stringifiedValue =
    typeof controllerField.value === "string"
      ? controllerField.value
      : `${VALUE_PREFIX}${JSON.stringify(controllerField.value)}`;

  const computedEmptyMessage = useMemo(() => {
    if (emptyMessage) return emptyMessage;
    if (field.label) return `No ${field.label} found`;
    return FALLBACK_EMPTY_MESSAGE;
  }, [field.label, emptyMessage]);

  return (
    <FieldBase
      name={name}
      label={label}
      description={description}
      required={required}
      rules={rules}
      defaultValue={defaultValue ?? ""}
      descriptionInline={descriptionInline}
    >
      <EsiSelect
        value={stringifiedValue || null}
        options={normalizedOptions.map((option) => ({
          ...option,
          value:
            typeof option.value === "string"
              ? option.value
              : `${VALUE_PREFIX}${JSON.stringify(option.value)}`,
        }))}
        onValueChange={(v) => handleValueChange(v)}
        placeholder={placeholder}
        onOpenChange={(open) => {
          if (open && !isOpen) {
            setIsOpen(true);
          }
        }}
        disabled={disabled}
        renderListContent={() => {
          if (isLoading) {
            return (
              <div
                className="flex items-center justify-center py-4 text-sm text-muted-foreground"
                aria-busy
              >
                <Loader />
              </div>
            );
          }
          if (combinedError) {
            return (
              <div className="flex items-center justify-center py-4 text-sm text-destructive">
                {combinedError}
              </div>
            );
          }
          return undefined;
        }}
        emptyState={computedEmptyMessage}
      />
    </FieldBase>
  );
}

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldBase } from "./FieldBase";
import { FormControl } from "@/components/ui/form";
import { useController } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { LucideX } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldHeader } from "./FieldHeader";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader } from "@/components/ui/Loader";
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
 * @see stringifiedValue - Serializes current value for UI display
 */
const VALUE_PREFIX = "__object_value__";

export interface FieldSelectProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  options?: SelectFieldOptions;
  placeholder?: string;
  defaultValue?: string;
  allowClear?: boolean;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  customContent?: React.ReactNode;
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
  allowClear = true,
  loading = false,
  error = null,
  emptyMessage = "No options available",
  customContent,
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

  const handleClear = () => {
    controllerField.onChange("");
    onValueChange?.("");
  };

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
  const handleValueChange = (value: string) => {
    let finalValue: string | Record<string, unknown> = value;
    if (value.startsWith(VALUE_PREFIX)) {
      try {
        finalValue = JSON.parse(value.substring(VALUE_PREFIX.length));
      } catch {
        // ignore if parsing fails, should not happen
      }
    }
    controllerField.onChange(finalValue);
    onValueChange?.(finalValue);
  };

  const showClearButton =
    allowClear &&
    controllerField.value &&
    (typeof controllerField.value === "string"
      ? controllerField.value !== ""
      : true);

  const isLoading = loading || apiLoading;
  const combinedError =
    error || (apiError ? `Failed to load options: ${apiError.message}` : null);

  const renderSelectContent = () => {
    if (customContent) {
      return customContent;
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
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

    if (normalizedOptions.length === 0) {
      return (
        <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      );
    }

    const groupedOptions = normalizedOptions.reduce((acc, option) => {
      const groupName = option.group || "Other";
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(option);
      return acc;
    }, {} as Record<string, typeof normalizedOptions>);

    const groupNames = Object.keys(groupedOptions);
    const shouldShowGroups = !(groupNames.length === 1 && groupNames[0] === "Other");

    const renderOptionItem = (option: (typeof normalizedOptions)[number]) => {
      const value =
        typeof option.value === "string"
          ? option.value
          : `${VALUE_PREFIX}${JSON.stringify(option.value)}`;

      return (
        <SelectItem key={value} value={value}>
          {option.label}
        </SelectItem>
      );
    };

    if (!shouldShowGroups) {
      return groupedOptions["Other"].map(renderOptionItem);
    }

    return groupNames.map((groupName) => (
      <SelectGroup key={groupName}>
        <SelectLabel>{groupName}</SelectLabel>
        {groupedOptions[groupName].map(renderOptionItem)}
      </SelectGroup>
    ));
  };

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

  return (
    <FieldBase
      name={name}
      rules={rules}
      defaultValue={defaultValue ?? ""}
      renderCustomLayout
    >
      <>
        <FieldHeader
          label={label}
          description={description}
          required={required}
          descriptionInline={descriptionInline}
        />
        <div className="relative">
          <Select
            name={controllerField.name}
            value={stringifiedValue || ""}
            onValueChange={handleValueChange}
            onOpenChange={(open) => {
              if (open && !isOpen) {
                setIsOpen(true);
              }
            }}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger
                className={cn(showClearButton && "[&>svg]:opacity-0")}
                ref={controllerField.ref}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>{renderSelectContent()}</SelectContent>
          </Select>
          {allowClear && (
            <div className="absolute right-0 top-0 overflow-clip">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-hidden={!showClearButton}
                    disabled={!showClearButton}
                    className={cn(
                      "transition-opacity",
                      !showClearButton
                        ? "animate-out !slide-out-to-right fade-out-0 fill-mode-forwards"
                        : "animate-in slide-in-from-right fade-in-0"
                    )}
                    onClick={handleClear}
                  >
                    <LucideX />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear selection</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </>
    </FieldBase>
  );
}

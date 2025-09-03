import type {
  SelectFieldOptions,
  SelectOption,
  UISchemaField,
} from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import type { EsiSelectRenderContext, Option } from "@/components/ui/EsiSelect";
import { Loader } from "@/components/ui/Loader";
import { useGetEsiSchemaOptionsFromApi } from "@/services/esi-schemas/queries/useGetEsiSchemaOptionsFromApi";
import { useMemo, useState } from "react";

/**
 * Value serialization helpers for string-only inputs.
 *
 * Why: Some UI components (and native selects) only accept string values.
 * We still want to keep rich object values in form state. These helpers
 * allow round‑tripping arbitrary values through a string channel safely.
 *
 * How:
 * - Objects are prefixed + JSON‑encoded
 * - Plain strings are returned as‑is
 * - Decoding restores original values when prefixed, otherwise returns input
 *
 * Use when:
 * - A component mandates string values but your domain state is an object
 *
 * Avoid when:
 * - The component natively supports objects; pass objects directly instead
 */
const PREFIX = "__object_value__";

/** Serialize an arbitrary value into a string for string‑only inputs. */
export function serializeFieldValueToString(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return `${PREFIX}${JSON.stringify(value)}`;
  } catch {
    // If JSON serialization fails, fall back to String() for resilience.
    return String(value);
  }
}

/** Deserialize a string produced by serializeFieldValueToString back to its value. */
export function deserializeFieldValueFromString(s: string): unknown {
  if (!s?.startsWith?.(PREFIX)) return s;
  try {
    return JSON.parse(s.substring(PREFIX.length));
  } catch {
    // If parsing fails, return the original string to avoid throwing in render paths.
    return s;
  }
}

export interface SelectControllerBindings {
  value: unknown;
  onChange: (v: unknown) => void;
  disabled: boolean;
}

/**
 * Shared base logic for all field select hooks.
 * Extracts the 95% of code that's identical between single and multiple modes.
 */
const useFieldSelectBase = (
  field: UISchemaField,
  controller: SelectControllerBindings,
  providedOptions?: SelectFieldOptions,
  providedLoading?: boolean,
  providedError?: string | null
) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasProvidedOptions =
    Array.isArray(providedOptions) && providedOptions.length > 0;
  const {
    options: apiOptions,
    isLoading,
    error,
  } = useGetEsiSchemaOptionsFromApi(field, {
    enabled: isOpen && !hasProvidedOptions,
  });

  const normalizedOptions: SelectOption[] = useMemo(() => {
    const source = hasProvidedOptions ? providedOptions : apiOptions;
    const allOptions = Array.isArray(source) ? source : [];
    return allOptions
      .map((option) =>
        typeof option === "string" ? { value: option, label: option } : option
      )
      .filter(
        (option) =>
          option &&
          option.value !== null &&
          option.value !== undefined &&
          (typeof option.value === "string" ? option.value.trim() !== "" : true)
      );
  }, [apiOptions, providedOptions, hasProvidedOptions]);

  const encodedOptions: Option[] = useMemo(
    () =>
      normalizedOptions.map((option) => ({
        ...option,
        value:
          typeof option.value === "string"
            ? option.value
            : serializeFieldValueToString(option.value),
      })),
    [normalizedOptions]
  );

  const renderListContent: (
    ctx: EsiSelectRenderContext
  ) => React.ReactNode = () => {
    const currentLoading = providedLoading ?? isLoading;
    const currentError = providedError ?? error;

    if (currentLoading) {
      return (
        <div
          className="flex items-center justify-center py-4 text-sm text-muted-foreground"
          aria-busy
        >
          <Loader />
        </div>
      );
    }
    if (currentError) {
      return (
        <div className="flex items-center justify-center py-4 text-sm text-destructive">
          {typeof currentError === "string"
            ? currentError
            : "Failed to load options"}
        </div>
      );
    }
    return undefined;
  };

  const baseCommonProps = {
    options: encodedOptions,
    disabled: controller.disabled,
    onOpenChange: (open: boolean) => {
      if (open && !isOpen) setIsOpen(true);
    },
    renderListContent,
    emptyState: "No options available",
  };

  return {
    apiOptions,
    normalizedOptions,
    isLoading,
    error,
    isOpen,
    setIsOpen,
    baseCommonProps,
  };
};

/**
 * Single-select field data hook.
 */
export const useFieldSelectData = (
  field: UISchemaField,
  controller: SelectControllerBindings,
  providedOptions?: SelectFieldOptions,
  providedLoading?: boolean,
  providedError?: string | null
) => {
  const base = useFieldSelectBase(
    field,
    controller,
    providedOptions,
    providedLoading,
    providedError
  );

  const stringifiedValue =
    controller.value == null
      ? ""
      : typeof controller.value === "string"
      ? controller.value
      : serializeFieldValueToString(controller.value);

  const handleValueChange = (value: string | null) => {
    const decoded =
      value == null
        ? ""
        : (deserializeFieldValueFromString(value) as
            | string
            | Record<string, unknown>);
    controller.onChange(decoded);
  };

  return {
    ...base,
    stringifiedValue,
    handleValueChange,
    commonProps: {
      ...base.baseCommonProps,
      value: stringifiedValue || null,
      onValueChange: handleValueChange,
      placeholder: "Select an option...",
    },
  };
};

/**
 * Multi-select field data hook.
 */
export const useFieldMultiSelectData = (
  field: UISchemaField,
  controller: SelectControllerBindings,
  providedOptions?: SelectFieldOptions,
  providedLoading?: boolean,
  providedError?: string | null
) => {
  const base = useFieldSelectBase(
    field,
    controller,
    providedOptions,
    providedLoading,
    providedError
  );

  const rawValues = Array.isArray(controller.value)
    ? (controller.value as (string | Record<string, unknown>)[])
    : [];
  const currentValues = rawValues.map((v) =>
    typeof v === "string" ? v : serializeFieldValueToString(v)
  );

  const handleValueChange = (selectedValues: string[]) => {
    const finalValues = selectedValues.map((v) =>
      deserializeFieldValueFromString(v)
    ) as (string | Record<string, unknown>)[];
    controller.onChange(finalValues);
  };

  return {
    ...base,
    currentValues,
    handleValueChange,
    commonProps: {
      ...base.baseCommonProps,
      mode: "multiple" as const,
      value: currentValues,
      onValueChange: handleValueChange,
      placeholder: "Select options...",
    },
  };
};

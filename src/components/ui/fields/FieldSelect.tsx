import type {
  SelectFieldOptions,
  UISchemaField,
} from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import { useFieldRendererElement } from "@/components/EsiSchemaForm/renderers/rendererRegistry";
import { EsiSelect } from "@/components/ui/EsiSelect";
import { useMemo } from "react";
import { useController } from "react-hook-form";
import { FieldBase } from "./FieldBase";
import {
  deserializeFieldValueFromString,
  serializeFieldValueToString,
  useFieldSelectData,
} from "./fields.utils";

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
  emptyMessage?: string;
  onValueChange?: (value: string | Record<string, unknown>) => void;
  descriptionInline?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
  field: UISchemaField;
}

export function FieldSelect({
  name,
  label,
  description,
  required,
  rules,
  placeholder = "Select an option...",
  options,
  defaultValue,
  emptyMessage = "",
  onValueChange,
  descriptionInline,
  disabled,
  loading,
  error,
  field,
}: FieldSelectProps) {
  const { field: controllerField } = useController({
    name,
    rules,
    defaultValue: defaultValue ?? "",
  });

  const { commonProps, apiOptions } = useFieldSelectData(
    field,
    {
      value: controllerField.value,
      onChange: (v) => {
        controllerField.onChange(v);
        onValueChange?.(v as string | Record<string, unknown>);
      },
      disabled: !!disabled,
    },
    options,
    loading,
    error
  );

  const customRenderer = useFieldRendererElement({
    field,
    controller: {
      value: controllerField.value,
      onChange: (v) => {
        controllerField.onChange(v);
        onValueChange?.(v as string | Record<string, unknown>);
      },
      disabled: !!disabled,
      name,
    },
    data: { apiOptions: (options ?? apiOptions) as unknown[] },
    utils: { serializeFieldValueToString, deserializeFieldValueFromString },
  });

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
      {customRenderer ? (
        customRenderer
      ) : (
        <EsiSelect
          {...commonProps}
          placeholder={placeholder}
          emptyState={computedEmptyMessage}
        />
      )}
    </FieldBase>
  );
}

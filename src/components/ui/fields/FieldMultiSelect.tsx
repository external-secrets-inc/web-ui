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
  useFieldMultiSelectData,
} from "./fields.utils";

const FALLBACK_EMPTY_MESSAGE = "No options available";

export interface FieldMultiSelectProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  placeholder?: string;
  options?: SelectFieldOptions;
  defaultValue?: (string | Record<string, unknown>)[];
  emptyMessage?: string;
  onValueChange?: (value: (string | Record<string, unknown>)[]) => void;
  descriptionInline?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
  field: UISchemaField;
}

export function FieldMultiSelect({
  name,
  label,
  description,
  required,
  rules,
  placeholder = "Select options...",
  options,
  defaultValue,
  emptyMessage = "",
  onValueChange,
  descriptionInline,
  disabled,
  loading,
  error,
  field,
}: FieldMultiSelectProps) {
  const { field: controllerField } = useController({
    name,
    rules,
    defaultValue: defaultValue ?? [],
  });

  const { commonProps, apiOptions } = useFieldMultiSelectData(
    field,
    {
      value: controllerField.value,
      onChange: (v: unknown) => {
        controllerField.onChange(v);
        onValueChange?.(v as (string | Record<string, unknown>)[]);
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
        onValueChange?.(v as (string | Record<string, unknown>)[]);
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
      defaultValue={defaultValue ?? []}
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

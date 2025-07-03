import type { UISchemaField } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import { createFieldValidation } from "@/components/EsiSchemaForm/EsiSchemaForm.utils";
import { FieldText } from "./FieldText";
import { FieldTextarea } from "./FieldTextarea";
import { FieldSelect } from "./FieldSelect";
import { FieldBoolean } from "./FieldBoolean";
import { FieldKeyValue } from "./FieldKeyValue";
import { FieldArray } from "./FieldArray";
import { FieldObject } from "./FieldObject";
import { FieldJson } from "./FieldJson";
import { FieldOneOf } from "./FieldOneOf";
import { FieldSecretSelect } from "./FieldSecretSelect";
import { FieldMultiSelect } from "./FieldMultiSelect";
import { FieldDuration } from "./FieldDuration";
import { FieldDateTime } from "./FieldDateTime";
import { FieldNumber } from "./FieldNumber";
import { OptionUtils } from "@/components/EsiSchemaForm/EsiSchemaForm.utils";

export interface FieldRendererProps {
  field: UISchemaField;
}

export function FieldRenderer({ field }: FieldRendererProps) {
  const baseProps = {
    name: field.id,
    label: field.label,
    description: field.description,
    required: field.required,
    rules: createFieldValidation(field),
    disabled: field.readOnly,
  };

  switch (field.type) {
    case "text":
      return (
        <FieldText
          {...baseProps}
          minLength={field.minLength}
          maxLength={field.maxLength}
          pattern={field.pattern}
          defaultValue={field.default as string}
        />
      );

    case "textarea":
      return (
        <FieldTextarea {...baseProps} defaultValue={field.default as string} />
      );

    case "select": {
      const apiOption = OptionUtils.getOneOfApiOption(field);
      if (apiOption) {
        return (
          <FieldSelect
            {...baseProps}
            defaultValue={field.default as string}
            apiOptions={apiOption}
          />
        );
      }

      if (field.oneOf && field.oneOf.length > 0) {
        return <FieldOneOf {...baseProps} field={field} />;
      }

      return (
        <FieldSelect
          {...baseProps}
          options={field.options ?? []}
          defaultValue={field.default as string}
        />
      );
    }

    case "checkbox":
      // For checkbox fields, we still pass the rules to FieldBoolean
      // The component will handle boolean validation correctly while preserving custom rules
      return (
        <FieldBoolean
          {...baseProps}
          defaultValue={field.default as boolean}
        />
      );

    case "key-value":
      return (
        <FieldKeyValue
          {...baseProps}
          defaultValue={field.default as Array<{ key: string; value: string }>}
        />
      );

    case "number":
      return (
        <FieldNumber
          {...baseProps}
          min={field.minimum}
          max={field.maximum}
          defaultValue={field.default as number}
        />
      );

    case "array":
      return (
        <FieldArray
          {...baseProps}
          field={field}
          defaultValue={field.default as unknown[]}
        />
      );

    case "object":
      // Handle oneOf constraint for object fields TODO[cfviotti]: This is supposedly for legacy schemas. It will always be for `select` fields now instead.
      if (field.oneOf && field.oneOf.length > 0) {
        return <FieldOneOf {...baseProps} field={field} />;
      }
      return (
        <FieldObject
          {...baseProps}
          field={field}
          defaultValue={field.default as Record<string, unknown>}
        />
      );

    case "json":
      return <FieldJson {...baseProps} defaultValue={field.default} />;

    case "one-of":
      return <FieldOneOf {...baseProps} field={field} />;

    case "secret-selector":
      return <FieldSecretSelect {...baseProps} />;

    case "multi-select": {
      const apiOption = OptionUtils.getAnyOfApiOption(field);
      if (apiOption) {
        return (
          <FieldMultiSelect
            {...baseProps}
            apiOptions={apiOption}
            defaultValue={field.default as string[]}
          />
        );
      }

      return (
        <FieldMultiSelect
          {...baseProps}
          options={(field.options ?? []).map((opt) =>
            typeof opt === "string" ? { label: opt, value: opt } : opt
          )}
          defaultValue={field.default as string[]}
        />
      );
    }

    case "duration":
      return <FieldDuration {...baseProps} />;

    case "datetime":
      return <FieldDateTime {...baseProps} />;

    case "service-account-selector":
      return (
        <div className="p-4 border border-orange-200 bg-orange-50 rounded-md">
          <p className="text-sm text-orange-700">
            Field type "{field.type}" is not yet implemented.
          </p>
          <p className="text-xs text-orange-600 mt-1">Field: {field.id}</p>
        </div>
      );

    default:
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded-md">
          <p className="text-sm text-red-700">
            Unknown field type: {field.type}
          </p>
          <p className="text-xs text-red-600 mt-1">Field: {field.id}</p>
        </div>
      );
  }
}

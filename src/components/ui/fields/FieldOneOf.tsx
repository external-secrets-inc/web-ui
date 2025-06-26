import type { UISchemaField } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { FieldBase } from "./FieldBase";
import { FieldRenderer } from "./FieldRenderer";
import { FieldSelect, SelectOption } from "./FieldSelect";

export interface FieldOneOfProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  field: UISchemaField;
  defaultValue?: string;
}

export function FieldOneOf({
  name,
  label,
  description,
  required,
  rules,
  field,
  defaultValue,
}: FieldOneOfProps) {
  const { setValue, getValues } = useFormContext();

  const getPropertyName = useCallback((id: string) => {
    if (!id || typeof id !== "string") return "";
    const parts = id.split(".");
    return parts[parts.length - 1] || "";
  }, []);

  const oneOfFields = useMemo(() => {
    if (
      !field.oneOf ||
      !Array.isArray(field.oneOf) ||
      !field.fields ||
      !Array.isArray(field.fields)
    ) {
      return [];
    }

    return field.fields.filter((f) => {
      return f && f.id && field.oneOf?.includes(f.id);
    });
  }, [field.oneOf, field.fields]);

  const [selectedFieldId, setSelectedFieldId] = useState<string>(() => {
    if (!oneOfFields || oneOfFields.length === 0) return "";

    try {
      const existingValueField = oneOfFields.find((f) => {
        if (!f || !f.id) return false;
        const propertyName = getPropertyName(f.id);
        if (!propertyName) return false;
        const value = getValues(`${name}.${propertyName}`);
        return value !== undefined && value !== null;
      });
      return existingValueField?.id || "";
    } catch (error) {
      console.warn("Error finding existing value field:", error);
      return "";
    }
  });

  const selectedField = useMemo(() => {
    if (!selectedFieldId || !oneOfFields) return undefined;
    return oneOfFields.find((f) => f && f.id === selectedFieldId);
  }, [selectedFieldId, oneOfFields]);

  useEffect(() => {
    if (!oneOfFields || oneOfFields.length === 0) return;

    try {
      oneOfFields.forEach((oneOfField) => {
        if (!oneOfField || !oneOfField.id || oneOfField.id === selectedFieldId)
          return;

        const propertyName = getPropertyName(oneOfField.id);
        if (!propertyName) return;

        setValue(`${name}.${propertyName}`, undefined, {
          shouldValidate: true,
        });
      });
    } catch (error) {
      console.warn("Error clearing form values:", error);
    }
  }, [selectedFieldId, name, oneOfFields, setValue, getPropertyName]);

  const handleSelectionChange = useCallback((value: string) => {
    if (!value || typeof value !== "string") {
      if (selectedField && selectedField.id) {
        const propertyName = getPropertyName(selectedField.id);
        if (propertyName) {
          setValue(`${name}.${propertyName}`, undefined, {
            shouldValidate: true,
          });
        }
      }
      setSelectedFieldId("");
      return;
    }
    setSelectedFieldId(value);
  }, [selectedField, getPropertyName, setValue, name]);

  const selectionFieldName = `${name}.__selection`;
  const { field: selectionField } = useController({
    name: selectionFieldName,
    defaultValue: selectedFieldId || "",
  });

  const validOneOfFields = useMemo(() => {
    return oneOfFields.filter((f) => f && f.id && f.label);
  }, [oneOfFields]);

  const selectOptions: SelectOption[] = useMemo(() => {
    return validOneOfFields.map((oneOfField) => ({
      value: oneOfField.id || "",
      label: oneOfField.label || oneOfField.id || "Unknown",
    }));
  }, [validOneOfFields]);

  if (!validOneOfFields || validOneOfFields.length === 0) {
    return (
      <Alert variant="warning">
        <AlertTitle>No valid options available for this field.</AlertTitle>
        <AlertDescription>Field: {field.id}</AlertDescription>
      </Alert>
    );
  }

  return (
    <FieldBase
      name={selectionFieldName}
      defaultValue={defaultValue ?? ""}
      renderCustomLayout
      rules={rules}
      hideMessage
    >
      <>
        <div className="space-y-6">
          <FieldSelect
            name={selectionFieldName}
            label={label}
            description={description}
            required={required}
            options={selectOptions}
            placeholder="Select an option..."
            defaultValue={selectedFieldId || ""}
            onValueChange={(value) => {
              handleSelectionChange(value);
              selectionField.onChange(value);
            }}
            emptyMessage="No valid options available for this field."
          />

          {selectedField && selectedField.id && (
            <div className="mt-4">
              <FieldRenderer
                key={selectedField.id}
                field={{
                  ...selectedField,
                  id: `${name}.${getPropertyName(selectedField.id)}`,
                }}
              />
            </div>
          )}
        </div>
      </>
    </FieldBase>
  );
}

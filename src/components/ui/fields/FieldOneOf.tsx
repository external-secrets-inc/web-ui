import type { UISchemaField } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import { OneOfUtils } from "@/components/EsiSchemaForm/EsiSchemaForm.utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FieldRenderer } from "./FieldRenderer";
import { FieldSelect, SelectOption } from "./FieldSelect";

export interface FieldOneOfProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  field: UISchemaField;
  descriptionInline?: boolean;
}

export function FieldOneOf({
  name,
  label,
  description,
  required,
  rules,
  field,
  descriptionInline,
}: FieldOneOfProps) {
  const { setValue, getValues } = useFormContext();

  const getPropertyName = useCallback((id: string) => {
    if (!id || typeof id !== "string") return "";
    const parts = id.split(".");
    return parts[parts.length - 1] || "";
  }, []);

  const oneOfFields = useMemo(() => {
    if (!field.oneOf || !Array.isArray(field.oneOf) || !field.fields || !Array.isArray(field.fields)) {
      return [];
    }

    // Handle new object format - only process static options for now
    const staticOptions = field.oneOf.filter(OneOfUtils.isStaticOption);
    return field.fields.filter((f) => {
      if (!f || !f.id) return false;
      return staticOptions.some(option => option.id === f.id);
    });
  }, [field.oneOf, field.fields]);

  const [selectedFieldId, setSelectedFieldId] = useState<string>(() => {
    if (!oneOfFields || oneOfFields.length === 0) return "";

    try {
      // First, check if there's an existing form value
      const existingValueField = oneOfFields.find((f) => {
        if (!f || !f.id) return false;
        const propertyName = getPropertyName(f.id);
        if (!propertyName) return false;
        const value = getValues(`${name}.${propertyName}`);
        return value !== undefined && value !== null;
      });

      if (existingValueField?.id) {
        return existingValueField.id;
      }

      // If no existing value, check for schema default
      if (field.default && typeof field.default === "string") {
        const defaultFieldExists = oneOfFields.some(f => f?.id === field.default);
        if (defaultFieldExists) {
          return field.default;
        }
      }

      return "";
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

  const selectionFieldName = `${name}.__ui_state`;

  // Initialize UI state field with selected field ID
  useEffect(() => {
    if (selectedFieldId) {
      setValue(selectionFieldName, selectedFieldId, { shouldValidate: false });
    }
  }, [selectedFieldId, selectionFieldName, setValue]);

  const validOneOfFields = useMemo(() => {
    return oneOfFields.filter((f) => f && f.id && f.label);
  }, [oneOfFields]);

  const selectOptions: SelectOption[] = useMemo(() => {
    return validOneOfFields.map((oneOfField) => ({
      value: oneOfField.id || "",
      label: oneOfField.label || oneOfField.id || "Unknown",
    }));
  }, [validOneOfFields]);

  // Check if there are API options that need special handling
  const hasApiOptions = useMemo(() => {
    if (!field.oneOf) return false;
    return field.oneOf.some(OneOfUtils.isApiOption);
  }, [field.oneOf]);

  if (hasApiOptions) {
    return (
      <Alert variant="warning">
        <AlertTitle>API oneOf options not yet implemented</AlertTitle>
        <AlertDescription>
          This field uses API options (href/labelRef) which are not yet supported.
          Field: {field.id}
        </AlertDescription>
      </Alert>
    );
  }

  if (!validOneOfFields || validOneOfFields.length === 0) {
    return (
      <Alert variant="warning">
        <AlertTitle>No valid options available for this field.</AlertTitle>
        <AlertDescription>Field: {field.id}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <FieldSelect
        name={selectionFieldName}
        label={label}
        description={description}
        required={required}
        options={selectOptions}
        placeholder="Select an option..."
        defaultValue={selectedFieldId || ""}
        onValueChange={handleSelectionChange}
        emptyMessage="No valid options available for this field."
        descriptionInline={descriptionInline}
        rules={rules}
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
  );
}

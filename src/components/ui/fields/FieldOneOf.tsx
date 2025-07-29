import type {
  UISchemaField,
  OneOfStaticOption,
  SelectOption,
} from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FieldRenderer } from "./FieldRenderer";
import { FieldSelect } from "./FieldSelect";
import { isFieldVisible } from "@/components/EsiSchemaForm";

export interface FieldOneOfProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  field: UISchemaField;
  descriptionInline?: boolean;
  disabled?: boolean;
  formValues: Record<string, unknown>;
}

export function FieldOneOf({
  name,
  label,
  description,
  required,
  rules,
  field,
  descriptionInline,
  disabled,
  formValues,
}: FieldOneOfProps) {
  const { setValue, getValues } = useFormContext();

  const getPropertyName = useCallback((id: string) => {
    if (!id || typeof id !== "string") return "";
    const parts = id.split(".");
    return parts[parts.length - 1] || "";
  }, []);

  const oneOfFields = useMemo(() => {
    if (!field.oneOf || !field.fields) {
      return [];
    }
    const validOptionIds = field.oneOf.map(
      (option) => (option as OneOfStaticOption).id
    );
    return field.fields.filter(
      (f) => f && f.id && validOptionIds.includes(f.id)
    );
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

  const handleSelectionChange = useCallback((value: string | Record<string, unknown>) => {
    const stringValue = typeof value === 'string' ? value : '';
    if (!stringValue) {
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
    setSelectedFieldId(stringValue);
  }, [selectedField, getPropertyName, setValue, name]);

  const uiSelectionFieldName = `${name}.__ui_state`;

  // Initialize UI state field with selected field ID
  useEffect(() => {
    if (selectedFieldId) {
      setValue(uiSelectionFieldName, selectedFieldId, { shouldValidate: false });
    }
  }, [selectedFieldId, uiSelectionFieldName, setValue]);

    const resolveFieldName = useCallback((selectedFieldId: string, baseFieldName: string): string => {
    // Check if the selected option has skipNesting: true
    const selectedOption = field.oneOf?.find(option =>
      typeof option === 'object' && 'id' in option && option.id === selectedFieldId
    );

    const shouldSkipNesting = selectedOption &&
      'skipNesting' in selectedOption &&
      selectedOption.skipNesting === true;

    // If skipNesting is true, add __skip_nesting to make it get filtered out
    // and the value will be promoted up one level during transformation
    if (shouldSkipNesting) {
      return `${name}.__skip_nesting`;
    }

    // Otherwise, use the nested pattern
    return baseFieldName;
  }, [field.oneOf, name]);

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
    <div className="space-y-6">
      <FieldSelect
        name={uiSelectionFieldName}
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
        disabled={disabled}
        field={field}
      />

      {selectedField && selectedField.id && isFieldVisible(selectedField.visibleWhen, formValues) && (
        <div className="mt-4">
          <FieldRenderer
            key={selectedField.id}
            field={{
              ...selectedField,
              id: resolveFieldName(selectedField.id, `${name}.${getPropertyName(selectedField.id)}`),
              readOnly: selectedField.readOnly,
            }}
            formValues={formValues}
          />
        </div>
      )}
    </div>
  );
}

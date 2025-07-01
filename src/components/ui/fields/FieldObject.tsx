import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FieldBase } from './FieldBase';
import { FieldRenderer } from './FieldRenderer';
import { FieldHeader } from './FieldHeader';
import type { UISchemaField } from '@/components/EsiSchemaForm/EsiSchemaForm.interfaces';

export interface FieldObjectProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  field: UISchemaField;
  defaultValue?: Record<string, unknown>;
  rules?: Record<string, unknown>;
  descriptionInline?: boolean;
  disabled?: boolean;
}

export function FieldObject({
  name,
  label,
  description,
  required,
  field,
  defaultValue,
  rules,
  descriptionInline = true,
  disabled,
}: FieldObjectProps) {
  const { setValue, getValues, formState } = useFormContext();
  const error = !!formState.errors[name];

  // Apply default values when component mounts (if not already set)
  useEffect(() => {
    if (defaultValue && typeof defaultValue === 'object') {
      const currentValue = getValues(name);

      // Only apply defaults if field is currently empty/undefined
      if (!currentValue) {
        setValue(name, defaultValue);
      }
    }
  }, [defaultValue, name, setValue, getValues]);

  return (
    <FieldBase
      name={name}
      defaultValue={defaultValue ?? {}}
      renderCustomLayout
      rules={rules}
      className="[&:not(:first-of-type)]:!mt-10"
      hideMessage
    >
      <>
        <FieldHeader
          label={label}
          description={description}
          required={required}
          labelAsText
          descriptionInline={descriptionInline}
          error={error}
        />
        <div className="pl-3 pt-4 border-l border-border space-y-6" data-nested-group>
          {field.fields && field.fields.length > 0 ? (
            field.fields.map((subField) => {
              const propertyName = subField.id.split('.').pop() || subField.id;
              const dynamicId = `${name}.${propertyName}`;

              return (
                <FieldRenderer
                  key={dynamicId}
                  field={{ ...subField, id: dynamicId, readOnly: disabled || subField.readOnly }}
                />
              );
            })
          ) : (
            <div className="text-sm text-gray-500 italic">
              No additional fields needed to be configured 🥳
            </div>
          )}
        </div>
      </>
    </FieldBase>
  );
}

import { FieldBase } from './FieldBase';
import { CodeTextarea } from '@/components/ui/CodeTextarea';
import { useController } from 'react-hook-form';

export interface FieldJsonProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  defaultValue?: unknown;
  descriptionInline?: boolean;
  disabled?: boolean;
}

export function FieldJson({
  name,
  label,
  description,
  required,
  rules,
  defaultValue,
  descriptionInline,
  disabled
}: FieldJsonProps) {
  const { field } = useController({
    name,
    rules,
    defaultValue: defaultValue ?? ""
  });

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
      <CodeTextarea
        language="json"
        placeholder={`{\n  "key": "value"\n}`}
        className="min-h-[120px]"
        disabled={disabled}
        value={typeof field.value === 'object' && field.value !== null
          ? JSON.stringify(field.value, null, 2)
          : (field.value || '')
        }
        onChange={(e) => {
          const stringValue = e.target.value;
          if (stringValue === '') {
            field.onChange(undefined);
            return;
          }
          try {
            const jsonValue = JSON.parse(stringValue);
            field.onChange(jsonValue);
          } catch {
            field.onChange(stringValue);
          }
        }}
        onBlur={field.onBlur}
      />
    </FieldBase>
  );
}
import { FieldBase } from './FieldBase';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { useController } from 'react-hook-form';

export interface FieldMultiSelectProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  options: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: string[];
}

export function FieldMultiSelect({
  name,
  label,
  description,
  required,
  rules,
  options,
  placeholder,
  defaultValue
}: FieldMultiSelectProps) {
  const { field } = useController({
    name,
    rules,
    defaultValue: defaultValue ?? []
  });

  return (
    <FieldBase
      name={name}
      label={label}
      description={description}
      required={required}
      rules={rules}
      defaultValue={defaultValue ?? []}
    >
      <MultiSelect
        options={options}
        onValueChange={field.onChange}
        value={field.value || []}
        placeholder={placeholder}
      />
    </FieldBase>
  );
}
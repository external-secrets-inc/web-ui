import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { FieldBase } from './FieldBase';
import { useController } from 'react-hook-form';
import type { ComponentPropsWithoutRef } from 'react';

export interface FieldNumberProps extends Omit<ComponentPropsWithoutRef<typeof Input>, 'name' | 'type'> {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  defaultValue?: number;
  descriptionInline?: boolean;
}

export const FieldNumber = forwardRef<HTMLInputElement, FieldNumberProps>(
  ({ name, label, description, required, rules, defaultValue, descriptionInline, ...inputProps }, ref) => {
    const { field } = useController({
      name,
      rules,
      defaultValue: defaultValue ?? undefined
    });

    // Transform the value to handle empty/invalid states
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (value === "" || value === null || value === undefined) {
        field.onChange(undefined);
      } else {
        const numValue = parseFloat(value);
        field.onChange(isNaN(numValue) ? undefined : numValue);
      }
    };

    return (
      <FieldBase
        name={name}
        label={label}
        description={description}
        required={required}
        rules={rules}
        defaultValue={defaultValue ?? undefined}
        descriptionInline={descriptionInline}
      >
        <Input
          {...field}
          {...inputProps}
          ref={ref}
          type="number"
          value={field.value ?? ""}
          onChange={handleChange}
        />
      </FieldBase>
    );
  }
);

FieldNumber.displayName = 'FieldNumber';

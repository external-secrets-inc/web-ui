import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { FieldBase } from './FieldBase';
import { useController } from 'react-hook-form';
import type { ComponentPropsWithoutRef } from 'react';

export interface FieldTextProps extends Omit<ComponentPropsWithoutRef<typeof Input>, 'name'> {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  defaultValue?: string | number;
  descriptionInline?: boolean;
  disabled?: boolean;
}

export const FieldText = forwardRef<HTMLInputElement, FieldTextProps>(
  ({ name, label, description, required, rules, defaultValue, disabled, descriptionInline, ...inputProps }, ref) => {
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
        <Input
          {...field}
          {...inputProps}
          ref={ref}
          disabled={disabled}
        />
      </FieldBase>
    );
  }
);

FieldText.displayName = 'FieldText';
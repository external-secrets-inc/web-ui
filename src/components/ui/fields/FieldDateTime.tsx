import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { FieldBase } from './FieldBase';
import { useController } from 'react-hook-form';
import type { ComponentPropsWithoutRef } from 'react';

export interface FieldDateTimeProps extends Omit<ComponentPropsWithoutRef<typeof Input>, 'name' | 'type'> {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  defaultValue?: string;
  descriptionInline?: boolean;
}

export const FieldDateTime = forwardRef<HTMLInputElement, FieldDateTimeProps>(
  ({ name, label, description, required, rules, defaultValue, descriptionInline, ...inputProps }, ref) => {
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
          {...inputProps}
          {...field}
          ref={ref}
          type="datetime-local"
        />
      </FieldBase>
    );
  }
);

FieldDateTime.displayName = 'FieldDateTime';
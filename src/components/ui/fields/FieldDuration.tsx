import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { FieldBase } from './FieldBase';
import { useController } from 'react-hook-form';
import type { ComponentPropsWithoutRef } from 'react';

export interface FieldDurationProps extends Omit<ComponentPropsWithoutRef<typeof Input>, 'name'> {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  defaultValue?: string;
  descriptionInline?: boolean;
  disabled?: boolean;
}

export const FieldDuration = forwardRef<HTMLInputElement, FieldDurationProps>(
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
        description={description || 'Format: 1d2h30m15s (days, hours, minutes, seconds)'}
        required={required}
        rules={rules}
        defaultValue={defaultValue ?? ""}
        descriptionInline={descriptionInline}
      >
        <Input
          {...inputProps}
          {...field}
          ref={ref}
          placeholder="e.g., 1d2h30m15s"
          disabled={disabled}
        />
      </FieldBase>
    );
  }
);

FieldDuration.displayName = 'FieldDuration';
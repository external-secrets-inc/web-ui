import { forwardRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { FieldBase } from './FieldBase';
import { useController } from 'react-hook-form';
import type { ComponentPropsWithoutRef } from 'react';

export interface FieldTextareaProps extends Omit<ComponentPropsWithoutRef<typeof Textarea>, 'name'> {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  defaultValue?: string;
}

export const FieldTextarea = forwardRef<HTMLTextAreaElement, FieldTextareaProps>(
  ({ name, label, description, required, rules, defaultValue, ...textareaProps }, ref) => {
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
      >
        <Textarea
          {...textareaProps}
          {...field}
          ref={ref}
        />
      </FieldBase>
    );
  }
);

FieldTextarea.displayName = 'FieldTextarea';
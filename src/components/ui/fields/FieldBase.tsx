import { ReactElement } from 'react';
import {
  useFormContext,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { FieldHeader } from './FieldHeader';
import { cn } from '@/lib/utils';

interface BaseProps {
  name: string;
  rules?: Record<string, unknown>;
  defaultValue?: unknown;
  children: ReactElement;
  className?: string;
  hideMessage?: boolean;
}

interface WithStandardLayout extends BaseProps {
  renderCustomLayout?: false;
  label: string;
  description?: string;
  required?: boolean;
  descriptionInline?: boolean;
}

interface WithCustomLayout extends BaseProps {
  renderCustomLayout: true;
}

export type FieldBaseProps = WithStandardLayout | WithCustomLayout;

export function FieldBase(props: FieldBaseProps) {
  const { name, rules, defaultValue, children, className, hideMessage } = props;
  const { control } = useFormContext();

  if (props.renderCustomLayout) {
    return (
      <FormField
        control={control}
        name={name as FieldPath<FieldValues>}
        rules={rules}
        defaultValue={defaultValue}
        render={() => (
          <FormItem className={cn(className)} data-field="">
            {children}
            {!hideMessage && <FormMessage />}
          </FormItem>
        )}
      />
    );
  }

  const { label, description, required, descriptionInline } = props;
  return (
    <FormField
      control={control}
      name={name as FieldPath<FieldValues>}
      rules={rules}
      defaultValue={defaultValue}
      render={() => (
        <FormItem className={cn(className)} data-field="">
          <FieldHeader
            label={label}
            description={description}
            required={required}
            descriptionInline={descriptionInline}
          />
          <FormControl>{children}</FormControl>
          {!hideMessage && <FormMessage />}
        </FormItem>
      )}
    />
  );
}
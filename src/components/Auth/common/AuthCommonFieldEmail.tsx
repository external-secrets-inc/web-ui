import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputHTMLAttributes, RefObject } from "react";
import { Control, FieldValues, Path } from "react-hook-form";

interface AuthCommonFieldEmailProps<T extends FieldValues> extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  inputRef?: RefObject<HTMLInputElement>;
}

export function AuthCommonFieldEmail<T extends FieldValues>({
  control,
  name,
  label = "Email",
  inputRef,
  ...props
}: AuthCommonFieldEmailProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...props}
              type="email"
              value={String(field.value || '')}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              disabled={field.disabled}
              autoCapitalize="none"
              ref={inputRef || field.ref}
              placeholder="you@yourcompany.com"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import InputPassword from "@/components/ui/InputPassword";
import { InputHTMLAttributes, RefObject } from "react";
import { Control, FieldValues, Path } from "react-hook-form";

interface AuthCommonFieldNewPasswordProps<T extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type"> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  inputRef?: RefObject<HTMLInputElement>;
  submittedWithErrors?: boolean;
}

export function AuthCommonFieldNewPassword<T extends FieldValues>({
  control,
  name,
  label = "Password",
  inputRef,
  submittedWithErrors = false,
  ...props
}: AuthCommonFieldNewPasswordProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <InputPassword
              {...props}
              value={field.value as string}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              disabled={field.disabled}
              ref={inputRef || field.ref}
              newPasswordChecks
              showValidationErrors={submittedWithErrors}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

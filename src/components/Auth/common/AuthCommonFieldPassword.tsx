import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import InputPassword from "@/components/ui/InputPassword";
import { InputHTMLAttributes, RefObject } from "react";
import { Control, FieldValues, Path, useFormContext } from "react-hook-form";
import { Link } from "react-router-dom";

interface AuthCommonFieldPasswordProps<T extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type"> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  inputRef?: RefObject<HTMLInputElement>;
  newPasswordChecks?: boolean;
  showValidationErrors?: boolean;
  withForgotPassword?: boolean;
}

export function AuthCommonFieldPassword<T extends FieldValues>({
  control,
  name,
  label = "Password",
  inputRef,
  newPasswordChecks,
  showValidationErrors,
  withForgotPassword = false,
  ...props
}: AuthCommonFieldPasswordProps<T>) {
  const { getValues } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex gap-2 justify-between items-center">
            <FormLabel>{label}</FormLabel>
            {withForgotPassword && (
              <Link
                to="/forgot-password"
                state={{
                  organizationURL: getValues("organizationURL"),
                  email: getValues("email"),
                }}
                className="text-sm underline leading-none"
                tabIndex={5}
              >
                Forgot your password?
              </Link>
            )}
          </div>
          <FormControl>
            <InputPassword
              {...props}
              value={String(field.value || "")}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              disabled={field.disabled}
              ref={inputRef || field.ref}
              newPasswordChecks={newPasswordChecks}
              showValidationErrors={showValidationErrors}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

import { useState, forwardRef } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LucideCheckSquare, LucideSquare, LucideEye, LucideEyeOff } from "lucide-react";
import { passwordMinLengthValue, regexIsUppercase, regexIsNumber, regexIsSpecialCharacter } from "./zValidations";
import { Button } from "@/components/ui/button";

interface NewPasswordFieldProps {
  submittedWithErrors: boolean;
}

const NewPasswordField = forwardRef<HTMLInputElement, NewPasswordFieldProps>(
  ({ submittedWithErrors }, ref) => {
    const { control } = useFormContext();
    const [passwordVisible, setPasswordVisible] = useState(false);

    return (
      <FormField
        control={control}
        name="password"
        render={({ field }) => {
          const passwordValidations = {
            length: field.value?.length >= passwordMinLengthValue,
            uppercase: regexIsUppercase.test(field.value || ''),
            number: regexIsNumber.test(field.value || ''),
            specialChar: regexIsSpecialCharacter.test(field.value || ''),
          };

          return (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={passwordVisible ? "text" : "password"}
                    {...field}
                    autoComplete="new-password"
                    className="pr-9"
                    ref={ref}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title={passwordVisible ? "Hide password" : "Show password"}
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute inset-y-0 right-0"
                  >
                    {passwordVisible ? <LucideEyeOff /> : <LucideEye />}
                  </Button>
                </div>
              </FormControl>
              <ul className="mt-2 text-sm text-muted-foreground">
                <li
                  className={`flex items-center ${
                    submittedWithErrors && !passwordValidations.uppercase
                      ? "text-destructive"
                      : ""
                  }`}
                >
                  {passwordValidations.uppercase ? (
                    <LucideCheckSquare className="mr-2 text-green-500" />
                  ) : (
                    <LucideSquare className="mr-2" />
                  )}
                  At least one uppercase letter
                </li>
                <li
                  className={`flex items-center ${
                    submittedWithErrors && !passwordValidations.number
                      ? "text-destructive"
                      : ""
                  }`}
                >
                  {passwordValidations.number ? (
                    <LucideCheckSquare className="mr-2 text-green-500" />
                  ) : (
                    <LucideSquare className="mr-2" />
                  )}
                  At least one number
                </li>
                <li
                  className={`flex items-center ${
                    submittedWithErrors && !passwordValidations.specialChar
                      ? "text-destructive"
                      : ""
                  }`}
                >
                  {passwordValidations.specialChar ? (
                    <LucideCheckSquare className="mr-2 text-green-500" />
                  ) : (
                    <LucideSquare className="mr-2" />
                  )}
                  At least one special character (_!@#$%^&*()-)
                </li>
                <li
                  className={`flex items-center ${
                    submittedWithErrors && !passwordValidations.length
                      ? "text-destructive"
                      : ""
                  }`}
                >
                  {passwordValidations.length ? (
                    <LucideCheckSquare className="mr-2 text-green-500" />
                  ) : (
                    <LucideSquare className="mr-2" />
                  )}
                  At least {passwordMinLengthValue} characters
                </li>
              </ul>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  }
);

NewPasswordField.displayName = 'NewPasswordField';

export default NewPasswordField;
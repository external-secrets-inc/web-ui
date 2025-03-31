import { useEffect, useState, forwardRef } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LucideCheckSquare, LucideSquare, LucideEye, LucideEyeOff } from "lucide-react";
import { regexPasswordPattern, passwordMinLengthValue, regexIsUppercase, regexIsNumber, regexIsSpecialCharacter } from "./zValidations";
import { Button } from "@/components/ui/button";

interface NewPasswordFieldProps {
  submittedWithErrors: boolean;
}

const NewPasswordField = forwardRef<HTMLInputElement, NewPasswordFieldProps>(
  ({ submittedWithErrors }, ref) => {
    const { getValues, setValue, control } = useFormContext();
    const [password, setPassword] = useState(getValues("password"));
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordValidations, setPasswordValidations] = useState({
      length: password?.length >= passwordMinLengthValue,
      uppercase: regexIsUppercase.test(password),
      number: regexIsNumber.test(password),
      specialChar: regexIsSpecialCharacter.test(password),
    });

    useEffect(() => {
      setPasswordValidations({
        length: password?.length >= passwordMinLengthValue,
        uppercase: regexIsUppercase.test(password),
        number: regexIsNumber.test(password),
        specialChar: regexIsSpecialCharacter.test(password),
      });
    }, [password]);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setPassword(value);
      setValue("password", value);
    };

    const togglePasswordVisibility = () => {
      setPasswordVisible(!passwordVisible);
    };

    return (
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  {...field}
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  pattern={regexPasswordPattern.source}
                  minLength={passwordMinLengthValue}
                  className="pr-9"
                  ref={ref}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  title={passwordVisible ? "Hide password" : "Show password"}
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0"
                >
                  {passwordVisible ? <LucideEyeOff /> : <LucideEye />}
                </Button>
              </div>
            </FormControl>
            <ul className="mt-2 text-sm text-muted-foreground">
              <li
                className={`flex items-center ${submittedWithErrors && !passwordValidations.uppercase
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
                className={`flex items-center ${submittedWithErrors && !passwordValidations.number
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
                className={`flex items-center ${submittedWithErrors && !passwordValidations.specialChar
                  ? "text-destructive"
                  : ""
                  }`}
              >
                {passwordValidations.specialChar ? (
                  <LucideCheckSquare className="mr-2 text-green-500" />
                ) : (
                  <LucideSquare className="mr-2" />
                )}
                At least one special character
              </li>
              <li
                className={`flex items-center ${submittedWithErrors && !passwordValidations.length
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
        )}
      />
    );
  }
);

NewPasswordField.displayName = 'NewPasswordField';

export default NewPasswordField;

import { useEffect, useState, forwardRef } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "../../ui/form";
import { Input } from "@/components/ui/input";
import { CheckSquareIcon, SquareIcon } from "lucide-react";
import { regexPasswordPattern, passwordMinLengthValue, regexIsUppercase, regexIsNumber, regexIsSpecialCharacter } from "./zValidations";

interface NewPasswordFieldProps {
  submittedWithErrors: boolean;
}

const NewPasswordField = forwardRef<HTMLInputElement, NewPasswordFieldProps>(
  ({ submittedWithErrors }, ref) => {
    const { getValues, setValue, control } = useFormContext();
    const [password, setPassword] = useState(getValues("password"));
    const [passwordValidations, setPasswordValidations] = useState({
      length: password.length >= passwordMinLengthValue,
      uppercase: regexIsUppercase.test(password),
      number: regexIsNumber.test(password),
      specialChar: regexIsSpecialCharacter.test(password),
    });

    useEffect(() => {
      setPasswordValidations({
        length: password.length >= passwordMinLengthValue,
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

    return (
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input
                id="password"
                type="password"
                {...field}
                value={password}
                onChange={handlePasswordChange}
                autoComplete="new-password"
                pattern={regexPasswordPattern.source}
                minLength={passwordMinLengthValue}
                ref={ref}
              />
            </FormControl>
            <ul className="mt-2 text-sm text-muted-foreground">
              <li
                className={`flex items-center ${submittedWithErrors && !passwordValidations.uppercase
                  ? "text-destructive"
                  : ""
                  }`}
              >
                {passwordValidations.uppercase ? (
                  <CheckSquareIcon className="mr-2 text-green-500" />
                ) : (
                  <SquareIcon className="mr-2" />
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
                  <CheckSquareIcon className="mr-2 text-green-500" />
                ) : (
                  <SquareIcon className="mr-2" />
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
                  <CheckSquareIcon className="mr-2 text-green-500" />
                ) : (
                  <SquareIcon className="mr-2" />
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
                  <CheckSquareIcon className="mr-2 text-green-500" />
                ) : (
                  <SquareIcon className="mr-2" />
                )}
                At least {passwordMinLengthValue} characters
              </li>
            </ul>
          </FormItem>
        )}
      />
    );
  }
);

NewPasswordField.displayName = 'NewPasswordField';

export default NewPasswordField;
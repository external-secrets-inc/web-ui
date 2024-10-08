import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "../../ui/form";
import { Input } from "../../ui/input";
import { CheckSquareIcon, SquareIcon } from "lucide-react";

interface NewPasswordFieldProps {
  submittedWithErrors: boolean;
}

function NewPasswordField({ submittedWithErrors }: NewPasswordFieldProps) {
  const { getValues, setValue, control } = useFormContext();
  const [password, setPassword] = useState(getValues("password"));
  const [passwordValidations, setPasswordValidations] = useState({
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[^a-zA-Z0-9]/.test(password),
  });

  useEffect(() => {
    setPasswordValidations({
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[^a-zA-Z0-9]/.test(password),
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
            />
          </FormControl>
          <ul className="mt-2 text-sm text-muted-foreground">
            <li
              className={`flex items-center ${submittedWithErrors && !passwordValidations.uppercase
                ? "text-red-500"
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
                ? "text-red-500"
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
                ? "text-red-500"
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
                ? "text-red-500"
                : ""
                }`}
            >
              {passwordValidations.length ? (
                <CheckSquareIcon className="mr-2 text-green-500" />
              ) : (
                <SquareIcon className="mr-2" />
              )}
              At least 12 characters
            </li>
          </ul>
        </FormItem>
      )}
    />
  );
}

export default NewPasswordField;
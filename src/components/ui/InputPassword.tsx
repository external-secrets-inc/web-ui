import { forwardRef, InputHTMLAttributes, useState, useEffect } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { LucideEye, LucideEyeOff, LucideCheckSquare, LucideSquare } from "lucide-react";
import { regexIsUppercase, regexIsNumber, regexIsSpecialCharacter, passwordMinLengthValue } from "@/components/Auth";

export interface InputPasswordProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Enable strong password validation with visual feedback
   */
  newPasswordChecks?: boolean;
  /**
   * Whether the form has been submitted with errors
   */
  showValidationErrors?: boolean;
}

const InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>(({
  newPasswordChecks,
  showValidationErrors = false,
  className = "",
  value = "",
  onChange,
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [validations, setValidations] = useState({
    hasUppercase: regexIsUppercase.test(value as string),
    hasNumber: regexIsNumber.test(value as string),
    hasSpecialChar: regexIsSpecialCharacter.test(value as string),
    meetsMinLength: (value as string)?.length >= passwordMinLengthValue
  });

  useEffect(() => {
    if (newPasswordChecks) {
      setValidations({
        hasUppercase: regexIsUppercase.test(value as string),
        hasNumber: regexIsNumber.test(value as string),
        hasSpecialChar: regexIsSpecialCharacter.test(value as string),
        meetsMinLength: (value as string)?.length >= passwordMinLengthValue
      });
    }
  }, [value, newPasswordChecks]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
  };

  return (
    <div className="grid gap-2">
      <div className="relative">
        <Input
          type={isVisible ? "text" : "password"}
          className={`pr-9 ${className}`}
          value={value}
          onChange={handleChange}
          {...props}
          ref={ref}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={isVisible ? "Hide password" : "Show password"}
          onClick={() => setIsVisible(!isVisible)}
          className="absolute inset-y-0 right-0"
        >
          {isVisible ? <LucideEyeOff /> : <LucideEye />}
        </Button>
      </div>

      {newPasswordChecks && (
        <ul className="text-sm text-muted-foreground">
          <ValidationRequirement
            isValid={validations.meetsMinLength}
            showError={showValidationErrors}
            text={`At least ${passwordMinLengthValue} characters`}
          />
          <ValidationRequirement
            isValid={validations.hasUppercase}
            showError={showValidationErrors}
            text="At least one uppercase letter"
          />
          <ValidationRequirement
            isValid={validations.hasNumber}
            showError={showValidationErrors}
            text="At least one number"
          />
          <ValidationRequirement
            isValid={validations.hasSpecialChar}
            showError={showValidationErrors}
            text="At least one special character"
          />
        </ul>
      )}
    </div>
  );
});

interface ValidationRequirementProps {
  isValid: boolean;
  showError: boolean;
  text: string;
}

function ValidationRequirement({ isValid, showError, text }: ValidationRequirementProps) {
  return (
    <li className={`flex items-center ${showError && !isValid ? "text-destructive" : ""}`}>
      {isValid ? (
        <LucideCheckSquare className="mr-2 text-green-500" />
      ) : (
        <LucideSquare className="mr-2" />
      )}
      {text}
    </li>
  );
}

InputPassword.displayName = "InputPassword";

export default InputPassword;
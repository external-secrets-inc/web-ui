import {
  AuthCommonFieldEmail,
  AuthCommonFieldNewPassword,
  AuthCommonSubmitButton,
  useAuthSignupFormContext,
} from "@/components/Auth";
import { Button } from "@/components/ui/button";
import { LucideArrowLeft } from "lucide-react";
import { useRef } from "react";
import { useFormContext } from "react-hook-form";

export function AuthSignupStepCredentials() {
  const { control } = useFormContext();
  const { isProcessing, handleGoBack } = useAuthSignupFormContext();
  const emailRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <AuthCommonFieldEmail
        control={control}
        name="email"
        inputRef={emailRef}
        tabIndex={1}
        autoFocus
      />

      <AuthCommonFieldNewPassword
        control={control}
        name="password"
        tabIndex={2}
        submittedWithErrors={false}
      />

      <AuthCommonSubmitButton
        className="w-full"
        isLoading={isProcessing}
        text="Sign Up"
        tabIndex={3}
      />

      <Button
        type="button"
        variant="secondary"
        onClick={handleGoBack}
        disabled={isProcessing}
        tabIndex={4}
      >
        <LucideArrowLeft />
        Back
      </Button>
    </>
  );
}

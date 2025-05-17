import { trackLoginStepMovedBack } from "@/analytics";
import {
  AuthCommonFieldEmail,
  AuthCommonFieldPassword,
  AuthCommonSubmitButton,
  useAuthLoginFormContext,
} from "@/components/Auth";
import { Button } from "@/components/ui/button";
import { LucideArrowLeft } from "lucide-react";
import { useFormContext } from "react-hook-form";

export function AuthLoginStepCredentials() {
  const { control } = useFormContext();
  const {
    isProcessing,
    stepperMethods,
  } = useAuthLoginFormContext();
  const { prev } = stepperMethods;

  return (
    <>
      <AuthCommonFieldEmail
        control={control}
        name="email"
        autoComplete="username email"
        tabIndex={1}
        autoFocus
      />
      <AuthCommonFieldPassword
        control={control}
        name="password"
        autoComplete="current-password"
        tabIndex={2}
        withForgotPassword
      />
      <AuthCommonSubmitButton
        className="w-full"
        isLoading={isProcessing}
        text="Login"
        tabIndex={3}
      />
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          prev();
          trackLoginStepMovedBack();
        }}
        disabled={isProcessing}
        className="self-start"
        tabIndex={4}
      >
        <LucideArrowLeft />
        Change Organization
      </Button>
    </>
  );
}

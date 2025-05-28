import { trackLoginStepMovedBack } from "@/analytics";
import {
  AuthCommonFieldEmail,
  AuthCommonFieldPassword,
  AuthCommonSubmitButton,
  AuthLoginGoogleButton,
  useAuthLoginFormContext,
} from "@/components/Auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LucideArrowLeft } from "lucide-react";
import { useFormContext } from "react-hook-form";

export function AuthLoginStepCredentials() {
  const { control } = useFormContext();
  const {
    isProcessing,
    stepperMethods,
    handleGoogleTokenResponse,
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

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs">OR</span>
        <Separator className="flex-1" />
      </div>

      <AuthLoginGoogleButton
        onTokenReceived={handleGoogleTokenResponse}
        loading={isProcessing}
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

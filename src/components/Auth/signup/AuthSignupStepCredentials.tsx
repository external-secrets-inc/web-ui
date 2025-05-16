import {
  AuthCommonFieldEmail,
  AuthCommonFieldNewPassword,
} from "@/components/Auth";
import { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { SignupData } from "@/components/Auth";

export function AuthSignupStepCredentials() {
  const { control } = useFormContext<SignupData>();
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
    </>
  );
}

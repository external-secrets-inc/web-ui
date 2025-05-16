import {
  AuthCommonFieldEmail,
  AuthCommonFieldPassword,
} from "@/components/Auth";
import { useFormContext } from "react-hook-form";

export function AuthLoginStepCredentials() {
  const { control } = useFormContext();

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
    </>
  );
}

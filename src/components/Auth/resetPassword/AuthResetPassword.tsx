import {
  AuthCommonFieldEmail,
  AuthCommonFieldNewPassword,
  AuthCommonFieldOrganizationURL,
  AuthCommonSection,
  AuthCommonSubmitButton,
  useAuthResetPasswordFlow,
} from "@/components/Auth";
import { Form } from "@/components/ui/form";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export function AuthResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const savedTenant = Cookies.get("forgotPasswordHelperOrganizationURL") || "";
  const savedEmail = Cookies.get("forgotPasswordHelperEmail") || "";

  const {
    form,
    handleSubmit,
    handleError,
    formError,
    isLoading,
    submittedWithErrors,
    newPasswordRef,
    tenantInputRef,
    emailInputRef,
  } = useAuthResetPasswordFlow({
    defaultTenant: savedTenant,
    defaultEmail: savedEmail,
    token,
  });

  useEffect(
    function setInitialFormFieldFocus() {
      if (!(savedTenant && savedEmail)) return tenantInputRef.current?.focus();
      newPasswordRef.current?.focus();
    },
    [savedTenant, savedEmail, newPasswordRef, tenantInputRef]
  );

  return (
    <AuthCommonSection
      title="Set up a new password"
      description="Once it's set, you can use it to log in again"
      ariaLabel="Set up new password"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit, handleError)}
          className="grid gap-4"
        >
          <AuthCommonFieldOrganizationURL
            control={form.control}
            name="tenant"
            inputRef={tenantInputRef}
            tabIndex={1}
          />
          <AuthCommonFieldEmail
            control={form.control}
            name="email"
            inputRef={emailInputRef}
            tabIndex={2}
          />
          <AuthCommonFieldNewPassword
            control={form.control}
            name="password"
            submittedWithErrors={submittedWithErrors}
            inputRef={newPasswordRef}
            tabIndex={3}
          />
          <AuthCommonSubmitButton
            isLoading={isLoading}
            text="Update Password"
            tabIndex={4}
          />

          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </form>
      </Form>
    </AuthCommonSection>
  );
}

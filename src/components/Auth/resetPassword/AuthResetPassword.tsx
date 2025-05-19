import {
  AuthCommonFieldEmail,
  AuthCommonFieldNewPassword,
  AuthCommonFieldOrganizationURL,
  AuthCommonSection,
  AuthCommonSubmitButton,
  useAuthResetPasswordFlow,
} from "@/components/Auth";
import { Form } from "@/components/ui/form";
import { useEffect } from "react";
import { useLocation, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LucideArrowLeft } from "lucide-react";

export function AuthResetPassword() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const token = searchParams.get("token") || "";

  const stateData = location.state as
    | { tenant?: string; email?: string }
    | undefined;
  const tenantFromState = stateData?.tenant;
  const emailFromState = stateData?.email;

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
    defaultTenant: tenantFromState || "",
    defaultEmail: emailFromState || "",
    token,
  });

  useEffect(
    function setInitialFormFieldFocus() {
      if (!tenantFromState && !emailFromState)
        return tenantInputRef.current?.focus();
      newPasswordRef.current?.focus();
    },
    [tenantFromState, emailFromState, newPasswordRef, tenantInputRef]
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

          <Button
            type="button"
            variant="secondary"
            asChild
            tabIndex={5}
          >
            <Link
              to="/login"
              state={{
                organizationURL: form.getValues("tenant"),
                email: form.getValues("email"),
              }}
            >
              <LucideArrowLeft />
              Back to login
            </Link>
          </Button>

          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </form>
      </Form>
    </AuthCommonSection>
  );
}

import {
  AuthCommonFieldEmail,
  AuthCommonFieldOrganizationURL,
  AuthCommonSection,
  AuthCommonSubmitButton,
  useAuthForgotPasswordFlow,
} from "@/components/Auth";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LucideArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export function AuthForgotPassword() {
  const location = useLocation();
  const state = location.state as { organizationURL?: string; email?: string };
  const defaultTenant = state?.organizationURL || "";
  const defaultEmail = state?.email || "";

  const {
    form,
    handleSubmit,
    formError,
    isLoading,
    emailInputRef,
    tenantInputRef,
    submitButtonRef,
  } = useAuthForgotPasswordFlow(defaultTenant, defaultEmail);

  useEffect(
    function setInitialFormFieldFocus() {
      if (!defaultTenant) return tenantInputRef.current?.focus();
      if (!defaultEmail) return emailInputRef.current?.focus();
      submitButtonRef.current?.focus();
    },
    [
      location,
      defaultTenant,
      defaultEmail,
      emailInputRef,
      tenantInputRef,
      submitButtonRef,
    ]
  );

  return (
    <AuthCommonSection
      title="Reset Password"
      description="Include the Organization URL and email address associated with your account and we'll send you an email with instructions to reset your password"
      ariaLabel="Reset password"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4">
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
          <AuthCommonSubmitButton
            buttonRef={submitButtonRef}
            isLoading={isLoading}
            text="Send instructions"
            tabIndex={3}
          />

          <Button
            type="button"
            variant="secondary"
            asChild
            className="self-start"
            tabIndex={4}
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

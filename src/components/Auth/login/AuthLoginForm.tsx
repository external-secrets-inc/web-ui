import {
  authCommonZodSchemas,
  AuthLoginStepCredentials,
  AuthLoginStepOrganizationURL,
  useAuthLoginFlow,
  useAuthLoginWithGoogle,
} from "@/components/Auth";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { CredentialResponse, GoogleOAuthProvider } from "@react-oauth/google";
import { defineStepper, Step } from "@stepperize/react";
import { createContext, FC, useContext } from "react";
import { UseFormReturn } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

const OrganizationURLSchema = z.object({
  organizationURL: authCommonZodSchemas.organizationURL,
});
const CredentialsSchema = z.object({
  email: authCommonZodSchemas.email,
  password: authCommonZodSchemas.existingPassword,
});

const step1 = {
  id: "organizationURL",
  label: "Organization URL",
  schema: OrganizationURLSchema,
};
const step2 = {
  id: "credentials",
  label: "Credentials",
  schema: CredentialsSchema,
};
const { Scoped } = defineStepper(step1, step2);

type LoginFormShape = z.infer<typeof OrganizationURLSchema> &
  z.infer<typeof CredentialsSchema>;

interface AuthLoginFormContextType {
  form: UseFormReturn<LoginFormShape>;
  currentStep: Step;
  stepperMethods: {
    prev: () => void;
    next: () => void;
    switch: <T>(cases: Record<string, () => T>) => T;
    current: Step;
  };
  isProcessing: boolean;
  handleAttemptSubmit: (data: LoginFormShape) => void;
  formError: string | null;
  googleError: string | null;
  handleGoogleTokenResponse: (response: CredentialResponse) => void;
}

const AuthLoginFormContext = createContext<
  AuthLoginFormContextType | undefined
>(undefined);

export function useAuthLoginFormContext() {
  const context = useContext(AuthLoginFormContext);
  if (!context) {
    throw new Error(
      "useAuthLoginFormContext must be used within a AuthLoginForm provider"
    );
  }
  return context;
}

const AuthLoginFormContent: FC = () => {
  const { form, stepperMethods, handleAttemptSubmit, formError, googleError } =
    useAuthLoginFormContext();

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleAttemptSubmit)}
          className="grid gap-4"
        >
          {stepperMethods.switch({
            organizationURL: () => <AuthLoginStepOrganizationURL />,
            credentials: () => <AuthLoginStepCredentials />,
          })}
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          {googleError && (
            <p className="text-sm text-destructive">{googleError}</p>
          )}
        </form>
      </Form>

      <div className="text-sm text-muted-foreground">
        Don't have an Organization yet?{" "}
        <Link
          to="/signup"
          className={cn(
            useAuthLoginFormContext().isProcessing &&
              "pointer-events-none text-muted-foreground/50 no-underline",
            "underline text-foreground text-nowrap"
          )}
        >
          Sign up for one
        </Link>
      </div>
    </>
  );
};

interface AuthLoginFormProps {
  /**
   * Callback function invoked when the login flow progresses to a new step.
   * This function is called by `AuthLoginForm` to notify its parent (`AuthLogin`)
   * about changes to the current step, allowing the parent to update its UI accordingly.
   * @param step The identifier of the new current step (e.g., "organizationURL", "credentials").
   */
  onStepChange: (step: string) => void;
  /**
   * Callback function invoked when the organization URL is successfully entered and validated.
   * This function is called by `AuthLoginForm` to notify its parent (`AuthLogin`)
   * of the validated organization URL, allowing the parent to update its UI or state.
   * @param tenantId The validated organization URL (tenant identifier).
   */
  onOrganizationURLChange: (tenantId: string) => void;
}

// 9. Main Exported Component (which now also acts as the Provider)
export function AuthLoginForm(props: AuthLoginFormProps) {
  const {
    form,
    stepperMethods,
    handleAttemptSubmit,
    formError,
    isLoadingCoreFlow,
  } = useAuthLoginFlow(props.onStepChange, props.onOrganizationURLChange);

  const currentStep = stepperMethods.current;

  const { handleGoogleTokenResponse, isGoogleLoading, googleError } =
    useAuthLoginWithGoogle({ currentStep, form });

  const isProcessing = isLoadingCoreFlow || isGoogleLoading;

  const contextValue = {
    form,
    currentStep,
    stepperMethods,
    isProcessing,
    handleAttemptSubmit,
    formError,
    googleError,
    handleGoogleTokenResponse,
  };

  return (
    <Scoped initialStep="organizationURL">
      <GoogleOAuthProvider
        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}
      >
        <AuthLoginFormContext.Provider value={contextValue}>
          <AuthLoginFormContent />
        </AuthLoginFormContext.Provider>
      </GoogleOAuthProvider>
    </Scoped>
  );
}

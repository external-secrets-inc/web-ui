import {
  authCommonZodSchemas,
  AuthSignupStepCredentials,
  AuthSignupStepOrganizationInfo,
  useAuthSignupFlow,
} from "@/components/Auth";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Step, defineStepper } from "@stepperize/react";
import { createContext, FC, useContext } from "react";
import { Link } from "react-router-dom";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

const OrganizationInfoSchema = z.object({
  organizationName: authCommonZodSchemas.organizationName,
  name: authCommonZodSchemas.name,
  organizationURL: authCommonZodSchemas.organizationURL,
});
const CredentialsSchema = z.object({
  email: authCommonZodSchemas.email,
  password: authCommonZodSchemas.newPassword,
});

const step1 = {
  id: "organizationInfo",
  label: "Organization Info",
  schema: OrganizationInfoSchema,
};
const step2 = {
  id: "credentials",
  label: "Credentials",
  schema: CredentialsSchema,
};
const { Scoped } = defineStepper(step1, step2);

type SignupFormShape = z.infer<typeof OrganizationInfoSchema> &
  z.infer<typeof CredentialsSchema>;

interface AuthSignupFormContextType {
  form: UseFormReturn<SignupFormShape>;
  currentStep: Step;
  stepperMethods: {
    prev: () => void;
    next: () => void;
    switch: <T>(cases: Record<string, () => T>) => T;
    current: Step;
    isLast: boolean;
    isFirst: boolean;
  };
  isProcessing: boolean;
  handleAttemptSubmit: (data: SignupFormShape) => void;
  handleGoBack: () => void;
  formError: string | null;
}

const AuthSignupFormContext = createContext<
  AuthSignupFormContextType | undefined
>(undefined);

export function useAuthSignupFormContext() {
  const context = useContext(AuthSignupFormContext);
  if (!context) {
    throw new Error(
      "useAuthSignupFormContext must be used within an AuthSignupForm provider"
    );
  }
  return context;
}

const AuthSignupFormContent: FC = () => {
  const { form, stepperMethods, handleAttemptSubmit, formError } =
    useAuthSignupFormContext();

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleAttemptSubmit)}
          className="grid gap-4"
        >
          {stepperMethods.switch({
            organizationInfo: () => <AuthSignupStepOrganizationInfo />,
            credentials: () => <AuthSignupStepCredentials />,
          })}
          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </form>
      </Form>

      <div className="text-sm text-muted-foreground">
        Already a member of an Organization?{" "}
        <Link
          to="/login"
          className={cn(
            useAuthSignupFormContext().isProcessing &&
              "pointer-events-none text-muted-foreground/50 no-underline",
            "underline text-foreground text-nowrap"
          )}
        >
          Log in
        </Link>
      </div>
    </>
  );
};

export function AuthSignupForm() {
  const {
    form,
    stepperMethods,
    handleAttemptSubmit,
    handleGoBack,
    formError,
    isLoadingCoreFlow,
  } = useAuthSignupFlow();

  const currentStep = stepperMethods.current;
  const isProcessing = isLoadingCoreFlow;

  const contextValue = {
    form,
    currentStep,
    stepperMethods,
    isProcessing,
    handleAttemptSubmit,
    handleGoBack,
    formError,
  };

  return (
    <Scoped initialStep="organizationInfo">
      <AuthSignupFormContext.Provider value={contextValue}>
        <AuthSignupFormContent />
      </AuthSignupFormContext.Provider>
    </Scoped>
  );
}

import {
  AuthCommonSubmitButton,
  authCommonZodSchemas,
  AuthSignupStepCredentials,
  AuthSignupStepOrganizationInfo,
} from "@/components/Auth";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { defineStepper } from "@stepperize/react";
import { LucideArrowLeft } from "lucide-react";
import { FC } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useAuthSignupFlow } from "@/components/Auth";
import { cn } from "@/lib/utils";
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

interface SignupFormProps {
  onStepChange?: (step: string) => void;
}

const SignupFormContent: FC<SignupFormProps> = ({
  onStepChange = () => {},
}) => {
  const {
    form,
    stepperMethods,
    handleAttemptSubmit,
    handleGoBack,
    formError,
    isLoadingCoreFlow,
  } = useAuthSignupFlow(onStepChange);

  const { isLast, isFirst } = stepperMethods;

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
          <AuthCommonSubmitButton
            className="w-full"
            isLoading={isLoadingCoreFlow}
            text={isLast ? "Sign Up" : "Next"}
            tabIndex={3}
          />
          {!isFirst && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleGoBack}
              disabled={isLoadingCoreFlow}
              tabIndex={4}
            >
              <LucideArrowLeft />
              Back
            </Button>
          )}

          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </form>
      </Form>

      <div className="text-sm text-muted-foreground">
        Already a member of an Organization?{" "}
        <Link
          to="/login"
          className={cn(
            isLoadingCoreFlow &&
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

export function AuthSignupForm(props: SignupFormProps) {
  return (
    <Scoped initialStep="organizationInfo">
      <SignupFormContent {...props} />
    </Scoped>
  );
}

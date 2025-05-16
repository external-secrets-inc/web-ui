import { trackLoginStepMovedBack } from "@/analytics";
import {
  AuthCommonSubmitButton,
  authCommonZodSchemas,
  AuthLoginStepCredentials,
  AuthLoginStepOrganizationURL,
  useAuthLoginFlow,
} from "@/components/Auth";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { defineStepper } from "@stepperize/react";
import { LucideArrowLeft } from "lucide-react";
import { FC } from "react";
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

interface AuthLoginFormProps {
  onStepChange: (step: string) => void;
  onOrganizationURLChange: (tenantId: string) => void;
}

const AuthLoginFormContent: FC<AuthLoginFormProps> = ({
  onStepChange,
  onOrganizationURLChange,
}) => {
  const {
    form,
    stepperMethods,
    handleAttemptSubmit,
    formError,
    isLoadingCoreFlow,
  } = useAuthLoginFlow(onStepChange, onOrganizationURLChange);

  const { prev } = stepperMethods;

  const isProcessing = isLoadingCoreFlow;

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleAttemptSubmit)}
          className="grid gap-4"
        >
          {stepperMethods.switch({
            organizationURL: () => (
              <>
                <AuthLoginStepOrganizationURL />
                <AuthCommonSubmitButton
                  isLoading={isProcessing}
                  text="Next"
                  tabIndex={2}
                />
              </>
            ),
            credentials: () => (
              <>
                <AuthLoginStepCredentials />
                <AuthCommonSubmitButton
                  className="w-full"
                  isLoading={isProcessing}
                  text="Log In"
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
            ),
          })}
          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </form>
      </Form>

      <div className="text-sm text-muted-foreground">
        Don't have an Organization yet?{" "}
        <Link
          to="/signup"
          className={cn(
            isProcessing &&
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

export function AuthLoginForm(props: AuthLoginFormProps) {
  return (
    <Scoped initialStep="organizationURL">
      <AuthLoginFormContent {...props} />
    </Scoped>
  );
}

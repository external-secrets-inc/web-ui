import { trackLoginStepCompleted, trackLoginStepMovedBack, trackSignedIn } from "@/analytics";
import { FormProvider, useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { LoginOrganizationURLStep } from "./LoginOrganizationURLStep";
import { LoginCredentialsStep } from "./LoginCredentialsStep";
import zValidations from "./fields/zValidations";
import { useLoginWithIdentification } from "@/services/auth/mutations/useLoginWithIdentification";

const LoginOrganizationURLSchema = z.object({
  organizationURL: zValidations.organizationURL
});

const LoginCredentialsSchema = z.object({
  email: zValidations.email,
  password: zValidations.existingPassword,
});

type LoginOrganizationURLData = z.infer<typeof LoginOrganizationURLSchema>;
type LoginCredentialsData = z.infer<typeof LoginCredentialsSchema>;
type LoginData = LoginOrganizationURLData & LoginCredentialsData;
type Step = "organizationURL" | "credentials";

interface LoginFormProps {
  onStepChange: (step: Step) => void;
  onOrganizationURLChange: (tenantId: string) => void;
}

function LoginForm({ onStepChange, onOrganizationURLChange }: LoginFormProps) {
  const [step, setStep] = useState<Step>("organizationURL");
  const [formError, setFormError] = useState<string | null>(null);
  const [hasModifiedURL, setHasModifiedURL] = useState(true);
  const navigate = useNavigate();

  const formMethods = useForm<LoginData>({
    resolver: zodResolver(step === "organizationURL" ? LoginOrganizationURLSchema : LoginCredentialsSchema),
    defaultValues: {
      organizationURL: "",
      email: "",
      password: "",
    },
  });

  const handleOrganizationURLStepSubmit = () => {
    formMethods.trigger("organizationURL").then(isValid => {
      if (!isValid || !hasModifiedURL) return;
      
      const formData = formMethods.getValues();
      onOrganizationURLChange(formData.organizationURL);
      trackLoginStepCompleted(1);
      setStep("credentials");
      onStepChange("credentials");
    });
  };

  const { login, isLoading } = useLoginWithIdentification({
    onSuccess: () => {
      const formData = formMethods.getValues();
      trackLoginStepCompleted(2);
      trackSignedIn(formData.organizationURL!);
      navigate(`/${formData.organizationURL}/agents`);
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseError = (error.response?.data?.errors as any)?.error;

        if (responseError?.includes("invalid username/password")) {
          setFormError("Invalid login credentials");
          return;
        }

        if (responseError?.includes("invalid tenant")) {
          setStep("organizationURL");
          onStepChange("organizationURL");
          formMethods.setError("organizationURL", { 
            type: "manual", 
            message: "Invalid Organization URL" 
          });
          setHasModifiedURL(false);
          return;
        }
      }

      console.error("Non-Axios error:", error);
      setFormError("Login failed. Please try again.");
    }
  });

  const handleCredentialsStepSubmit = async (data: LoginCredentialsData) => {
    formMethods.clearErrors();
    setFormError(null);

    const formData = formMethods.getValues();
    await login({
      email: data.email!,
      password: data.password!,
      tenantSlug: formData.organizationURL!,
    });
  };

  const handleBack = () => {
    setStep("organizationURL");
    onStepChange("organizationURL");
    setFormError(null);
    trackLoginStepMovedBack();
  };

  formMethods.watch((_, { name }) => {
    if (name === "organizationURL") {
      setHasModifiedURL(true);
    }
  });

  return (
    <>
      <FormProvider {...formMethods}>
        {step === "organizationURL" ? (
          <LoginOrganizationURLStep
            onSubmit={formMethods.handleSubmit(handleOrganizationURLStepSubmit)}
            disabled={!hasModifiedURL}
          />
        ) : (
          <LoginCredentialsStep
            onSubmit={formMethods.handleSubmit(handleCredentialsStepSubmit)}
            onBack={handleBack}
            loading={isLoading}
          />
        )}
        {formError ? <div className="text-destructive">{formError}</div> : null}
      </FormProvider>

      <div className="text-sm text-muted-foreground">
        Don't have an Organization yet?{" "}
        <Link
          to="/signup"
          className={`
            underline text-foreground text-nowrap
            ${isLoading ? 'pointer-events-none text-muted-foreground/50 no-underline' : ''}
          `}
        >
          Sign up for one
        </Link>
      </div>
    </>
  );
}

export default LoginForm;

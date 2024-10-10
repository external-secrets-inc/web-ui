import { trackLoginStepCompleted, trackLoginStepMovedBack, trackSignedIn } from "@/analytics";
import { FormProvider, useForm } from "react-hook-form";
import { useState } from "react";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { LoginOrganizationURLStep } from "./LoginOrganizationURLStep";
import { LoginCredentialsStep } from "./LoginCredentialsStep";
import zValidations from "./fields/zValidations";
import { loginAndIdentifyUser } from "@/services/auth/authHelpers";

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
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const authKitSignIn = useSignIn();
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
    const formData = formMethods.getValues();
    onOrganizationURLChange(formData.organizationURL);
    trackLoginStepCompleted(1);
    setStep("credentials");
    onStepChange("credentials");
  };

  const handleCredentialsStepSubmit = async (data: LoginCredentialsData) => {
    setLoading(true);
    formMethods.clearErrors();
    setFormError(null);
    const stockError = "Login failed. Please try again.";

    const handleLoginErrors = (error: any) => {
      if (isAxiosError(error)) {
        const responseError = error.response?.data?.errors?.body;

        if (responseError?.includes("invalid username/password")) {
          return setFormError("Invalid login credentials");
        }

        if (responseError?.includes("invalid tenant")) {
          setStep("organizationURL");
          onStepChange("organizationURL");
          return formMethods.setError("organizationURL", { type: "manual", message: "Invalid Organization URL" });
        }
      }

      console.error("Non-Axios error:", error);
      setFormError(stockError);
    };

    try {
      const formData = formMethods.getValues();
      const hasSignedIn = await loginAndIdentifyUser({
        email: data.email!,
        password: data.password!,
        tenantSlug: formData.organizationURL!,
        authKitSignIn,
      });

      trackLoginStepCompleted(2);

      if (hasSignedIn) {
        trackSignedIn(formData.organizationURL!);
        return navigate(`/${formData.organizationURL}/agents`);
      }

      handleLoginErrors(new Error(stockError));
    } catch (err) {
      handleLoginErrors(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("organizationURL");
    onStepChange("organizationURL");
    trackLoginStepMovedBack();
  };

  return (
    <>
      <FormProvider {...formMethods}>
        {step === "organizationURL" ? (
          <LoginOrganizationURLStep
            onSubmit={formMethods.handleSubmit(handleOrganizationURLStepSubmit)}
          />
        ) : (
          <LoginCredentialsStep
            onSubmit={formMethods.handleSubmit(handleCredentialsStepSubmit)}
            onBack={handleBack}
            loading={loading}
          />
        )}
        {formError ? <div className="text-destructive">{formError}</div> : null}
      </FormProvider>

      <div className="text-sm text-muted-foreground">
        Don't have an Organization yet?{" "}
        <Link
          to="/signup"
          className={`
            underline text-foreground
            ${loading ? 'pointer-events-none text-muted-foreground/50 no-underline' : ''}
          `}
        >
          Sign up for one
        </Link>
      </div>
    </>
  );
}

export default LoginForm;
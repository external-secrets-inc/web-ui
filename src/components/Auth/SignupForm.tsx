import { trackSignedIn, trackSignupStepCompleted, trackSignupStepMovedBack } from "@/analytics";
import { useState } from "react";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginAndIdentifyUser } from "@/services/auth/authHelpers";
import { signup } from "@/services/auth/authService";
import SignupOrganizationInfoStep from "./SignupOrganizationInfoStep";
import SignupCredentialsStep from "./SignupCredentialsStep";
import zValidations from "./fields/zValidations";
import { isAxiosError } from "axios";
import { toast } from "sonner";

const OrganizationInfoSchema = z.object({
  organizationName: zValidations.organizationName,
  name: zValidations.name,
  organizationURL: zValidations.organizationURL,
});

const CredentialsSchema = z.object({
  email: zValidations.email,
  password: zValidations.newPassword,
});

type SignupData = z.infer<typeof OrganizationInfoSchema> & z.infer<typeof CredentialsSchema>;
type Step = "organizationInfo" | "credentials";

function SignupForm() {
  const [step, setStep] = useState<Step>("organizationInfo");
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const authKitSignIn = useSignIn();
  const navigate = useNavigate();

  const formMethods = useForm<SignupData>({
    resolver: zodResolver(step === "organizationInfo" ? OrganizationInfoSchema : CredentialsSchema),
    mode: "onSubmit",
    defaultValues: {
      organizationName: "",
      name: "",
      organizationURL: "",
      email: "",
      password: "",
    },
  });

  const handleOrganizationInfoSubmit = () => {
    trackSignupStepCompleted(1, formMethods.getValues("organizationName"));
    setStep("credentials");
  };

  const handleCredentialsSubmit = async () => {
    setLoading(true);
    const formData = formMethods.getValues();
    const stockError = "Signup failed. Please try again.";
    const maxLoginRetries = 6;
    const loginRetryDelay = 3000;

    const handleSignupErrors = (error: any) => {
      if (isAxiosError(error)) {
        const responseError = error.response?.data?.errors?.body;

        if (responseError?.includes("could not create tenant: duplicate key value violates unique constraint")) {
          setStep("organizationInfo");
          return formMethods.setError("organizationURL", { type: "manual", message: "This Organization URL is taken. Create a unique one or log in." });
        }
      }

      console.error("Non-Axios error:", error);
      setFormError(stockError);
    };

    try {
      await signup(
        formData.email,
        formData.name,
        formData.password,
        formData.organizationURL,
        { suppressToast: true },
      );

      trackSignupStepCompleted(2, formData.organizationName);

      const tryLogin = async (): Promise<boolean> => {
        const hasSignedIn = await loginAndIdentifyUser({
          email: formData.email,
          password: formData.password,
          tenantSlug: formData.organizationURL,
          name: formData.name,
          authKitSignIn,
        });
        return hasSignedIn;
      };

      for (let attempt = 1; attempt <= maxLoginRetries; attempt++) {
        try {
          const hasSignedIn = await tryLogin();
          if (hasSignedIn) {
            trackSignedIn(formData.organizationURL);
            setLoading(false);
            return navigate(`/${formData.organizationURL}/agents`);
          }
        } catch (error) {
          console.error(`Login attempt ${attempt} failed:`, error);
        }
        if (attempt < maxLoginRetries) {
          await new Promise((resolve) => setTimeout(resolve, loginRetryDelay));
        }
      }

      toast.success('Organization created successfully',
        { description: 'You can now log in with your credentials' }
      );
      navigate('/login');
    } catch (error) {
      handleSignupErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("organizationInfo");
    trackSignupStepMovedBack();
  };

  return (
    <FormProvider {...formMethods}>
      {step === "organizationInfo" ? (
        <SignupOrganizationInfoStep
          onSubmit={formMethods.handleSubmit(handleOrganizationInfoSubmit)}
        />
      ) : (
        <SignupCredentialsStep
          onSubmit={formMethods.handleSubmit(handleCredentialsSubmit)}
          onBack={handleBack}
          loading={loading}
        />
      )}
      {formError && <div className="text-red-500">{formError}</div>}
    </FormProvider>
  );
}

export default SignupForm;
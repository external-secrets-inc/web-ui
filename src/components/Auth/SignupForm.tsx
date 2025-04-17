import { trackSignedIn, trackSignupStepCompleted, trackSignupStepMovedBack } from "@/analytics";
import { useState } from "react";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { useForm, FormProvider } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SignupOrganizationInfoStep from "./SignupOrganizationInfoStep";
import SignupCredentialsStep from "./SignupCredentialsStep";
import zValidations from "./fields/zValidations";
import { AxiosError, isAxiosError } from "axios";
import { toast } from "sonner";
import useSignup from "@/services/auth/mutations/useSignup";
import { ApiHttpError } from "@/types";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import useLoginAndIdentifyUser from "@/services/auth/mutations/useLoginAndIdentifyUser";
import { LoginAndIdentifyParams, SignupPayload } from "@/services/auth/Auth.interfaces";

const MAX_LOGIN_RETRIES = 6;

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
  const [formError, setFormError] = useState<string | null>(null);
  const authKitSignIn = useSignIn();
  const navigate = useNavigate();

  const { mutate: loginAndIdentifyUser, isPending: isLoginPending } = useLoginAndIdentifyUser({
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Failed to sign in"),
    onSuccess: (_, variables: LoginAndIdentifyParams) => {
      trackSignedIn(variables.tenantSlug);
      return navigate(`/${variables.tenantSlug}/agents`);
    },
    retry: (failureCount) => {
      if (failureCount < MAX_LOGIN_RETRIES) return true
      
      // If the user has reached the maximum login retries, redirect to login screen
      toast.success('Organization created successfully', {
        description: 'You can now log in with your credentials',
      });
      navigate('/login');
      return false
    }
  })

  const { mutate: signup, isPending: isSignupPending } = useSignup({
    onError: (error: AxiosError<ApiHttpError>) => {
      const stockError = "Signup failed. Please try again.";
      if (isAxiosError(error)) {
        const responseError = error.response?.data?.errors?.error;

        if (responseError?.includes("tenant name already exists")) {
          setStep("organizationInfo");
          formMethods.setError("organizationURL", { type: "manual", message: "This Organization URL is taken. Create a unique one or log in." });
          // setTimeout is used to ensure the focus is set after the step set is rendered. Not sure what is the Reacty way to do this.
          return setTimeout(() => {
            formMethods.setFocus("organizationURL");
          }, 0);

        }

        // TODO: would be nice to validate this live on the client while the user is typing. Couldn't get it to work.
        if (responseError?.includes("Field validation for 'Password' failed on the 'password_regex' tag")) {
          formMethods.setError("password", { type: "manual", message: "Invalid special character. Use only: _ ! @ # $ % ^ & * ( ) -" });
          return formMethods.setFocus("password"); // TODO: This is not working, need to investigate. Maybe because of being inside it's own component?
        }
      }

      console.error("Non-Axios error:", error);
      setFormError(stockError);
    },
    onSuccess: (_, variables: SignupPayload) => {
      trackSignupStepCompleted(2, variables.tenant);
      loginAndIdentifyUser({
        email: variables.email,
        password: variables.password,
        tenantSlug: variables.tenant,
        name: variables.name,
        authKitSignIn,
      })
    },
  })


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
    formMethods.clearErrors();
    setFormError(null);
    const formData = formMethods.getValues();

    signup({
      email: formData.email,
      name: formData.name,
      password: formData.password,
      tenant: formData.organizationURL
    })
  };

  const handleBack = () => {
    setStep("organizationInfo");
    trackSignupStepMovedBack();
  };

  return (
    <>
    <FormProvider {...formMethods}>
      {step === "organizationInfo" ? (
        <SignupOrganizationInfoStep
          onSubmit={formMethods.handleSubmit(handleOrganizationInfoSubmit)}
        />
      ) : (
        <SignupCredentialsStep
          onSubmit={formMethods.handleSubmit(handleCredentialsSubmit)}
          onBack={handleBack}
          loading={isLoginPending || isSignupPending}
        />
      )}
      {formError && <div className="text-destructive">{formError}</div>}
    </FormProvider>

    <div className="text-sm text-muted-foreground">
      Already a member of an Organization?{" "}
      <Link
        to="/login"
        className={`
          underline text-foreground text-nowrap
          ${isLoginPending || isSignupPending ? 'pointer-events-none text-muted-foreground/50 no-underline' : ''}
        `}
      >
        Log in
      </Link>
    </div>
    </>
  );
}

export default SignupForm;

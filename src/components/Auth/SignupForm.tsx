import { trackSignedIn, trackSignupStepCompleted, trackSignupStepMovedBack } from "@/analytics";
import { useState, useRef, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SignupOrganizationInfoStep from "./SignupOrganizationInfoStep";
import SignupCredentialsStep from "./SignupCredentialsStep";
import zValidations from "./fields/zValidations";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import useSignup from "@/services/auth/mutations/useSignup";
import { useLoginWithIdentification } from "@/services/auth/mutations/useLoginWithIdentification";
import useCheckTenantAvailability from "@/services/auth/queries/useCheckTenantAvailability";
import { useDebounce } from "@/hooks/useDebounce";

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
  const [hasModifiedOrgName, setHasModifiedOrgName] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const passwordFieldRef = useRef<HTMLInputElement>(null);

  const { login, isLoading: isLoginLoading } = useLoginWithIdentification({});
  const { mutateAsync: signup, isPending: isSignupLoading } = useSignup({
    onError: (error) => handleSignupErrors(error),
  });

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

  const debouncedOrgName = useDebounce(formMethods.watch("organizationName"), 500);
  
  const { 
    data: isTenantAvailable,
    isLoading: isCheckingTenant,
    error: tenantError
  } = useCheckTenantAvailability(debouncedOrgName, {
    retry: false
  });

  useEffect(() => {
    if (tenantError) {
      toast.error("Unable to verify organization name. Please try again.");
    }
  }, [tenantError]);

  const handleOrganizationInfoSubmit = () => {
    formMethods.trigger("organizationName").then(isValid => {
      if (!isValid || !hasModifiedOrgName || !isTenantAvailable) return;
      
      trackSignupStepCompleted(1, formMethods.getValues("organizationName"));
      setStep("credentials");
    });
  };

  const handleSignupErrors = (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (isAxiosError(error)) {
      const responseError = (error.response?.data?.errors as any)?.error; // eslint-disable-line @typescript-eslint/no-explicit-any

      if (responseError?.includes("tenant name already exists")) {
        setStep("organizationInfo");
        formMethods.setError("organizationName", { 
          type: "manual", 
          message: "This Organization Name is taken. Create a unique one or log in." 
        });
        setHasModifiedOrgName(false);
        return setTimeout(() => {
          formMethods.setFocus("organizationName");
        }, 0);
      }

      if (responseError?.includes("Field validation for 'Password' failed on the 'password_regex' tag")) {
        formMethods.setError("password", { type: "manual", message: "Password contains invalid characters. Use only letters, numbers, and these special characters: _!@#$%^&*()-" });
        return passwordFieldRef.current?.focus();
      }
    }

    console.error("Non-Axios error:", error);
    setFormError("Signup failed. Please try again.");
  };

  const handleCredentialsSubmit = async () => {
    formMethods.clearErrors();
    setFormError(null);
    const formData = formMethods.getValues();
    const maxLoginRetries = 6;
    const loginRetryDelay = 3000;

    const tryLogin = async (): Promise<boolean> => {
      try {
        await login({
          email: formData.email,
          password: formData.password,
          tenantSlug: formData.organizationURL,
          name: formData.name,
        });
        return true;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    };

    try {
      setLoading(true);
      
      await signup({
        email: formData.email,
        name: formData.name,
        password: formData.password,
        tenant: formData.organizationURL,
      });

      trackSignupStepCompleted(2, formMethods.getValues("organizationName"));

      await new Promise(resolve => setTimeout(resolve, loginRetryDelay));

      for (let attempt = 1; attempt <= maxLoginRetries; attempt++) {
        const hasSignedIn = await tryLogin();
        if (hasSignedIn) {
          trackSignedIn(formData.organizationURL);
          return navigate(`/${formData.organizationURL}/agents`);
        }
        console.error(`Login attempt ${attempt} failed`);
        if (attempt < maxLoginRetries) {
          await new Promise(resolve => setTimeout(resolve, loginRetryDelay));
        }
      }

      toast.success('Organization created successfully', {
        description: 'You can now log in with your credentials',
      });
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

  const isLoading = isSignupLoading || isLoginLoading || loading;

  formMethods.watch((_, { name }) => {
    if (name === "organizationName") {
      setHasModifiedOrgName(true);
    }
    if (name === "password") {
      formMethods.clearErrors("password");
    }
  });

  return (
    <>
      <FormProvider {...formMethods}>
        {step === "organizationInfo" ? (
          <SignupOrganizationInfoStep
            onSubmit={formMethods.handleSubmit(handleOrganizationInfoSubmit)}
            disabled={!hasModifiedOrgName || !isTenantAvailable}
            tenantValidationState={{
              isChecking: isCheckingTenant,
              isAvailable: isTenantAvailable,
              error: tenantError
            }}
          />
        ) : (
          <SignupCredentialsStep
            onSubmit={formMethods.handleSubmit(handleCredentialsSubmit)}
            onBack={handleBack}
            loading={isLoading}
            passwordRef={passwordFieldRef}
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
          ${isLoading ? 'pointer-events-none text-muted-foreground/50 no-underline' : ''}
        `}
        >
          Log in
        </Link>
      </div>
    </>
  );
}

export default SignupForm;

import { trackLoginStepCompleted, trackLoginStepMovedBack, trackSignedIn } from "@/analytics";
import { FormProvider, useForm } from "react-hook-form";
import { useState, useCallback } from "react";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
<<<<<<< Updated upstream
import { AxiosError, isAxiosError } from "axios";
import { LoginOrganizationURLStep } from "./LoginOrganizationURLStep";
import { LoginCredentialsStep } from "./LoginCredentialsStep";
import zValidations from "./fields/zValidations";
import { ApiHttpError } from "@/types";
import { LoginAndIdentifyParams } from "@/services/auth/Auth.interfaces";
import useLoginAndIdentifyUser from "@/services/auth/mutations/useLoginAndIdentifyUser";
=======
import { isAxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { loginAndIdentifyUser } from "@/services/auth/authHelpers";
import { loginWithGoogle } from '@/services/auth/authService';
import { identifyUserAndPrepareState } from "@/services/auth/authHelpers";
import { GoogleSignInButtonRenderer } from './GoogleSignInButtonRenderer';

import { LoginOrganizationURLStep } from "./LoginOrganizationURLStep";
import { LoginCredentialsStep } from "./LoginCredentialsStep";
import zValidations from "./fields/zValidations";

// Removed unused interface definition for decoded Google JWT
// interface DecodedJwt {
//   email?: string;
//   // Add other fields you might need from the Google JWT payload
// }

interface DecodedGoogleCredential {
  email?: string;
  // Add other fields if needed
}
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
=======
  const [loading, setLoading] = useState<boolean>(false);
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
>>>>>>> Stashed changes
  const [formError, setFormError] = useState<string | null>(null);
  const authKitSignIn = useSignIn();
  const navigate = useNavigate();

  const { mutate: loginAndIdentifyUser, isPending: isLoginPending } = useLoginAndIdentifyUser({
    onError: (error: AxiosError<ApiHttpError>) => {
      const stockError = "Login failed. Please try again.";
      if (isAxiosError(error)) {
        const responseError = error.response?.data?.errors?.error;
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
    },
    onSuccess: (_, variables: LoginAndIdentifyParams) => {
      trackSignedIn(variables.tenantSlug);
      return navigate(`/${variables.tenantSlug}/agents`);
    },
  })

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
    formMethods.clearErrors();
    setFormError(null);

<<<<<<< Updated upstream
    const formData = formMethods.getValues();
    loginAndIdentifyUser({
      email: data.email!,
      password: data.password!,
      tenantSlug: formData.organizationURL!,
      authKitSignIn,
    });
=======
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
>>>>>>> Stashed changes
  };

  const handleGoogleTokenResponse = async (credentialResponse: any) => {
    setIsApiLoading(true);
    setGoogleError(null);
    try {
      if (!credentialResponse.credential) {
        throw new Error("Google credential not found.");
      }

      // 1. Send Google token to backend
      const formData = formMethods.getValues();
      const googleResponse = await loginWithGoogle(credentialResponse.credential, formData.organizationURL!, { suppressToast: true });
      const token = googleResponse.jwt;

      if (!token) {
        throw new Error("Failed to retrieve authentication token.");
      }

      // Decode Google credential for preferred email
      let preferredEmail: string | undefined;
      try {
        const decodedCredential = jwtDecode<DecodedGoogleCredential>(credentialResponse.credential);
        preferredEmail = decodedCredential.email;
      } catch (decodeError) {
        console.warn("Could not decode Google credential to get email:", decodeError);
      }

      // 2. Identify user, check activity, and prepare state using helper
      const userState = await identifyUserAndPrepareState(
        token, 
        formData.organizationURL!, 
        preferredEmail
      );

      // 3. Sign in with react-auth-kit (userState comes from helper)
      const isSignedIn = authKitSignIn({
        auth: {
          token,
          type: 'Bearer'
        },
        userState,
      });

      if (isSignedIn) {
        toast.success("Signed in successfully!");
        navigate(`/${formData.organizationURL}/agents`); // Redirect to dashboard or home
        // TODO: Add analytics identify call similar to loginAndIdentifyUser if needed
      } else {
        throw new Error("Failed to sign in with react-auth-kit.");
      }

    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      const message = error.message || 'An unexpected error occurred during Google Sign-In.';
      setGoogleError(message);
      toast.error(message);
    } finally {
      setIsApiLoading(false);
    }
  };

  const handleGoogleError = useCallback((error: any) => {
    console.error('Google Button Rendering/Callback Error:', error);
    setGoogleError('Google Sign-In failed to initialize or process. Please ensure popups are enabled and try again.');
    setIsApiLoading(false); // Ensure API loading is false if init fails
  }, []);

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
            loading={isLoginPending}
          />
        )}
        {step === 'credentials' && (
          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <GoogleSignInButtonRenderer 
              onTokenReceived={handleGoogleTokenResponse}
              onError={handleGoogleError} 
            />
            {/* Display error message *outside* the container div */}
            {googleError && <p className="text-sm text-red-600 mt-1 text-center">Error: {googleError}</p>}
            {/* Display API loading state */}
            {isApiLoading && <p className="text-sm text-muted-foreground mt-1 text-center">Verifying...</p>}
          </div>
        )}
        {formError ? <div className="text-destructive mt-2">{formError}</div> : null}
      </FormProvider>

      <div className="text-sm text-muted-foreground">
        Don't have an Organization yet?{" "}
        <Link
          to="/signup"
          className={`
            underline text-foreground text-nowrap
            ${isLoginPending ? 'pointer-events-none text-muted-foreground/50 no-underline' : ''}
          `}
        >
          Sign up for one
        </Link>
      </div>
    </>
  );
}

export default LoginForm;

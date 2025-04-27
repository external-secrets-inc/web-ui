import { trackLoginStepCompleted, trackLoginStepMovedBack, trackSignedIn } from "@/analytics";
import { FormProvider, useForm } from "react-hook-form";
import { useState } from "react";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError, AxiosError } from "axios";
import zValidations from "./fields/zValidations";
import { LoginCredentialsStep } from "./LoginCredentialsStep";
import { LoginOrganizationURLStep } from "./LoginOrganizationURLStep";
import { ApiHttpError } from "@/types";
import { LoginAndIdentifyParams } from "@/services/auth/Auth.interfaces";
import useLoginAndIdentifyUser from "@/services/auth/mutations/useLoginAndIdentifyUser";
import { toast } from "sonner";
import { DecodedJwt, identifyUserAndPrepareState, loginWithGoogle, UserAuthState } from "@/services/auth/authHelpers";
import { jwtDecode } from "jwt-decode";
import { CredentialResponse } from '@react-oauth/google';
import { GoogleSignInButtonRenderer } from './GoogleSignInButtonRenderer';

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
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const authKitSignIn = useSignIn();
  const navigate = useNavigate();

  const { mutate: loginAndIdentifyUser, isPending: isLoginPending } = useLoginAndIdentifyUser({
    onError: (error: AxiosError<ApiHttpError>, variables: LoginAndIdentifyParams) => {
      const stockError = "Login failed. Please check your credentials and try again.";
      let errorMessage = stockError;
      if (isAxiosError(error) && error.response) {
        const apiError = error.response?.data?.errors?.error;
        errorMessage = (typeof apiError === 'string' && apiError.length > 0) ? apiError : stockError;
        if (error.response?.status === 404) {
          errorMessage = `Organization '${variables.tenantSlug}' not found.`;
        }
      } else {
        console.error("Non-Axios error:", error);
      }
      setFormError(errorMessage);
    },
    onSuccess: (isSignedIn) => {
      if (isSignedIn) {
        const { organizationURL } = formMethods.getValues();
        trackSignedIn(String(organizationURL));
        navigate(`/${String(organizationURL)}/agents`);
      } else {
        setFormError("Login failed after identification.");
      }
    },
  });

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

    const formData = formMethods.getValues();
    try {
      await loginAndIdentifyUser({
        email: data.email!,
        password: data.password!,
        tenantSlug: String(formData.organizationURL!),
        authKitSignIn,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else if (typeof err === 'string') {
        setFormError(err);
      } else {
        setFormError("An unexpected error occurred during login.");
      }
    }
  };

  const handleGoogleTokenResponse = async (credentialResponse: CredentialResponse) => {
    setIsApiLoading(true);
    setGoogleError(null);
    setFormError(null);

    const { credential: idToken } = credentialResponse;
    if (!idToken) {
      setGoogleError("Google Sign-In failed: No ID token received.");
      setIsApiLoading(false);
      return;
    }

    const formData = formMethods.getValues();
    const tenantSlug = String(formData.organizationURL);
    let preferredEmail: string | undefined;

    try {
      const decodedGoogleToken = jwtDecode<DecodedJwt>(idToken);
      preferredEmail = decodedGoogleToken.email;

      // 1. Call backend
      const backendResponse = await loginWithGoogle(idToken, tenantSlug);
      const backendToken = backendResponse.jwt;
      
      // 2. Identify & Prepare State
      // Pass only the necessary arguments. 'token' (backendToken) is the first arg.
      const userState: UserAuthState = await identifyUserAndPrepareState(backendToken, tenantSlug, preferredEmail);

      // 3. Sign In with Auth Kit
      const isSignedIn = authKitSignIn({
        auth: {
          token: backendToken,
          type: 'Bearer'
        },
        userState: userState
      });

      if (isSignedIn) {
        trackSignedIn(tenantSlug);
        navigate(`/${tenantSlug}/agents`);
      } else {
        setGoogleError("Failed to sign in after Google authentication.");
      }

    } catch (err: unknown) {
      console.error("Google Sign-In Error:", err);
      let errorMessage = "An unexpected error occurred during Google Sign-In.";
      if (err instanceof Error && err.message?.includes("inactive")) {
        errorMessage = "Your account is inactive. Please contact support.";
      } else if (isAxiosError(err)) {
        errorMessage = err.response?.data?.errors?.error || "Failed to authenticate with Google.";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setGoogleError(errorMessage);
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsApiLoading(false);
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
            loading={isLoginPending || isApiLoading}
          />
        )}
        {formError && <div className="text-sm text-destructive mt-2">{formError}</div>}
        {googleError && <div className="text-sm text-destructive mt-2">{googleError}</div>}
      </FormProvider>

      {step === "credentials" && (
        <>
          <div className="relative my-4">
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
            onError={(error: string | Error) => {
              const errorMessage = error instanceof Error ? error.message : error;
              setGoogleError(errorMessage);
            }} 
          />
        </>
      )}

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

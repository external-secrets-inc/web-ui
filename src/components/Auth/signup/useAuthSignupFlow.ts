import { trackSignedIn, trackSignupStepCompleted, trackSignupStepMovedBack } from "@/analytics";
import { AUTH_ERROR_MESSAGES, authCommonZodSchemas, createAuthError } from "@/components/Auth";
import { LoginAndIdentifyParams, SignupPayload } from "@/services/auth/Auth.interfaces";
import type { LoginResult } from "@/services/auth/mutations/useLoginAndIdentifyUser";
import useLoginAndIdentifyUser from "@/services/auth/mutations/useLoginAndIdentifyUser";
import useSignup from "@/services/auth/mutations/useSignup";
import { isTenantRegistered, isTenantAvailable, useGetTenantByName } from "@/services/tenants/queries/useGetTenantByName";
import { ApiHttpError } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { defineStepper, Step } from "@stepperize/react";
import { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const MAX_LOGIN_RETRIES = 4;

const OrganizationInfoSchema = z.object({
  organizationName: authCommonZodSchemas.organizationName,
  name: authCommonZodSchemas.name,
  organizationURL: authCommonZodSchemas.organizationURL,
});

const CredentialsSchema = z.object({
  email: authCommonZodSchemas.email,
  password: authCommonZodSchemas.newPassword,
});

type OrgInfoData = z.infer<typeof OrganizationInfoSchema>;
type CredentialsData = z.infer<typeof CredentialsSchema>;
type SignupData = OrgInfoData & CredentialsData;

const signupSteps = [
  { id: "organizationInfo", label: "Organization Info", schema: OrganizationInfoSchema },
  { id: "credentials", label: "Credentials", schema: CredentialsSchema }
];

const { useStepper } = defineStepper(...signupSteps);

export function useAuthSignupFlow() {
  const [formError, setFormError] = useState<string | null>(null);
  const [shouldCheckTenant, setShouldCheckTenant] = useState<boolean>(false);
  const [tenantNameToCheckQuery, setTenantNameToCheckQuery] = useState<string>("");
  const authKitSignIn = useSignIn();
  const navigate = useNavigate();
  const stepperMethods = useStepper();
  const { next, prev, isLast, current: currentStep, all: steps } = stepperMethods;

  const form = useForm<SignupData>({
    resolver: zodResolver(currentStep.schema),
    defaultValues: {
      organizationName: "",
      name: "",
      organizationURL: "",
      email: "",
      password: "",
    },
  });

  const {
    data: tenantCheckResult,
    error: tenantError,
    status: tenantStatus,
    isFetching: isCheckingTenant
  } = useGetTenantByName(
    tenantNameToCheckQuery,
    {
      enabled: shouldCheckTenant && !!tenantNameToCheckQuery,
      throwOnError: false
    }
  );

  const { mutate: loginAndIdentifyUser, isPending: isLoginPending } = useLoginAndIdentifyUser({
    onSuccess: (data: LoginResult, variables: LoginAndIdentifyParams) => {
      if (data.isSignedIn) {
        trackSignedIn(variables.tenantSlug);
        navigate('/verify', { state: { fromSignup: true } });
      } else {
        toast.success('Organization created, but login failed. Please try logging in manually.');
        navigate('/login');
      }
    },
    retry: (failureCount) => {
      if (failureCount < MAX_LOGIN_RETRIES) return true;

      toast.success('Organization created successfully', {
        description: 'You can now log in with your credentials',
      });
      navigate('/login');
      return false;
    }
  });

  const { mutate: signup, isPending: isSignupPending } = useSignup({
    onError: (error: AxiosError<ApiHttpError>) => {
      const authError = createAuthError(error);

      if (authError.type === 'validation' && authError.field) {
        if (authError.field === 'password') {
          form.setError('password', {
            type: "manual",
            message: authError.message
          });
          setTimeout(() => { form.setFocus('password'); }, 0);
          return;
        }
      }

      setFormError(authError.message);
    },
    onSuccess: (_, variables: SignupPayload) => {
      trackSignupStepCompleted(steps.findIndex((s: Step) => s.id === currentStep.id) + 1, variables.tenant);
      loginAndIdentifyUser({
        email: variables.email,
        password: variables.password,
        tenantSlug: variables.tenant,
        name: variables.name,
        authKitSignIn,
      });
    },
  });

  const handleStepChange = useCallback(() => {
    setFormError(null);
    form.reset(form.getValues(), {
      keepValues: true,
      keepDirty: true,
      keepErrors: false,
      keepTouched: false,
      keepIsSubmitted: false,
      keepIsValid: false,
      keepSubmitCount: false
    });
  }, [form]);

  useEffect(() => {
    handleStepChange();
  }, [handleStepChange]);

  useEffect(() => {
    if (!shouldCheckTenant || isCheckingTenant) {
      return;
    }

    if (tenantStatus === 'success') {
      if (isTenantRegistered(tenantCheckResult)) {
        form.setError("organizationURL", {
          type: "manual",
          message: AUTH_ERROR_MESSAGES.TENANT_TAKEN
        });
        setTimeout(() => { form.setFocus("organizationURL"); }, 0);
      } else if (isTenantAvailable(tenantCheckResult)) {
        trackSignupStepCompleted(steps.findIndex((s: Step) => s.id === currentStep.id) + 1, form.getValues("organizationName"));
        next();
      }
    } else if (tenantStatus === 'error') {
      const authError = createAuthError(tenantError);
      setFormError(authError.message);
    }

    setShouldCheckTenant(false);

  }, [tenantStatus, tenantCheckResult, tenantError, shouldCheckTenant, steps, currentStep.id, next, form, tenantNameToCheckQuery, isCheckingTenant]);

  const handleAttemptSubmit = useCallback(async (data: Partial<SignupData>) => {
    setFormError(null);

    if (currentStep.id === 'organizationInfo') {
      const tenantName = form.getValues("organizationURL");

      if (!tenantName) {
        form.trigger("organizationURL");
        return;
      }

      setTenantNameToCheckQuery(tenantName);
      setShouldCheckTenant(true);

    } else if (currentStep.id === 'credentials' && isLast) {
      const formData = { ...form.getValues(), ...data };

      if (!formData.email || !formData.password || !formData.name || !formData.organizationName || !formData.organizationURL) {
        setFormError(AUTH_ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
        return;
      }

      signup({
        email: formData.email,
        name: formData.name,
        password: formData.password,
        tenant: formData.organizationURL
      });
    }
  }, [currentStep.id, isLast, form, signup]);

  const handleGoBack = useCallback(() => {
    prev();
    trackSignupStepMovedBack();
  }, [prev]);

  const isLoadingCoreFlow = isLoginPending || isSignupPending || isCheckingTenant;

  return {
    form,
    stepperMethods,
    handleAttemptSubmit,
    handleGoBack,
    formError,
    isLoadingCoreFlow,
  };
}
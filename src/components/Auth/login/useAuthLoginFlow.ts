import { trackLoginStepCompleted, trackSignedIn, trackLoginStepMovedBack } from "@/analytics";
import { AUTH_ERROR_MESSAGES, authCommonZodSchemas, createAuthError } from "@/components/Auth";
import type { LoginResult } from "@/services/auth/mutations/useLoginAndIdentifyUser";
import useLoginAndIdentifyUser from "@/services/auth/mutations/useLoginAndIdentifyUser";
import type { LoginAndIdentifyParams } from "@/services/auth/Auth.interfaces";
import { isTenantRegistered, isTenantAvailable, useGetTenantByName } from "@/services/tenants/queries/useGetTenantByName";
import { ApiHttpError } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { defineStepper, Step } from "@stepperize/react";
import { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const OrganizationURLSchema = z.object({
  organizationURL: authCommonZodSchemas.organizationURL,
});

const CredentialsSchema = z.object({
  email: authCommonZodSchemas.email,
  password: authCommonZodSchemas.existingPassword,
});

type OrgURLData = z.infer<typeof OrganizationURLSchema>;
type CredentialsData = z.infer<typeof CredentialsSchema>;
type LoginData = OrgURLData & CredentialsData;

const loginSteps = [
  { id: "organizationURL", label: "Organization URL", schema: OrganizationURLSchema },
  { id: "credentials", label: "Credentials", schema: CredentialsSchema }
];

const { useStepper } = defineStepper(...loginSteps);

export function useAuthLoginFlow(
  onStepChange: (stepId: string) => void,
  onOrganizationURLChange: (tenantId: string) => void
) {
  const [formError, setFormError] = useState<string | null>(null);
  const [shouldCheckTenant, setShouldCheckTenant] = useState<boolean>(false);
  const [tenantNameToCheckQuery, setTenantNameToCheckQuery] = useState<string>("");

  const authKitSignIn = useSignIn();
  const navigate = useNavigate();
  const stepperMethods = useStepper();
  const { next, isLast, current: currentStep, all: steps, prev } = stepperMethods;

  const form = useForm<LoginData>({
    resolver: zodResolver(currentStep.schema),
    defaultValues: {
      organizationURL: "",
      email: "",
      password: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
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
    onError: (error: AxiosError<ApiHttpError>) => {
      const authError = createAuthError(error);

      if (authError.type === 'validation' && authError.field) {
        if (authError.field === 'email') {
          form.setError('email', { type: "manual", message: authError.message });
          setTimeout(() => { form.setFocus('email'); }, 0);
          return;
        }
        if (authError.field === 'password') {
          form.setError('password', { type: "manual", message: authError.message });
          setTimeout(() => { form.setFocus('password'); }, 0);
          return;
        }
      }

      setFormError(authError.message);
    },
    onSuccess: (data: LoginResult, variables: LoginAndIdentifyParams) => {
      if (data.isSignedIn) {
        trackSignedIn(variables.tenantSlug);
        navigate('/');
      } else {
        setFormError("Login failed after identification.");
      }
    },
  });

  const handleStepChange = useCallback(() => {
    onStepChange(currentStep.id);

    if (currentStep.id === 'credentials') {
      const formData = form.getValues();
      if (typeof formData.organizationURL === 'string') {
        onOrganizationURLChange(formData.organizationURL);
      }
    }

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
  }, [currentStep.id, onStepChange, onOrganizationURLChange, form]);

  useEffect(() => {
    handleStepChange();
  }, [handleStepChange]);

  useEffect(() => {
    if (!shouldCheckTenant || isCheckingTenant) {
      return;
    }

    if (tenantStatus === 'success') {
      if (isTenantRegistered(tenantCheckResult)) {
        trackLoginStepCompleted(steps.findIndex((s: Step) => s.id === currentStep.id) + 1);
        next();
      } else if (isTenantAvailable(tenantCheckResult)) {
        form.setError("organizationURL", {
          type: "manual",
          message: AUTH_ERROR_MESSAGES.TENANT_NOT_FOUND.replace("Organization", `Organization '${tenantNameToCheckQuery}'`)
        });
        setTimeout(() => { form.setFocus("organizationURL"); }, 0);
      }
    } else if (tenantStatus === 'error') {
      const authError = createAuthError(tenantError);
      setFormError(authError.message);
    }

    setShouldCheckTenant(false);
  }, [tenantStatus, tenantCheckResult, tenantError, shouldCheckTenant, steps, currentStep.id, next, form, tenantNameToCheckQuery, isCheckingTenant]);

  const handleAttemptSubmit = useCallback(async (data: Partial<LoginData>) => {
    setFormError(null);

    if (currentStep.id === 'organizationURL') {
      const tenantName = data.organizationURL;
      if (!tenantName) {
        form.trigger("organizationURL");
        return;
      }
      setTenantNameToCheckQuery(tenantName);
      setShouldCheckTenant(true);
    } else if (currentStep.id === 'credentials' && isLast) {
      const formData = { ...form.getValues(), ...data };
      if (!formData.email || !formData.password || !formData.organizationURL) {
        setFormError(AUTH_ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
        return;
      }

      loginAndIdentifyUser({
        email: formData.email,
        password: formData.password,
        tenantSlug: String(formData.organizationURL),
        authKitSignIn,
      });
    } else if (!isLast) {
      next();
    }
  }, [currentStep, isLast, next, form, loginAndIdentifyUser, authKitSignIn, setTenantNameToCheckQuery, setShouldCheckTenant]);

  const handleGoBack = useCallback(() => {
    prev();
    trackLoginStepMovedBack();
  }, [prev]);

  const isLoadingCoreFlow = isLoginPending || isCheckingTenant;

  return {
    form,
    stepperMethods,
    handleAttemptSubmit,
    handleGoBack,
    formError,
    isLoadingCoreFlow,
  };
}
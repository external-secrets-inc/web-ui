import { authCommonZodSchemas, createAuthError } from "@/components/Auth";
import { ONE_MINUTE_IN_SECONDS, ONE_SECOND_IN_MILLISECONDS } from "@/constants";
import useForgotPassword from "@/services/forgotPassword/mutations/useForgotPassword";
import { ApiHttpError } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import Cookies from 'js-cookie';
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ForgotPasswordSchema = z.object({
  tenant: authCommonZodSchemas.organizationURL,
  email: authCommonZodSchemas.email,
});

type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;

export function useAuthForgotPasswordFlow(defaultTenant: string = "", defaultEmail: string = "") {
  const [formError, setFormError] = useState<string>("");
  const toastIdRef = useRef<string | number | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const tenantInputRef = useRef<HTMLInputElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: defaultEmail,
      tenant: defaultTenant,
    },
  });

  const { mutate: forgotPassword, isPending: isLoading } = useForgotPassword({
    onSuccess: (_, variables: ForgotPasswordData) => {
      const tenMinutesFromNow = new Date(new Date().getTime() + 10 * ONE_MINUTE_IN_SECONDS * ONE_SECOND_IN_MILLISECONDS);

      Cookies.set("forgotPasswordHelperOrganizationURL", variables.tenant, { expires: tenMinutesFromNow });
      Cookies.set("forgotPasswordHelperEmail", variables.email, { expires: tenMinutesFromNow });

      toastIdRef.current = toast.success('Check your email', {
        description: 'If an account matching your details was found, instructions to reset your password have been sent.',
        duration: Infinity,
        cancel: {
          label: 'Dismiss',
          onClick: () => { },
        },
      });
      setFormError("");
    },
    onError: (error: AxiosError) => {
      console.error("Forgot password request encountered an error:", error);
      const authError = createAuthError(error);

      // Determine if this error signifies a "user/org not found" scenario or similar
      // which should be masked with a generic success message for security reasons.
      const responseData = error.response?.data as Partial<ApiHttpError> | undefined;
      const specificApiError = responseData?.errors?.error;

      const shouldMaskError = error instanceof AxiosError &&
        error.response &&
        (
          error.response.status === 401 || // Standard "Unauthorized" often implies not found here
          error.response.status === 404 || // Standard "Not Found"
          (error.response.status === 422 && specificApiError === 'invalid username/password') // Current backend specific case
        );

      if (shouldMaskError) {
        // For "not found" type errors, show the generic success toast to prevent enumeration
        toastIdRef.current = toast.success('Check your email', {
          description: 'If an account matching your details was found, instructions to reset your password have been sent.',
          duration: Infinity,
          cancel: { label: 'Dismiss', onClick: () => { } },
        });
        setFormError("");
      } else {
        setFormError(authError.message);
      }
    }
  });

  const handleSubmit = useCallback((values: ForgotPasswordData) => {
    setFormError("");
    forgotPassword(values);
  }, [forgotPassword]);

  const handleDismissToast = useCallback(() => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }
  }, []);

  return {
    form,
    handleSubmit,
    formError,
    isLoading,
    emailInputRef,
    tenantInputRef,
    submitButtonRef,
    handleDismissToast
  };
}
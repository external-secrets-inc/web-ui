import { authCommonZodSchemas, createAuthError } from "@/components/Auth";
import useResetPassword from "@/services/forgotPassword/mutations/useResetPassword";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import Cookies from 'js-cookie';
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const ResetPasswordSchema = z.object({
  tenant: authCommonZodSchemas.organizationURL,
  email: authCommonZodSchemas.email,
  token: z.string(),
  password: authCommonZodSchemas.newPassword,
});

export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;
export type ResetPasswordField = keyof ResetPasswordData;

interface UseResetPasswordFlowProps {
  defaultTenant?: string;
  defaultEmail?: string;
  token?: string;
}

export function useAuthResetPasswordFlow({
  defaultTenant = "",
  defaultEmail = "",
  token = ""
}: UseResetPasswordFlowProps = {}) {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string>("");
  const [submittedWithErrors, setSubmittedWithErrors] = useState(false);

  const newPasswordRef = useRef<HTMLInputElement>(null);
  const tenantInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      tenant: defaultTenant,
      email: defaultEmail,
      token: token,
      password: "",
    },
  });

  const { mutate: resetPassword, isPending: isLoading } = useResetPassword({
    onSuccess: () => {
      toast.success('Password updated successfully', { description: 'Please log in' });
      Cookies.remove("forgotPasswordHelperOrganizationURL");
      Cookies.remove("forgotPasswordHelperEmail");
      navigate('/login');
    },
    onError: (error: AxiosError) => {
      const authError = createAuthError(error);

      if (authError.type === 'validation' && authError.field) {
        form.setError(authError.field as ResetPasswordField, {
          type: "manual",
          message: authError.message
        });
        return;
      }

      setFormError(authError.message);
    }
  });

  const handleSubmit = useCallback((data: ResetPasswordData) => {
    setSubmittedWithErrors(false);
    setFormError("");
    resetPassword(data);
  }, [resetPassword]);

  const handleError = useCallback(() => {
    setSubmittedWithErrors(true);
    setFormError("Please check the form for errors");
  }, []);

  return {
    form,
    handleSubmit,
    handleError,
    formError,
    isLoading,
    submittedWithErrors,
    newPasswordRef,
    tenantInputRef,
    emailInputRef
  };
}
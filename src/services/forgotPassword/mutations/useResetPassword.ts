import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { ResetPasswordPayload } from "@/services/forgotPassword/ForgotPassword.interfaces";

const resetPassword = async (payload: ResetPasswordPayload) => {
  const response = await axiosInstance.post("/public/auth/reset-password", payload);
  return response.status;
}


const useResetPassword = (
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>, ResetPasswordPayload>, 'mutationKey' | 'mutationFn'>
) => {

  return useMutation({
    mutationKey: ["useResetPassword"],
    mutationFn: (variables: ResetPasswordPayload) => resetPassword(variables),
    ...options,
  });
};

export default useResetPassword;

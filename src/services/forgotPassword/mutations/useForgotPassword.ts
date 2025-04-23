import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { ForgotPasswordPayload } from "@/services/forgotPassword/ForgotPassword.interfaces";

const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const response = await axiosInstance.post("/public/auth/forgot-password", payload);
  return response.status;
}


const useForgotPassword = (
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>, ForgotPasswordPayload>, 'mutationKey' | 'mutationFn'>
) => {

  return useMutation({
    mutationKey: ["useForgotPassword"],
    mutationFn: (variables: ForgotPasswordPayload) => forgotPassword(variables),
    ...options,
  });
};

export default useForgotPassword;

import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

interface SignupPayload {
  email: string;
  name: string;
  password: string;
  tenant: string;
}

interface SignupResponse {
  tenantId: string;
  userId: string;
}

const signupUser = async (payload: SignupPayload) => {
  const response = await axiosInstance.post('/public/auth/signup', payload);
  return response.data;
}

const useSignup = (
  options?: Omit<UseMutationOptions<SignupResponse, AxiosError<ApiHttpError>, SignupPayload>, 'mutationKey' | 'mutationFn'>
) => {
  return useMutation({
    mutationKey: ["useSignup"],
    mutationFn: (variables: SignupPayload) => {
      return signupUser(variables)
    },
    ...options,
  });
};

export default useSignup; 
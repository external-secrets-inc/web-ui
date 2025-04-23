import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { SignupPayload } from "@/services/auth/Auth.interfaces";

const signup = async (payload: SignupPayload): Promise<number> => {
  const response = await axiosInstance.post('/public/auth/signup', payload);
  return response.status;
};

const useSignup = (
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>, SignupPayload>, 'mutationKey' | 'mutationFn'>
) => {

  return useMutation({
    mutationKey: ["useSignup"],
    mutationFn: (variables: SignupPayload) => signup(variables),
    ...options,
  });
};

export default useSignup;

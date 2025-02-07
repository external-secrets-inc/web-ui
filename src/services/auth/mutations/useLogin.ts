import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { login } from "../authService";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

interface LoginPayload {
  email: string;
  password: string;
  tenant: string;
}

interface LoginResponse {
  token: string;
  tenantId: string | null;
  tenant: string;
  userId: string | null;
}

const useLogin = (
  options?: Omit<UseMutationOptions<LoginResponse, AxiosError<ApiHttpError>, LoginPayload>, 'mutationKey' | 'mutationFn'>
) => {
  return useMutation({
    mutationKey: ["useLogin"],
    mutationFn: (variables: LoginPayload) => login(variables.email, variables.password, variables.tenant),
    ...options,
  });
};

export default useLogin; 
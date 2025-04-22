import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { LoginPayload, LoginResponse } from "@/services/auth/Auth.interfaces";
import { getTenantIdFromToken, getUserIdFromToken } from "@/lib/utils";

const performLogin = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await axiosInstance.post('/public/auth/login', payload);
  const token = response.data.token;
  const tenantId = getTenantIdFromToken(token) || "";
  const userId = getUserIdFromToken(token) || "";

  return {
    token: token,
    tenantId: tenantId,
    tenant:payload.tenant,
    userId: userId,
  };
};

const usePerformLogin = (
  options?: Omit<UseMutationOptions<LoginResponse, AxiosError<ApiHttpError>, LoginPayload>, 'mutationKey' | 'mutationFn'>
) => {

  return useMutation({
    mutationKey: ["usePerformLogin"],
    mutationFn: (variables: LoginPayload) => performLogin(variables),
    ...options,
  });
};

export { usePerformLogin as default, performLogin };

import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

const createInstallationToken = async (mock: boolean) => {
  if(mock) return 'mokedTokenValue'

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/audit/installation-token`, {}, { headers });
  return response.data.token;
}

const useCreateAuditInstallationToken = (
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, { mock: boolean }>, 'mutationKey' | 'mutationFn'>
) => {
  return useMutation({
    mutationKey: ["useCreateAuditInstallationToken"],
    mutationFn: (variables: { mock: boolean }) => {
      return createInstallationToken(variables.mock)
    },
    ...options,
  });
};

export default useCreateAuditInstallationToken;

import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/118
const createInstallationToken = async (mock: boolean) => {
  if(mock) return 'mockedTokenValue'

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

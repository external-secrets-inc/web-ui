import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { useAuditMock } from '@/components/Audit/AuditMockContext';

const createInstallationToken = async (mock: boolean, listenerId: string) => {
  if (mock) return 'mockedTokenValue'

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/listeners/${listenerId}/manifest-token`, {}, { headers });
  return response.data.token;
}

const useCreateTenantInstallationToken = (
  mock: boolean,
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, { id: string }>, 'mutationKey' | 'mutationFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useMutation({
    mutationKey: ["useCreateListenerInstallationToken", isMocked],
    mutationFn: (variables: { id: string }) => {
      return createInstallationToken(isMocked, variables.id)
    },
    ...options,
  });
};

export default useCreateTenantInstallationToken;

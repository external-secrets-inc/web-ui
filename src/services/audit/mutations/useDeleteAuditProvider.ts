import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/119
const deleteAuditProvider = async (mock: boolean, providerId: string) => {
  if(mock) return "MockedDeleteProviderToken"

  const headers = await getAuthHeaders();
  const response = await axiosInstance.delete(`/api/providers/${providerId}`, { headers, backend: 'AUDIT_POC' });
  return response.data.token;
}

const useDeleteAuditProvider = (
  mock: boolean,
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, { id: string }>, 'mutationKey' | 'mutationFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useMutation({
    mutationKey: ["useDeleteAuditProvider", isMocked],
    mutationFn: (variables: { id: string }) => {
      return deleteAuditProvider(isMocked, variables.id)
    },
    ...options,
  });
};

export default useDeleteAuditProvider;

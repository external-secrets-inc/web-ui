import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateProviderPayload } from "@/components/Audit/Audit.interfaces";
import { useAuditMock } from '@/components/Audit/AuditMockContext';

const createAuditProvider = async (mock: boolean, payload: CreateProviderPayload) => {
  if (mock) return 'mockedProviderID'

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/providers`, payload, { headers, backend: 'AUDIT_POC' });
  return response.data.id;
}

const useCreateAuditProvider = (
  mock: boolean,
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, CreateProviderPayload>, 'mutationKey' | 'mutationFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useMutation({
    mutationKey: ["useCreateAuditProvider", isMocked],
    mutationFn: (variables: CreateProviderPayload) => {
      return createAuditProvider(isMocked, variables)
    },
    ...options,
  });
};

export default useCreateAuditProvider;

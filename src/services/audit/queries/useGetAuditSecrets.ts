import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockAuditSecretsData } from "../mocks/mockData";
import { AuditSecretData } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

const getAuditSecrets = async (
  mock: boolean,
  listenerID: string,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockAuditSecretsData;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/secrets', { headers, signal, backend: 'AUDIT_POC', params: {"listener_id": listenerID} });
  return response.data;
}

const useGetAuditSecrets = (
  mock: boolean,
  listenerID: string,
  options?: Omit<UseQueryOptions<AuditSecretData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["useGetAuditSecrets", isMocked],
    queryFn: ({ signal }) => getAuditSecrets(isMocked, listenerID, signal),
    ...options,
  });
};

export default useGetAuditSecrets;

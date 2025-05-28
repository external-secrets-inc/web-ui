import { AuditMetric } from "@/components/Audit/Audit.interfaces";
import { mockNetworkResponseDelay, mockProviderStats } from "@/services/audit/mocks/mockData";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useAuditMock } from '@/components/Audit/AuditMockContext';

const getAuditProviderStats = async (mock: boolean, listenerID: string, signal: AbortSignal) => {
  // TODO: Remove this mock when the API is ready
  if (mock) {
    await mockNetworkResponseDelay();
    return mockProviderStats;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/dashboard/${listenerID}/secrets-by-provider`, { headers, signal, backend: 'AUDIT_POC', });
  return response.data;
}

const useGetAuditProviderStats = (
  mock: boolean,
  listenerID: string,
  options?: Omit<UseQueryOptions<AuditMetric[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);
  return useQuery({
    queryKey: ["audit", "useGetAuditProviderStats", isMocked],
    queryFn: ({ signal }) => getAuditProviderStats(isMocked, listenerID, signal),
    ...options,
  });
};

export default useGetAuditProviderStats;
import { AuditMetric } from "@/components/audit/Audit.interfaces";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockProblemStats } from "../mocks/mockData";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

const getAuditProblemStats = async (mock: boolean, listenerID: string, signal: AbortSignal) => {
  // TODO: Remove this mock when the API is ready
  if (mock) {
    await mockNetworkResponseDelay();
    return mockProblemStats;
  }
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/dashboard/${listenerID}/secret-issues`, {
    headers,
    signal,
    backend: 'AUDIT_POC',
  });
  return response.data;
}

const useGetAuditProblemStats = (
  mock: boolean,
  listenerID: string,
  options?: Omit<UseQueryOptions<AuditMetric[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);
  return useQuery({
    queryKey: ["useGetAuditProblemStats", isMocked],
    queryFn: ({ signal }) => getAuditProblemStats(isMocked, listenerID, signal),
    ...options,
  });
};

export default useGetAuditProblemStats;
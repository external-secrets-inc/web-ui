import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockPoliciesData } from "../mocks/mockData";
import { DestinationsDataTable } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

const getDestinations = async (
  mock: boolean,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockPoliciesData;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/destinations`, { headers, signal, backend: 'AUDIT_POC' });
  return response.data;
}

const useGetDestinations = (
  mock: boolean,
  options?: Omit<UseQueryOptions<DestinationsDataTable[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["audit", "useGetDestinations", isMocked],
    queryFn: ({ signal }) => getDestinations(isMocked, signal),
    ...options,
  });
};

export default useGetDestinations;

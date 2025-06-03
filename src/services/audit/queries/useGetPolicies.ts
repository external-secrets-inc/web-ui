import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockPoliciesData } from "../mocks/mockData";
import { PolicyTableData } from "@/components/Audit/Audit.interfaces";
import { useAuditMock } from '@/components/Audit/AuditMockContext';

const getPolicies = async (
  mock: boolean,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockPoliciesData;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/policies`, { headers, signal, backend: 'AUDIT_POC' });
  return response.data;
}

const useGetPolicies = (
  mock: boolean,
  options?: Omit<UseQueryOptions<PolicyTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["audit", "useGetPolicies", isMocked],
    queryFn: ({ signal }) => getPolicies(isMocked, signal),
    ...options,
  });
};

export default useGetPolicies;

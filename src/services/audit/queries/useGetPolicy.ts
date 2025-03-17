import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { PolicyTableData } from "@/components/audit/Audit.interfaces";
import { mockNetworkResponseDelay, mockPoliciesData } from "../mocks/mockData";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

const getPolicy = async (mock: boolean, policyId: string, signal: AbortSignal) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockPoliciesData.find(p => p.policyID === policyId) || mockPoliciesData[0];
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/policies/${policyId}`, {
    headers,
    signal,
    backend: 'AUDIT_POC'
  });
  return response.data;
}

const useGetPolicy = (
  mock: boolean,
  policyId: string,
  options?: Omit<UseQueryOptions<PolicyTableData, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["audit", "useGetPolicy", policyId, isMocked],
    queryFn: ({ signal }) => getPolicy(isMocked, policyId, signal),
    enabled: Boolean(policyId),
    ...options,
  });
};

export default useGetPolicy;

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockPoliciesData } from "../mocks/mockData";
import { PolicyTableData } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/119
const getPolicies = async (
  mock: boolean,
  tenantID: string,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockPoliciesData;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/policies?tenant_id=${tenantID}`, { headers, signal, backend: 'AUDIT_POC' });
  return response.data;
}

const useGetPolicies = (
  mock: boolean,
  tenantID: string,
  options?: Omit<UseQueryOptions<PolicyTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["audit", "useGetPolicies", isMocked],
    queryFn: ({ signal }) => getPolicies(isMocked, tenantID, signal),
    ...options,
  });
};

export default useGetPolicies;

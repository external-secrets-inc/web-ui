import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockSecretPolicyLogs } from "../mocks/mockData";
import { PolicyLog } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

const getPolicyLogs = async (
  mock: boolean,
  secretID: string,
  policyID: string,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockSecretPolicyLogs;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/secrets/${secretID}/policies/${policyID}`, { headers, signal, backend: 'AUDIT_POC' });
  return response.data;
}

const useGetPolicyLogs = (
  mock: boolean,
  secretID: string,
  policyID: string,
  options?: Omit<UseQueryOptions<PolicyLog[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["useGetPolicyLogs", isMocked],
    queryFn: ({ signal }) => getPolicyLogs(isMocked, secretID, policyID, signal),
    ...options,
  });
};

export default useGetPolicyLogs;

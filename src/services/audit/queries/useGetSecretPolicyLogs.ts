import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockSecretPolicyLogsData } from "../mocks/mockData";
import { PolicyDetails } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

const getSecretPolicyLogs = async (
  mock: boolean,
  secretID: string,
  policyID: string,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockSecretPolicyLogsData;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/secrets/${secretID}/policies/${policyID}`, { headers, signal, backend: 'AUDIT_POC' });
  return response.data;
}

const useGetSecretPolicyLogs = (
  mock: boolean,
  secretID: string,
  policyID: string,
  options?: Omit<UseQueryOptions<PolicyDetails[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["useGetSecretPolicyLogs", isMocked],
    queryFn: ({ signal }) => getSecretPolicyLogs(isMocked, secretID, policyID, signal),
    ...options,
  });
};

export default useGetSecretPolicyLogs;

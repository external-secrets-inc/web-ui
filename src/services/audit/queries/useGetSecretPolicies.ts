import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockSecretPoliciesData } from "../mocks/mockData";
import { SecretPolicies } from "@/components/Audit/Audit.interfaces";
import { useAuditMock } from '@/components/Audit/AuditMockContext';

const getSecretPolicies = async (
  mock: boolean,
  secretID: string,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockSecretPoliciesData;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/secrets/${secretID}/policies`, { headers, signal, backend: 'AUDIT_POC' });
  return response.data;
}

const useGetSecretPolicies = (
  mock: boolean,
  secretID: string,
  options?: Omit<UseQueryOptions<SecretPolicies, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["audit", "useGetSecretPolicies", isMocked],
    queryFn: ({ signal }) => getSecretPolicies(isMocked, secretID, signal),
    ...options,
  });
};

export default useGetSecretPolicies;

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockSecretAccessorsData } from "../mocks/mockData";
import { SecretAccessors } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

const getSecretAccessors = async (
  mock: boolean,
  secretID: string,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockSecretAccessorsData;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/secrets/${secretID}/accessors`, { headers, signal, backend: 'AUDIT_POC' });
  return response.data;
}

const useGetSecretAccessors = (
  mock: boolean,
  secretID: string,
  options?: Omit<UseQueryOptions<SecretAccessors, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["audit", "useGetSecretAccessors", isMocked],
    queryFn: ({ signal }) => getSecretAccessors(isMocked, secretID, signal),
    ...options,
  });
};

export default useGetSecretAccessors;

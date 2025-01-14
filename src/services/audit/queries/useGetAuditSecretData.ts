import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockAuditSecretsData } from "../mocks/mockData";
import { AuditSecretData } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

const getAuditSecretData = async (
  mock: boolean,
  secretID: string,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockAuditSecretsData;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/secrets/${secretID}`, { headers, signal, backend: 'AUDIT_POC'});
  return response.data;
}

const useGetAuditSecretData = (
  mock: boolean,
  secretID: string,
  options?: Omit<UseQueryOptions<AuditSecretData, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["useGetAuditSecretData", isMocked],
    queryFn: ({ signal }) => getAuditSecretData(isMocked, secretID, signal),
    ...options,
  });
};

export default useGetAuditSecretData;

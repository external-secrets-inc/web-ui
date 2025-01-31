import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

const exportAuditSecrets = async (
  mock: boolean,
  secretID: string,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return ["", "empty_file.csv", "text/csv"];
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/export/secrets/${secretID}`, { headers, signal, backend: 'AUDIT_POC'});
  console.log(response)
  return response.data;
}

const useExportAuditSecrets = (
  mock: boolean,
  secretID: string,
  options?: Omit<UseQueryOptions<[string, string, string], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["useExportAuditSecrets", isMocked],
    queryFn: ({ signal }) => exportAuditSecrets(isMocked, secretID, signal),
    ...options,
  });
};

export default useExportAuditSecrets;

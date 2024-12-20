import { AuditMetric } from "@/components/audit/Audit.interfaces";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
const getAuditProviderStats = async (listenerID: string, signal: AbortSignal) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/dashboard/${listenerID}/secrets-by-provider`, { headers, signal, backend: 'AUDIT_POC', });
  return response.data;
}

const useGetAuditProviderStats = (
  listenerID: string,
  options?: Omit<UseQueryOptions<AuditMetric[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetAuditProviderStats"],
    queryFn: ({ signal }) => getAuditProviderStats(listenerID, signal),
    ...options,
  });
};

export default useGetAuditProviderStats;
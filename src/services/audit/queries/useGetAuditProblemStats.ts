import { AuditMetric } from "@/components/audit/Audit.interfaces";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

const getAuditProblemStats = async (listenerID: string, signal: AbortSignal) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/dashboard/${listenerID}/secret-issues`, {
    headers,
    signal,
    backend: 'AUDIT_POC',
  });
  return response.data;
}

const useGetAuditProblemStats = (
  listenerID: string, 
  options?: Omit<UseQueryOptions<AuditMetric[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetAuditProblemStats"],
    queryFn: ({ signal }) => getAuditProblemStats(listenerID, signal),
    ...options,
  });
};

export default useGetAuditProblemStats;
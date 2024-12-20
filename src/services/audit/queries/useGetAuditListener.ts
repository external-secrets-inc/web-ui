import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { AuditListener } from "@/components/audit/Audit.interfaces";

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/115
const getAuditListener = async (
  mock: boolean,
  signal: AbortSignal,
  listener_id: string
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return {
      listenerID: '1234-5678-9870',
      tenantID: "4567-8910",
      status: "PENDING_INSTALLATION",
    };
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/listeners/${listener_id}`, { 
    headers, 
    signal,
    backend: 'AUDIT_POC'
  });
  return response.data;
}

const useGetAuditListener = <T = AuditListener>(
  mock: boolean,
  listener_id: string,
  options?: Omit<UseQueryOptions<AuditListener, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetAuditListeners", mock, listener_id],
    queryFn: ({ signal }) => {
      return getAuditListener(mock, signal, listener_id)
    },
    ...options,
  });
};

export default useGetAuditListener;
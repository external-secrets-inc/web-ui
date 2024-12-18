import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { AuditListener } from "@/components/audit/Audit.interfaces"; // Update the import for AuditListener

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/115
const getAuditListener = async (
  mock: boolean,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return {
      id: '1234-5678-9870',
      tenant_id: "4567-8910",
      status: "PENDING_INSTALLATION",
    };
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/listeners', { headers, signal });
  return response.data.Listener;
}

const useGetAuditListener = <T = AuditListener>(
  mock: boolean,
  options?: Omit<UseQueryOptions<AuditListener, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetAuditListeners", mock],
    queryFn: ({ signal }) => {
      return getAuditListener(mock, signal)
    },
    ...options,
  });
};

export default useGetAuditListener;
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { Listener } from "@/components/audit/Audit.interfaces";

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/115
const getListener = async (
  mock: boolean,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return {
      id: '1234-5678-9870',
      tenant_id: "4567-8910",
      status: "PENDING_INSTALLATION",
    } as Listener;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/listener', { headers, signal });
  return response.data.Listener;
}

const useGetListener = <T = Listener>(
  mock: boolean,
  options?: Omit<UseQueryOptions<Listener, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetListener", mock],
    queryFn: ({ signal }) => {
      return getListener(mock, signal)
    },
    ...options,
  });
};

export default useGetListener;

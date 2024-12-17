import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import {ListenerTenant } from "@/components/audit/Audit.interfaces";

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/115
const getTenantListeners = async (
  mock: boolean,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return [{
            
            id: "618af796-ab62-4bd7-bbf9-7ffed25f1740",
            name: "listener1",
            enabled: false,
            tags: {
                "additionalProp1": "v0"
            }
    }];
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/listeners', { headers, signal });
  return response.data.listeners;
}

const useGetTenantListeners = <T = ListenerTenant[]>(
  mock: boolean,
  options?: Omit<UseQueryOptions<ListenerTenant[], AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetTenantListeners", mock],
    queryFn: ({ signal }) => {
      return getTenantListeners(mock, signal)
    },
    ...options,
  });
};

export default useGetTenantListeners;

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { TenantListener } from "@/components/Audit/Audit.interfaces"; // Update the import for TenantListener
import { useAuditMock } from '@/components/Audit/AuditMockContext';

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

const useGetTenantListeners = <T = TenantListener[]>(
  mock: boolean,
  options?: Omit<UseQueryOptions<TenantListener[], AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["audit", "useGetTenantListeners", isMocked],
    queryFn: ({ signal }) => {
      return getTenantListeners(isMocked, signal)
    },
    ...options,
  });
};

export default useGetTenantListeners;

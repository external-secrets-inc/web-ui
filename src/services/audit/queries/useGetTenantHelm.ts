import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, Manifest } from "@/types";
import { AxiosError } from "axios";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/118
const getTenantHelm = async (mock: boolean, signal: AbortSignal, version: string = "latest", listenerId: string) => {
  if(mock) return {manifest: 'Helm chart configuration for listener installation!'}

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/listeners/${listenerId}/helm/${version}`, { headers, signal});
  return response.data;
}

const useGetTenantHelm = <T = Manifest>(
  mock: boolean,
  version: string = "latest",
  listenerId: string,
  options?: Omit<UseQueryOptions<T, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>,
) => {
  const { isMocked } = useAuditMock(false);
  const finalMock = isMocked || mock;

  return useQuery<T, AxiosError<ApiHttpError>>({
    queryKey: ['tenant', 'helm', listenerId, version, ],
    queryFn: ({ signal }) => getTenantHelm(finalMock, signal, version, listenerId),
    ...options,
  });
};

export default useGetTenantHelm;

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, Bash } from "@/types";
import { AxiosError } from "axios";
import { useAuditMock } from '@/components/Audit/AuditMockContext';

const getTenantBashFile = async (mock: boolean, signal: AbortSignal, version: string = "latest", listenerId: string, token: string) => {
  if (mock) return { process: 'File with bash script to install listener!' }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/listeners/${listenerId}/bash/${version}`, { headers, signal, params: { "token": token } });
  return response.data;
}

const useGetTenantBashFile = <T = Bash>(
  mock: boolean,
  token: string,
  version: string = "latest",
  listenerId: string,
  options?: Omit<UseQueryOptions<Bash, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["audit", "useGetTenantBashFile", isMocked, token, listenerId],
    queryFn: ({ signal }) => {
      return getTenantBashFile(isMocked, signal, version, listenerId, token)
    },
    ...options,
  });
};

export default useGetTenantBashFile;

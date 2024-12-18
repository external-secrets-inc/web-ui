import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, Bash } from "@/types";
import { AxiosError } from "axios";

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/118
const getTenantBashFile = async (mock: boolean, signal:  AbortSignal, version: string = "latest", listenerId: string) => {
  if(mock) return {process: 'File with bash script to install listener!'}

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/listeners/${listenerId}/bash/${version}`, { headers, signal });
  return response.data;
}

const useGetTenantBashFile = <T = Bash>(
  mock: boolean,
  token: string,
  version: string = "latest",
  listenerId: string,
  options?: Omit<UseQueryOptions<Bash, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetTenantBashFile", token, listenerId],
    queryFn: ({signal}) => {
      return getTenantBashFile(mock, signal, version, listenerId)
    },
    ...options,
  });
};

export default useGetTenantBashFile;

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, Manifest } from "@/types";
import { AxiosError } from "axios";

const getManifest = async (signal:  AbortSignal, agentId: string, version: string = "latest") => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/agents/${agentId}/manifest/${version}`, { headers, signal });
  return response.data;
}

const useGetAgentManifest = <T = Manifest>(
  id: string,
  version: string = "latest",
  options?: Omit<UseQueryOptions<Manifest, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetAgentManifest", id],
    queryFn: ({signal}) => {
      return getManifest(signal, id, version)
    },
    ...options,
  });
};

export default useGetAgentManifest;
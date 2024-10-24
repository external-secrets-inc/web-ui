import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, Rotator } from "@/types";
import { AxiosError } from "axios";

const getAgents = async (signal:  AbortSignal) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/agents', { headers, signal });
  return response.data.agents;
}

const useGetAgents = <T = Rotator[]>(
  options?: Omit<UseQueryOptions<Rotator, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetAgents"],
    queryFn: ({signal}) => {
      return getAgents(signal)
    },
    ...options,
  });
};

export default useGetAgents;
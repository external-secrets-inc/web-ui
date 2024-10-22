import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { Rotator } from "@/types";
import { AxiosError } from "axios";

const getAgents = async (signal:  AbortSignal) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/rotators', { headers, signal });
  return response.data.rotators;
}

const useGetRotators = <T = Rotator[]>(
  options?: Omit<UseQueryOptions<Rotator, AxiosError, T>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetRotators"],
    queryFn: ({signal}) => {
      return getAgents(signal)
    },
    ...options,
  });
};

export default useGetRotators;
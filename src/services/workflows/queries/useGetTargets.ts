import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { TargetTableData } from "@/components/workflows/Targets/Targets.interfaces";

const getTargets = async (signal: AbortSignal): Promise<TargetTableData[]> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/v1/targets', {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data.targets;
};

const useGetTargets = (
  options?: Omit<UseQueryOptions<TargetTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["workflows", "useGetTargets"],
    queryFn: ({ signal }) => getTargets(signal),
    ...options,
  });
};

export default useGetTargets;
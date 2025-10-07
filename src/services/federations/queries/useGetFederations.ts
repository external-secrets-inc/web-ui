import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { GenericFederation } from "@/components/workflows/Federations/Federations.interfaces";

export const getFederations = async (federationType: string, signal: AbortSignal): Promise<GenericFederation[]> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/v1/federations/${federationType}`, {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data.federations;
};

const useGetFederations = (
  federationType: string,
  options?: Omit<UseQueryOptions<GenericFederation[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["federations", "useGetFederations"],
    queryFn: ({ signal }) => getFederations(federationType, signal),
    ...options,
  });
};

export default useGetFederations;

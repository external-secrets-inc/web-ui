import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { FederationData, GetFederationPayload } from "@/components/workflows/Federations/Federations.interfaces";

const getFederation = async (signal: AbortSignal, payload: GetFederationPayload,): Promise<FederationData> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/v1/federations/${payload.kind}/${payload.name}`, {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data;
};

const useGetFederation = (
  payload: GetFederationPayload,
  options?: Omit<UseQueryOptions<FederationData, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["federations", "useGetFederation", `useGetFederation/${payload.kind}/${payload.name}`],
    queryFn: ({ signal }) => getFederation(signal, payload),
    ...options,
  });
};

export default useGetFederation;

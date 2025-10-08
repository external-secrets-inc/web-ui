import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { AuthorizationData, GetAuthorizationPayload } from "@/components/workflows/Authorizations/Authorizations.interfaces";

const getAuthorization = async (signal: AbortSignal, payload: GetAuthorizationPayload,): Promise<AuthorizationData> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/v1/authorizations/${payload.name}`, {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data;
};

const useGetAuthorization = (
  payload: GetAuthorizationPayload,
  options?: Omit<UseQueryOptions<AuthorizationData, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["authorizations", "useGetAuthorization", `useGetAuthorization/${payload.name}`],
    queryFn: ({ signal }) => getAuthorization(signal, payload),
    ...options,
  });
};

export default useGetAuthorization;

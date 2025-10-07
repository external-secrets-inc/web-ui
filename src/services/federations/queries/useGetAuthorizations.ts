import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { AuthorizationTableData } from "@/components/workflows/Authorizations/Authorizations.interfaces";

export const getAuthorizations = async (signal: AbortSignal): Promise<AuthorizationTableData[]> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/v1/authorizations/`, {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data.authorizations;
};

const useGetAuthorizations = (
  options?: Omit<UseQueryOptions<AuthorizationTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["authorizations", "useGetAuthorizations"],
    queryFn: ({ signal }) => getAuthorizations(signal),
    ...options,
  });
};

export default useGetAuthorizations;

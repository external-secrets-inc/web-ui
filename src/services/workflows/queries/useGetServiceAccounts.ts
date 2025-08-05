import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { ServiceAccountTableData } from "@/components/workflows/ServiceAccounts/ServiceAccounts.interfaces";

const getServiceAccounts = async (signal: AbortSignal): Promise<ServiceAccountTableData[]> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/v1/serviceaccounts', {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data.serviceaccounts;
};

const useGetServiceAccounts = (
  options?: Omit<UseQueryOptions<ServiceAccountTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["workflows", "useGetServiceAccounts"],
    queryFn: ({ signal }) => getServiceAccounts(signal),
    ...options,
  });
};

export default useGetServiceAccounts;

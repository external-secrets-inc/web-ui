import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { SecretStoreTableData } from "@/components/workflows/SecretStores/SecretStores.interfaces";

const getSecretStores = async (signal: AbortSignal): Promise<SecretStoreTableData[]> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/v1/secretstores', {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  console.log(response.data.secretstores)
  return response.data.secretstores;
};

const useGetSecretStores = (
  options?: Omit<UseQueryOptions<SecretStoreTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["workflows", "useGetSecretStores"],
    queryFn: ({ signal }) => getSecretStores(signal),
    ...options,
  });
};

export default useGetSecretStores;

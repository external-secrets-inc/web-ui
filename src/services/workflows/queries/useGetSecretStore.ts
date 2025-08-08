import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { GetSecretStorePayload, SecretStoreData } from "@/components/workflows/SecretStores/SecretStores.interfaces";

const getSecretStore = async (signal: AbortSignal, payload: GetSecretStorePayload): Promise<SecretStoreData> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/v1/secretstores/${payload.namespace}/${payload.name}`, {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });

  return response.data;
};

const useGetSecretStore = (
  payload: GetSecretStorePayload,
  options?: Omit<UseQueryOptions<SecretStoreData, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["workflows", "useGetSecretStore", `useGetSecretStore/${payload.namespace}/${payload.name}`],
    queryFn: ({ signal }) => getSecretStore(signal, payload),
    ...options,
  });
};

export default useGetSecretStore;

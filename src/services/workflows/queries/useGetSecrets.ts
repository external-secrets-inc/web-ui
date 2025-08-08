import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { SecretTableData } from "@/components/workflows/Secrets/Secrets.interfaces";

const getSecrets = async (signal: AbortSignal): Promise<SecretTableData[]> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/v1/secrets', {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data.secrets;
};

const useGetSecrets = (
  options?: Omit<UseQueryOptions<SecretTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["workflows", "useGetSecrets"],
    queryFn: ({ signal }) => getSecrets(signal),
    ...options,
  });
};

export default useGetSecrets;

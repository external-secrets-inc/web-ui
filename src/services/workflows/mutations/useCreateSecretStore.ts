import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateSecretStorePayload } from "@/components/workflows/SecretStores/SecretStores.interfaces";

const createSecretStore = async (payload: CreateSecretStorePayload): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.post('/api/v1/secretstores', payload, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useCreateSecretStore = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, CreateSecretStorePayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSecretStore,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", "useGetSecretStores"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useCreateSecretStore;

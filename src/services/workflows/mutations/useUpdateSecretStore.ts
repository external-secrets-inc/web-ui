import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { UpdateSecretStorePayload } from "@/components/workflows/SecretStores/SecretStores.interfaces";

const updateSecretStore = async (payload: UpdateSecretStorePayload): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.put('/api/v1/secretstores', payload, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useUpdateSecretStore = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, UpdateSecretStorePayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSecretStore,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", "useUpdateSecretStore"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useUpdateSecretStore;

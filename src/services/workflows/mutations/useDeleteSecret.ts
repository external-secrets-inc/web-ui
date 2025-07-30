import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { DeleteSecretPayload } from "@/components/workflows/Secrets/Secrets.interfaces";

const deleteSecret = async (payload: DeleteSecretPayload): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/api/v1/secrets/${payload.namespace}/${payload.name}`, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useDeleteSecret = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, DeleteSecretPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSecret,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", "useGetSecrets"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useDeleteSecret;

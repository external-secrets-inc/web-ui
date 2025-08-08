import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateSecretPayload } from "@/components/workflows/Secrets/Secrets.interfaces";

const createSecret = async (payload: CreateSecretPayload): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.post('/api/v1/secrets', payload, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useCreateSecret = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, CreateSecretPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSecret,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", "useGetSecrets"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useCreateSecret;

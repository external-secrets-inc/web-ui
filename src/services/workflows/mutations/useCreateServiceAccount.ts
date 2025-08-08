import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateServiceAccountPayload } from "@/components/workflows/ServiceAccounts/ServiceAccounts.interfaces";

const createServiceAccount = async (payload: CreateServiceAccountPayload): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.post('/api/v1/serviceaccounts', payload, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useCreateServiceAccount = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, CreateServiceAccountPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createServiceAccount,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", "useGetServiceAccounts"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useCreateServiceAccount;

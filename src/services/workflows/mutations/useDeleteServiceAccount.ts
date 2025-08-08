import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { DeleteServiceAccountPayload } from "@/components/workflows/ServiceAccounts/ServiceAccounts.interfaces";

const deleteServiceAccount = async (payload: DeleteServiceAccountPayload): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/api/v1/serviceaccounts/${payload.namespace}/${payload.name}`, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useDeleteServiceAccount = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, DeleteServiceAccountPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteServiceAccount,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", "useGetServiceAccounts"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useDeleteServiceAccount;

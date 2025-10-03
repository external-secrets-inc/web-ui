import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { DeleteAuthorizationPayload } from "@/components/workflows/Authorizations/Authorizations.interfaces";

const deleteAuthorization = async (payload: DeleteAuthorizationPayload): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/api/v1/authorizations/${payload.namespace}/${payload.name}`, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useDeleteAuthorization = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, DeleteAuthorizationPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAuthorization,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["authorizations", "useGetAuthorizations"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useDeleteAuthorization;

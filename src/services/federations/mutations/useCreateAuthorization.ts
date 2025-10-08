import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateAuthorizationPayload } from "@/components/workflows/Authorizations/Authorizations.interfaces";

const createAuthorization = async (payload: CreateAuthorizationPayload): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.post('/api/v1/authorizations', payload, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useCreateAuthorization = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, CreateAuthorizationPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAuthorization,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["authorizations", "useGetAuthorizations"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useCreateAuthorization;

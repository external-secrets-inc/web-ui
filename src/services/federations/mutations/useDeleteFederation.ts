import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { DeleteFederationPayload } from "@/components/workflows/Federations/Federations.interfaces";

const deleteFederation = async (payload: DeleteFederationPayload): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/api/v1/federations/${payload.kind}/${payload.namespace}/${payload.name}`, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useDeleteFederation = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, DeleteFederationPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFederation,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["federations", "useGetFederations"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useDeleteFederation;

import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { DeleteTargetPayload } from "@/components/workflows/Targets/Targets.interfaces";

const deleteTarget = async (payload: DeleteTargetPayload): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/api/v1/targets/${payload.kind}/${payload.namespace}/${payload.name}`, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useDeleteTarget = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, DeleteTargetPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTarget,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", "useGetTargets"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useDeleteTarget;
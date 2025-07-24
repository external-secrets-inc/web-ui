import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateTargetPayload } from "@/components/workflows/Targets/Targets.interfaces";

const createTarget = async (payload: CreateTargetPayload): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.post('/api/v1/targets', payload, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useCreateTarget = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, CreateTargetPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTarget,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", "useGetTargets"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useCreateTarget;
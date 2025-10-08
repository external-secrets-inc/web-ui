import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateFederationPayload } from "@/components/workflows/Federations/Federations.interfaces";

const createFederation = async (payload: CreateFederationPayload): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.post('/api/v1/federations', payload, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useCreateFederation = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, CreateFederationPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFederation,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["federations", "useGetFederations"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useCreateFederation;

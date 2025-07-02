import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { DeleteGeneratorPayload } from "@/components/workflows/Generators/Generators.interfaces";
import { createMockResponse } from "../mocks/mockData.utils";
import { MOCK_ENABLED } from "../mocks/mockData.constants";

const deleteGenerator = async (payload: DeleteGeneratorPayload): Promise<void> => {
  // TODO[cfviotti]: Remove this once the API is available
  if (MOCK_ENABLED) {
    await createMockResponse(undefined, 1200, false);
    console.log(`Mock: Deleted generator ${payload.kind}/${payload.namespace}/${payload.name}`);
    return;
  }

  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/api/v1/generators/${payload.kind}/${payload.namespace}/${payload.name}`, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useDeleteGenerator = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, DeleteGeneratorPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGenerator,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", "useGetGenerators"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useDeleteGenerator;
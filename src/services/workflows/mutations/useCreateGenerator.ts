import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateGeneratorPayload } from "@/components/workflows/Generators/Generators.interfaces";
import { createMockResponse } from "../mocks/mockData.utils";
import { MOCK_ENABLED } from "../mocks/mockData.constants";

const createGenerator = async (payload: CreateGeneratorPayload): Promise<void> => {
  // TODO[cfviotti]: Remove this once the API is available
  if (MOCK_ENABLED) {
    await createMockResponse(undefined, 1200, false);
    console.log("Mock: Created generator with manifest:", payload.manifest);
    return;
  }

  const headers = await getAuthHeaders();
  await axiosInstance.post('/api/v1/generators', payload, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useCreateGenerator = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, CreateGeneratorPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGenerator,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", "useGetGenerators"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useCreateGenerator;
import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateWorkflowRunTemplatePayload } from "@/components/workflows/Workflows/Workflows.interfaces";

const createWorkflowRunTemplate = async (payload: CreateWorkflowRunTemplatePayload): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.post('/api/v1/workflowruntemplates', payload, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useCreateWorkflowRunTemplate = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, CreateWorkflowRunTemplatePayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkflowRunTemplate,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", "useGetWorkflowRunTemplates"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useCreateWorkflowRunTemplate;

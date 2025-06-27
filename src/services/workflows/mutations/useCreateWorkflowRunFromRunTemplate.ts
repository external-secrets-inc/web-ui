import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateWorkflowRunFromRunTemplatePayload } from "@/components/workflows/Workflows/Workflows.interfaces";

const createWorkflowRunFromRunTemplate = async (payload: CreateWorkflowRunFromRunTemplatePayload): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.post(`/api/v1/workflowruntemplates/${payload.runTemplateNamespace}/${payload.runTemplateName}/run`, payload, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useCreateWorkflowRunFromRunTemplate = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, CreateWorkflowRunFromRunTemplatePayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkflowRunFromRunTemplate,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", "useGetWorkflowRunTemplates"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useCreateWorkflowRunFromRunTemplate;

import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateWorkflowTemplatePayload } from "@/components/workflows/Workflows/Workflows.interfaces";

const createWorkflowTemplate = async (payload: CreateWorkflowTemplatePayload): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.post('/api/v1/workflows/templates', payload, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useCreateWorkflowTemplate = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, CreateWorkflowTemplatePayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkflowTemplate,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", "useGetWorkflowTemplates"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useCreateWorkflowTemplate;

import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { DeleteWorkflowRunTemplatePayload } from "@/components/workflows/Workflows/Workflows.interfaces";

const deleteWorkflowRunTemplate = async (payload: DeleteWorkflowRunTemplatePayload): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/api/v1/workflowruntemplates/${payload.namespace}/${payload.name}`, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useDeleteWorkflowRunTemplate = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, DeleteWorkflowRunTemplatePayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkflowRunTemplate,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", "useGetWorkflowRunTemplates"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useDeleteWorkflowRunTemplate;

import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { DeleteWorkflowTemplatePayload } from "@/components/workflows/Workflows/Workflows.interfaces";

const deleteWorkflowTemplate = async (payload: DeleteWorkflowTemplatePayload): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/api/v1/workflowtemplates/${payload.namespace}/${payload.name}`, {
    headers,
    backend: 'ESO_SERVER'
  });
};

const useDeleteWorkflowTemplate = (
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, DeleteWorkflowTemplatePayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkflowTemplate,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", "useGetWorkflowTemplates"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export default useDeleteWorkflowTemplate;

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import {
  GetWorkflowRunTemplatesByTemplate,
  WorkflowRunTemplateTableData,
} from "@/components/workflows/Workflows/Workflows.interfaces";

const getWorkflowRunTemplatesByTemplate = async (
  signal: AbortSignal,
  payload: GetWorkflowRunTemplatesByTemplate
): Promise<WorkflowRunTemplateTableData[]> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(
    `/api/v1/workflowruntemplates/by-template?templateNamespace=${payload.templateNamespace}&templateName=${payload.templateName}`,
    {
      headers,
      signal,
      backend: "ESO_SERVER",
    }
  );
  return response.data.workflowruntemplates;
};

const useGetWorkflowRunTemplatesByTemplate = (
  payload: GetWorkflowRunTemplatesByTemplate,
  options?: Omit<
    UseQueryOptions<WorkflowRunTemplateTableData[], AxiosError<ApiHttpError>>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: [
      "workflows",
      "useGetWorkflowRunTemplates",
      `useGetWorkflowRunTemplates${payload.templateNamespace}/${payload.templateName}`,
    ],
    queryFn: ({ signal }) => getWorkflowRunTemplatesByTemplate(signal, payload),
    ...options,
  });
};

export default useGetWorkflowRunTemplatesByTemplate;

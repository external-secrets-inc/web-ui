import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { WorkflowRunTemplateTableData } from "@/components/workflows/Workflows/Workflows.interfaces";

const getWorkflowRunTemplates = async (signal: AbortSignal): Promise<WorkflowRunTemplateTableData[]> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/v1/workflowruntemplates', {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data.workflowruntemplates;
};

const useGetWorkflowRunTemplates = (
  options?: Omit<UseQueryOptions<WorkflowRunTemplateTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["workflows", "useGetWorkflowRunTemplates"],
    queryFn: ({ signal }) => getWorkflowRunTemplates(signal),
    ...options,
  });
};

export default useGetWorkflowRunTemplates;

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { WorkflowTemplateTableData } from "@/components/workflows/Workflows/Workflows.interfaces";

const getWorkflowTemplates = async (signal: AbortSignal): Promise<WorkflowTemplateTableData[]> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/v1/workflowtemplates', {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data.templates;
};

const useGetWorkflowTemplates = (
  options?: Omit<UseQueryOptions<WorkflowTemplateTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["workflows", "useGetWorkflowTemplates"],
    queryFn: ({ signal }) => getWorkflowTemplates(signal),
    ...options,
  });
};

export default useGetWorkflowTemplates;

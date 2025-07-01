import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { GetWorkflowTemplatePayload, WorkflowTemplateData } from "@/components/workflows/Workflows/Workflows.interfaces";

const getWorkflowTemplate = async (signal: AbortSignal, payload: GetWorkflowTemplatePayload): Promise<WorkflowTemplateData> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/v1/workflowtemplates/${payload.namespace}/${payload.name}`, {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data;
};

const useGetWorkflowTemplate = (
payload: GetWorkflowTemplatePayload,
  options?: Omit<UseQueryOptions<WorkflowTemplateData, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["workflows", "useGetWorkflowTemplate", `useGetWorkflowTemplate/${payload.namespace}/${payload.name}`],
    queryFn: ({ signal }) => getWorkflowTemplate(signal, payload),
    ...options,
  });
};

export default useGetWorkflowTemplate;

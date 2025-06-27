import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { GetWorkflowPayload, WorkflowData } from "@/components/workflows/Workflows/Workflows.interfaces";

const getWorkflow = async (signal: AbortSignal, payload: GetWorkflowPayload): Promise<WorkflowData> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/v1/workflows/${payload.namespace}/${payload.name}`, {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data;
};

const useGetWorkflow = (
  payload: GetWorkflowPayload,
  options?: Omit<UseQueryOptions<WorkflowData, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["workflows", "useGetWorkflow", `useGetWorkflow${payload.namespace}/${payload.name}`],
    queryFn: ({ signal }) => getWorkflow(signal, payload),
    ...options,
  });
};

export default useGetWorkflow;

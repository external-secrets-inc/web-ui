import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { GetWorkflowRunPayload, WorkflowRunData } from "@/components/workflows/Workflows/Workflows.interfaces";

const getWorkflowRun = async (signal: AbortSignal, payload: GetWorkflowRunPayload): Promise<WorkflowRunData> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/v1/workflows/${payload.namespace}/${payload.name}`, {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data;
};

const useGetWorkflowRun = (
  payload: GetWorkflowRunPayload,
  options?: Omit<UseQueryOptions<WorkflowRunData, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["workflows", "useGetWorkflowRun"],
    queryFn: ({ signal }) => getWorkflowRun(signal, payload),
    ...options,
  });
};

export default useGetWorkflowRun;

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { WorkflowRunTableData } from "@/components/workflows/Workflows/Workflows.interfaces";

const getWorkflowRuns = async (signal: AbortSignal): Promise<WorkflowRunTableData[]> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/v1/workflows', {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data.workflows;
};

const useGetWorkflowRuns = (
  options?: Omit<UseQueryOptions<WorkflowRunTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["workflows", "useGetWorkflowRuns"],
    queryFn: ({ signal }) => getWorkflowRuns(signal),
    ...options,
  });
};

export default useGetWorkflowRuns;

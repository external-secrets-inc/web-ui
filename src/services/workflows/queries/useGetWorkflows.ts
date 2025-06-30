import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { WorkflowTableData } from "@/components/workflows/Workflows/Workflows.interfaces";

const getWorkflows = async (signal: AbortSignal): Promise<WorkflowTableData[]> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/v1/workflows', {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data.workflows;
};

const useGetWorkflows = (
  options?: Omit<UseQueryOptions<WorkflowTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["workflows", "useGetWorkflows"],
    queryFn: ({ signal }) => getWorkflows(signal),
    ...options,
  });
};

export default useGetWorkflows;

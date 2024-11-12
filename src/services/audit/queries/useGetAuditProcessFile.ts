import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, Process } from "@/types";
import { AxiosError } from "axios";

const getProcessFile = async (mock: boolean, signal:  AbortSignal, version: string = "latest") => {
  if(mock) return {process: 'File with bash script to install listener!'}

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/audit/process/${version}`, { headers, signal });
  return response.data;
}

const useGetAuditProcessFile = <T = Process>(
  mock: boolean,
  token: string,
  version: string = "latest",
  options?: Omit<UseQueryOptions<Process, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetAuditProcessFile", token],
    queryFn: ({signal}) => {
      return getProcessFile(mock, signal, version)
    },
    ...options,
  });
};

export default useGetAuditProcessFile;

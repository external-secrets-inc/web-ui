import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockTableData } from "../mocks/mockData";
import { AuditTableData } from "@/components/audit/Audit.interfaces";

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/115
const getListenerAuditData = async (
  mock: boolean,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockTableData;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/listener/data', { headers, signal });
  return response.data.Listener;
}

const useGetListenerAuditData = (
  mock: boolean,
  options?: Omit<UseQueryOptions<AuditTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetListenerAuditData", mock],
    queryFn: ({ signal }) => {
      return getListenerAuditData(mock, signal)
    },
    ...options,
  });
};

export default useGetListenerAuditData;

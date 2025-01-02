import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockAuditTableData } from "../mocks/mockData";
import { AuditResponseData, filterSchema, FilterSchema } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/115
const getDashboardSecretTable = async (
  mock: boolean,
  signal: AbortSignal,
  listener_id: string,
  params: URLSearchParams,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockAuditTableData;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/dashboard/${listener_id}/secrets-table`, { headers, signal, backend: 'AUDIT_POC', params: params });
  return response.data;
}

const useGetDashboarSecretTable = (
  mock: boolean,
  listener_id: string,
  params: URLSearchParams,
  options?: Omit<UseQueryOptions<AuditResponseData, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  const filteredParams: URLSearchParams = new URLSearchParams();

  Object.keys(filterSchema.shape).forEach((key) => {
    const paramValue = params.getAll(key);
    if (paramValue.length > 0) {
      if (key === 'providers') {
        paramValue.forEach((value) => filteredParams.append(key, value));
      } else {
        filteredParams.set(key as keyof Omit<FilterSchema, 'providers'>, paramValue[0]);
      }
    }
  });

  return useQuery({
    queryKey: ["useGetDashboarSecretTable", isMocked, listener_id],
    queryFn: ({ signal }) => {
      return getDashboardSecretTable(isMocked, signal, listener_id, filteredParams)
    },
    ...options,
  });
};

export default useGetDashboarSecretTable;

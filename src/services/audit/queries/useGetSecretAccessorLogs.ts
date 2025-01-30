import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockSecretAccessorLogsData } from "../mocks/mockData";
import { AccessorDetails } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { ONE_MINUTE_IN_SECONDS } from "@/constants";

export const getSecretAccessorLogs = async (
  mock: boolean,
  secretID: string,
  accessorName: string,
  signal?: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockSecretAccessorLogsData;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/secrets/${secretID}/accessors/${accessorName}`, { headers, signal, backend: 'AUDIT_POC' });
  return response.data;
}

const useGetSecretAccessorLogs = (
  mock: boolean,
  secretID: string,
  accessorName: string,
  options?: Omit<UseQueryOptions<AccessorDetails[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["useGetSecretAccessorLogs", isMocked, secretID, accessorName],
    queryFn: ({ signal }) => getSecretAccessorLogs(isMocked, secretID, accessorName, signal),
    staleTime: ONE_MINUTE_IN_SECONDS * 5,
    ...options,
  });
};

export default useGetSecretAccessorLogs;

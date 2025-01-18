import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { LineageData } from "@/components/lineage/Lineage.interfaces";

const getLineagePath = async (
  mock: boolean,
  signal: AbortSignal,
  secretID: string
) => {
  if (mock) {
    return {
      nodes: [],
      links: [],
    };
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/lineage/${secretID}`, {
    headers,
    signal,
    backend: 'AUDIT_POC'
  });
  return response.data;
}

const useGetLineagePath = <T = LineageData>(
  mock: boolean,
  secretID: string,
  options?: Omit<UseQueryOptions<LineageData, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["useGetLineagePaths", secretID],
    queryFn: ({ signal }) => {
      return getLineagePath(isMocked, signal, secretID)
    },
    ...options,
  });
};

export default useGetLineagePath;
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { DestinationTableData } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { AUDIT_QUERY_STALE_TIME } from "@/components/audit/Audit.constants";

const getDestination = async (
  id: string,
  mock: boolean,
  signal: AbortSignal
): Promise<DestinationTableData> => {
  if (mock) {
    return {
      "_id": id,
      "tenantID": "mock-tenant-id",
      "destinationID": id,
      "name": "Mocked Destination Name",
      "identifier": "mocked-destination-id",
      "type": "WEBHOOK",
      "config": {
        "url": "https://mock.hook/service",
        "caBundle": "",
        "auth": "NONE",
        "format": "CLOUD_EVENTS"
      },
      "deletedAt": null
    };
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get<DestinationTableData>(
    `/api/destinations/${id}`,
    {
      headers,
      signal,
      backend: 'AUDIT_POC'
    }
  );
  return response.data;
};

// Hook to fetch a single destination by ID
export default function useGetDestination(
  destinationId: string | undefined, // Allow undefined to disable the query initially
  options?: Omit<UseQueryOptions<DestinationTableData, AxiosError<ApiHttpError>, DestinationTableData, (string | boolean | undefined)[]>, "queryKey" | "queryFn" | "enabled">
) {
  // Default to not mocking unless context says otherwise
  const { isMocked } = useAuditMock(false);
  const queryKey = ["audit", "useGetDestination", destinationId, isMocked];

  return useQuery({
    queryKey,
    // Only run the query if destinationId is truthy
    queryFn: ({ signal }) => getDestination(destinationId!, isMocked, signal),
    // Keep data fresh as per standard audit pattern
    staleTime: AUDIT_QUERY_STALE_TIME,
    // This query should only run when a destinationId is provided
    enabled: !!destinationId,
    ...options,
  });
}
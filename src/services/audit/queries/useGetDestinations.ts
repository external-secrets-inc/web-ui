import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { DestinationTableData } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { AUDIT_QUERY_STALE_TIME } from "@/components/audit/Audit.constants";

const getDestinations = async (
  mock: boolean,
  signal: AbortSignal
): Promise<DestinationTableData[]> => {
  if (mock) {
    return [
      {
        "_id": "mock-dest-1",
        "tenantID": "mock-tenant-id",
        "destinationID": "mock-dest-1",
        "name": "Slack Notifications",
        "identifier": "slack-notifications",
        "type": "WEBHOOK",
        "config": {
          "url": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
          "caBundle": "",
          "auth": "NONE",
          "format": "CLOUD_EVENTS"
        },
        "deletedAt": null
      },
      {
        "_id": "mock-dest-2",
        "tenantID": "mock-tenant-id",
        "destinationID": "mock-dest-2",
        "name": "Internal Rotation Logger",
        "identifier": "internal-rotation-logger",
        "type": "WEBHOOK",
        "config": {
          "url": "https://internal.example.com/api/log-rotation",
          "caBundle": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURXVENDQWptZ0F3SUJBZ0lCQURBTkJna3Foa2lHOXcwQkFRc0ZBREFTTVJBd0RnWURWUVFLRXdkclppMXkKTG5KaGNtNWxkQzV3WldKcmRXSmxMbU52YlRBZUZ3MHlNREExTWpJeE5USXhOalZhRncweU5UQTFNakV4TlRJeAog=",
          "auth": "TOKEN",
          "format": "CLOUD_EVENTS"
        },
        "deletedAt": "2025-04-17T13:27:21.698Z"
      }
    ];
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get<DestinationTableData[]>(
    `/api/destinations`,
    {
      headers,
      signal,
      backend: 'AUDIT_POC'
    }
  );
  return response.data;
};

export default function useGetDestinations(
  mock: boolean = false,
  options?: Omit<UseQueryOptions<DestinationTableData[], AxiosError<ApiHttpError>>, "queryKey" | "queryFn">
) {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["audit", "useGetDestinations", isMocked],
    queryFn: ({ signal }) => {
      return getDestinations(isMocked, signal);
    },
    staleTime: AUDIT_QUERY_STALE_TIME,
    ...options,
  });
}
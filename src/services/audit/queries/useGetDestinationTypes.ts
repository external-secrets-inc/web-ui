import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { useAuditMock } from '@/components/Audit/AuditMockContext';
import { AUDIT_QUERY_STALE_TIME } from "@/components/Audit/Audit.constants";

export interface DestinationTypeField {
  label: string;
  type: string;
  required: boolean;
  values?: string[];
  default?: string;
}

// The API returns { "TYPE_NAME": DestinationTypeField[], ... }
export type DestinationTypesResponse = Record<string, DestinationTypeField[]>;

const getDestinationTypes = async (
  mock: boolean,
  signal: AbortSignal,
): Promise<DestinationTypesResponse> => {
  if (mock) {
    return {
      "WEBHOOK": [
        {
          "label": "url",
          "type": "string",
          "required": true
        },
        {
          "label": "caBundle",
          "type": "string",
          "required": false
        },
        {
          "label": "auth",
          "type": "enum",
          "required": true,
          "default": "NONE",
          "values": ["NONE", "BASIC", "TOKEN", "OIDC"]
        },
        {
          "label": "format",
          "type": "enum",
          "required": true,
          "default": "CLOUD_EVENTS",
          "values": ["CLOUD_EVENTS"]
        }
      ],
      /* // Commented out other types for future reference
      "PUBSUB": [
        { "label": "project-id", "type": "string", "required": true },
        { "label": "topic", "type": "string", "required": true },
        { "label": "subscription", "type": "string", "required": true }
      ],
      "SQS": [
        { "label": "region", "type": "string", "required": true },
        { "label": "queue-url", "type": "string", "required": true }
      ],
      "AZURE_EVENTS": [
        { "label": "namespace", "type": "string", "required": true },
        { "label": "eventHub", "type": "string", "required": true },
        { "label": "connectionString", "type": "string", "required": true }
      ],
      "FILE": [
        { "label": "path", "type": "string", "required": true },
        { "label": "mode", "type": "string", "required": false, "default": "append" }
      ]
      */
    };
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get<DestinationTypesResponse>(
    `/api/types/destinations`,
    {
      headers,
      signal,
      backend: 'AUDIT_POC'
    }
  );

  return response.data;
};

export default function useGetDestinationTypes(
  options?: Omit<UseQueryOptions<DestinationTypesResponse, AxiosError<ApiHttpError>>, "queryKey" | "queryFn">
) {
  // Use the real API by default unless mocking context dictates otherwise
  const { isMocked } = useAuditMock(false);

  return useQuery({
    queryKey: ["audit", "useGetDestinationTypes", isMocked],
    queryFn: ({ signal }) => getDestinationTypes(isMocked, signal),
    staleTime: AUDIT_QUERY_STALE_TIME,
    ...options,
  });
}
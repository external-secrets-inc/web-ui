import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { AddProviderFormSchema } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/119
const getProvidersTypes = async (
  mock: boolean,
  signal: AbortSignal,
) => {
  if (mock) {
    return {
      "formExample": {
        "field1": { "type": "string", "required": true, "maxLength": 50 },
        "field2": { "type": "date", "required": false },
        "field3": { "type": "file", "required": true, "accept": "image/*" },
        "field4": { "type": "number", "required": true },
        "field5": { "type": "boolean", "required": true },
      },
      "gcp": {
        "projectID": { "type": "string", "required": true },
        "topic": { "type": "string", "required": true },
        "subscription": { "type": "string", "required": true }
      },
      "vault": {
        "port": { "type": "number", "required": true }
      }
    } as AddProviderFormSchema;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/providers/types', { headers, signal });
  return response.data.Provider;
}

const useGetProvidersTypes = (
  mock: boolean,
  options?: Omit<UseQueryOptions<AddProviderFormSchema, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["useGetProvidersTypes", isMocked],
    queryFn: ({ signal }) => {
      return getProvidersTypes(isMocked, signal)
    },
    ...options,
  });
};

export default useGetProvidersTypes;

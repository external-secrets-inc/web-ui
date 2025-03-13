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
      "GKE": {
        "project-id": { "type": "string", "required": true },
        "location": { "type": "string", "required": true },
        "cluster": { "type": "string", "required": true },
        "subscription": { "type": "string", "required": true }
      },
      "GCP": {
        "project-id": { "type": "string", "required": true },
        "topic": { "type": "string", "required": true },
        "subscription": { "type": "string", "required": true }
      },
      "VAULT": {
        "vaultAddress": { "type": "string", "required": true },
        "vaultBasePath": { "type": "string", "required": false, "default": "secret" },
        "vaultVersion": { "type": "string", "required": false, "default": "v2" },
        "socketHost": { "type": "string", "required": false, "default": "0.0.0.0" },
        "socketPort": { "type": "number", "required": false, "default": 8000}
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
    queryKey: ["audit", "useGetProvidersTypes", isMocked],
    queryFn: ({ signal }) => {
      return getProvidersTypes(isMocked, signal)
    },
    ...options,
  });
};

export default useGetProvidersTypes;

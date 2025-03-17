import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { AddProviderFormSchema } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

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
      },
      "AWS": {
        "region": {"type": "string", "required": true},
        "queue-url": {"type": "string", "required": true}
      },
      "KEYVAULT": {
        "vaultURL": {"type": "string", "required": true},
        "eventHubNamespace": {"type": "string", "required": true},
        "eventHubName": {"type": "string", "required": true},
        "storageEndpoint": {"type": "string", "required": true},
        "storageContainerName": {"type": "string", "required": true},
        "eventHubConnectionString": {"type": "string", "required": false},
        "storageAccountConnectionString": {"type": "string", "required": false}
      }
    } as AddProviderFormSchema;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/providers/types', { headers, signal });
  return response.data.Provider;
}

/**
 * Hook to get provider types with loading state management
 *
 * @param mock Whether to use mock data
 * @param options Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetProvidersTypes = (
  mock: boolean,
  options?: Omit<UseQueryOptions<AddProviderFormSchema, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'dialog' // Default to 'dialog' as recommended in updates.md
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useQuery({
    queryKey: ["audit", "useGetProvidersTypes", isMocked],
    queryFn: ({ signal }) => {
      return getProvidersTypes(isMocked, signal)
    },
    ...options,
  });

  // Handle loading state
  useEffect(() => {
    const isLoading = result.isPending;

    if (loadingType === 'page') {
      setPageLoading(isLoading);
    } else if (loadingType === 'dialog') {
      setDialogLoading(isLoading);
    }

    return () => {
      if (loadingType === 'page') {
        setPageLoading(false);
      } else if (loadingType === 'dialog') {
        setDialogLoading(false);
      }
    };
  }, [result.isPending, loadingType, setPageLoading, setDialogLoading]);

  return result;
};

export default useGetProvidersTypes;

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { LineageData } from "@/components/audit/Audit.interfaces";
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

const getLineagePath = async (
  mock: boolean,
  signal: AbortSignal,
  secretID: string
) => {
  if (mock) {
    return {
      nodes: [
        {
          secretID: "secret-1",
          secretName: "Production API Key",
          providerID: "aws-secrets-1",
          providerName: "AWS Secrets Manager",
          createdAt: "2024-03-15T10:00:00.000Z"
        },
        {
          secretID: "secret-2",
          secretName: "Staging Database Password",
          providerID: "vault-1",
          providerName: "HashiCorp Vault",
          createdAt: "2024-03-16T11:30:00.000Z"
        },
        {
          secretID: "secret-3",
          secretName: "Payment Gateway Token",
          providerID: "azure-kv-1",
          providerName: "Azure Key Vault",
          createdAt: "2024-03-17T09:15:00.000Z"
        },
        {
          secretID: "secret-4",
          secretName: "US Region Service Account",
          providerID: "gcp-sm-1",
          providerName: "GCP Secret Manager",
          createdAt: "2024-03-18T14:20:00.000Z"
        },
        {
          secretID: "secret-5",
          secretName: "EU Region Service Account",
          providerID: "gcp-sm-2",
          providerName: "GCP Secret Manager",
          createdAt: "2024-03-18T14:25:00.000Z"
        }
      ],
      links: [
        {
          fromSecret: "secret-1",
          toSecret: "secret-2",
          createdAt: "2024-03-16T11:35:00.000Z"
        },
        {
          fromSecret: "secret-2",
          toSecret: "secret-3",
          createdAt: "2024-03-17T09:20:00.000Z"
        },
        {
          fromSecret: "secret-2",
          toSecret: "secret-4",
          createdAt: "2024-03-18T14:30:00.000Z"
        },
        {
          fromSecret: "secret-3",
          toSecret: "secret-5",
          createdAt: "2024-03-18T14:35:00.000Z"
        }
      ]
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

/**
 * Hook to fetch lineage path data with loading state management
 *
 * @param mock Whether to use mock data
 * @param secretID The secret ID to get lineage for
 * @param options Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetLineagePath = <T = LineageData>(
  mock: boolean,
  secretID: string,
  options?: Omit<UseQueryOptions<LineageData, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'none' // Default to 'none' to maintain backward compatibility
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useQuery({
    queryKey: ["audit", "useGetLineagePaths", secretID],
    queryFn: ({ signal }) => {
      return getLineagePath(isMocked, signal, secretID)
    },
    ...options,
  });

  // Handle loading state
  useEffect(() => {
    const isLoading = result.isLoading || result.isFetching;

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
  }, [result.isLoading, result.isFetching, loadingType, setPageLoading, setDialogLoading]);

  return result;
};

export default useGetLineagePath;

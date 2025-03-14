import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { LineageData } from "@/components/audit/Audit.interfaces";

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

const useGetLineagePath = <T = LineageData>(
  mock: boolean,
  secretID: string,
  options?: Omit<UseQueryOptions<LineageData, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["audit", "useGetLineagePaths", secretID],
    queryFn: ({ signal }) => {
      return getLineagePath(isMocked, signal, secretID)
    },
    ...options,
  });
};

export default useGetLineagePath;
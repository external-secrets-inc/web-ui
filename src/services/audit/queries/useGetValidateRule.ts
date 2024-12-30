import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { useAuditMock } from "../context/AuditMockContext";

interface ValidateRuleResponse {
  "secret_name": string;
  "providerID": string;
  "time": string;
  "metadata": object;
  "actor": object;
}

const getValidateRule = async (
  mock: boolean,
  executeOn: string[],
  signal: AbortSignal,
) => {
  if (executeOn.length > 0) {
    if (mock) {
      await mockNetworkResponseDelay();
      return {
        "secret_name": "foobar",
        "providerID": "<uuid>",
        "time": "2024-12-29T00:00Z",
        "metadata": {},
        "actor": {
          "identifier": "email-or-token-name"
        }
      };
    }

    const executeOnQuery = executeOn.map(x => `executeOn=${x}`).join("&");
    const headers = await getAuthHeaders();
    const response = await axiosInstance.get(`/api/validate-rule?${executeOnQuery}`, { headers, signal, backend: 'AUDIT_POC' });
    return response.data;
  }
}

const useGetValidateRule = (
  mock: boolean,
  executeOn: string[],
  options?: Omit<UseQueryOptions<ValidateRuleResponse, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useQuery({
    queryKey: ["useGetValidateRule", executeOn, isMocked],
    queryFn: ({ signal }) => {
      return getValidateRule(isMocked, executeOn, signal)
    },
    ...options,
  });
};

export default useGetValidateRule;

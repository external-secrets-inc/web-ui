import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { CreateDestinationPayload, DestinationTableData } from "@/components/Audit/Audit.interfaces";

const createDestination = async (
  payload: CreateDestinationPayload,
): Promise<DestinationTableData> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post<DestinationTableData>(
    `/api/destinations`,
    payload,
    {
      headers,
      backend: 'AUDIT_POC'
    }
  );
  return response.data;
};

export default function useCreateDestination(
  options?: Omit<UseMutationOptions<DestinationTableData, AxiosError<ApiHttpError>, CreateDestinationPayload>, "mutationFn">
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDestination,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["audit", "useGetDestinations"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
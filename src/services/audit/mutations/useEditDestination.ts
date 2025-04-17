import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { EditDestinationPayload, DestinationTableData } from "@/components/audit/Audit.interfaces";

export interface EditDestinationVariables {
  destinationID: string;
  payload: EditDestinationPayload;
}

const editDestination = async (
  { destinationID, payload }: EditDestinationVariables,
): Promise<DestinationTableData> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.put<DestinationTableData>(
    `/api/destinations/${destinationID}`,
    payload,
    {
      headers,
      backend: 'AUDIT_POC'
    }
  );
  return response.data;
};

export default function useEditDestination(
  options?: Omit<UseMutationOptions<DestinationTableData, AxiosError<ApiHttpError>, EditDestinationVariables>, "mutationFn">
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editDestination,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["audit", "destinations"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
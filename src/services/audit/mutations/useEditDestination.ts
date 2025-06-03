import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { EditDestinationPayload, DestinationTableData } from "@/components/Audit/Audit.interfaces";

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
  return useMutation({
    mutationFn: editDestination,
    ...options,
  });
}
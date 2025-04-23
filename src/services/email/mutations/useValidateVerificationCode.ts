import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { ValidateVerificationCodePayload } from "@/services/email/Email.interfaces";

const validateVerificationCode = async (payload: ValidateVerificationCodePayload) => {
  const headers = await getAuthHeaders();

  const response = await axiosInstance.post("/api/email/verify", payload, { headers });
  return response.status;
}


const useValidateVerificationCode = (
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>, ValidateVerificationCodePayload>, 'mutationKey' | 'mutationFn'>
) => {

  return useMutation({
    mutationKey: ["useValidateVerificationCode"],
    mutationFn: (variables: ValidateVerificationCodePayload) => validateVerificationCode(variables),
    ...options,
  });
};

export default useValidateVerificationCode;

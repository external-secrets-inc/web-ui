import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { SendVerificationCodePayload } from "@/services/email/Email.interfaces";

const sendVerificationCode = async (payload: SendVerificationCodePayload) => {
  const headers = await getAuthHeaders();

  const response = await axiosInstance.post("/api/email/verification-code", payload, { headers });
  return response.status;
}


const useSendVerificationCode = (
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>, SendVerificationCodePayload>, 'mutationKey' | 'mutationFn'>
) => {

  return useMutation({
    mutationKey: ["useSendVerificationCode"],
    mutationFn: (variables: SendVerificationCodePayload) => sendVerificationCode(variables),
    ...options,
  });
};

export default useSendVerificationCode;

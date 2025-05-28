import axiosInstance from '@/services/axiosConfig';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

interface GoogleLoginApiPayload {
  idToken: string;
  tenant: string;
}

interface GoogleLoginApiResponse {
  jwt: string;
  email?: string;
  name?: string;
}

type GoogleLoginApiError = Error;

const performGoogleLogin = async (
  payload: GoogleLoginApiPayload
): Promise<GoogleLoginApiResponse> => {
  const response = await axiosInstance.post('/public/auth/google', {
    id_token: payload.idToken,
    tenant: payload.tenant,
  });
  return response.data;
};

export const useLoginWithGoogleMutation = (
  options?: UseMutationOptions<
    GoogleLoginApiResponse,
    GoogleLoginApiError,
    GoogleLoginApiPayload
  >
) => {
  return useMutation<
    GoogleLoginApiResponse,
    GoogleLoginApiError,
    GoogleLoginApiPayload
  >({
    mutationFn: performGoogleLogin,
    ...options,
  });
};
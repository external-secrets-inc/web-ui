import { getAuthHeaders } from '@/services/auth/authHelpers';
import { apiWrapper } from '@/services/servicesHelpers';
import { ApiWrapperOptions } from '@/types';
import axiosInstance from '../axiosConfig';

export async function sendVerificationCode(userEmail: string, tenantName: string, options: Partial<ApiWrapperOptions & { manualToken?: string }> = {}) {
  const headers = await getAuthHeaders(options.manualToken);

  return apiWrapper(async () => {
    const response = await axiosInstance.post("/api/email/verification-code", {
      tenant: tenantName,
      email: userEmail,
    }, { headers });
    return response.data;
  }, { defaultError: 'Failed to send verification code', ...options });
}

export async function validateVerificationCode(userEmail: string, tenantName: string, code: string, options: Partial<ApiWrapperOptions & { manualToken?: string }> = {}) {
  const headers = await getAuthHeaders(options.manualToken);

  return apiWrapper(async () => {
    const response = await axiosInstance.post("/api/email/verify", {
      tenant: tenantName,
      email: userEmail,
      code,
    }, { headers });
    return response.data;
  }, { defaultError: 'Failed validate code', ...options });
}


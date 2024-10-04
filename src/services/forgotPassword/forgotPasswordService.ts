import axiosInstance from '@/services/axiosConfig';
import { apiWrapper } from '@/services/servicesHelpers';
import { ApiWrapperOptions } from '@/types';

export async function forgotPassword(email: string, tenant: string, options: Partial<ApiWrapperOptions> = {}) {
  return apiWrapper(async () => {
    const response = await axiosInstance.post('/public/auth/forgot-password', { email, tenant });
    return response.data;
  }, { defaultError: 'Failed to login', ...options });
}

export async function resetPassword(email: string, tenant: string, password: string, token: string, options: Partial<ApiWrapperOptions> = {}) {
  return apiWrapper(async () => {
    const response = await axiosInstance.post('/public/auth/reset-password', { email, token, password, tenant });
    return response.data;
  }, { defaultError: 'Failed to signup', ...options });
}

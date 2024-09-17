import axiosInstance from '@/services/axiosConfig';
import { apiWrapper } from '@/services/servicesHelpers';
import { getTenantIdFromToken, getUserIdFromToken } from '@/lib/utils';
import { ApiWrapperOptions } from '@/types';

export async function login(email: string, password: string, tenant: string, options: Partial<ApiWrapperOptions> = {}) {
  return apiWrapper(async () => {
    const response = await axiosInstance.post('/public/auth/login', { email, password, tenant });
    const token = response.data.token;
    const tenantId = getTenantIdFromToken(token);
    const userId = getUserIdFromToken(token);

    return {
      token,
      tenantId,
      tenant,
      userId,
    };
  }, { defaultError: 'Failed to login', ...options });
}

export async function signup(email: string, name: string, password: string, tenant: string, options: Partial<ApiWrapperOptions> = {}) {
  return apiWrapper(async () => {
    const response = await axiosInstance.post('/public/auth/signup', { email, name, password, tenant });
    return response.data;
  }, { defaultError: 'Failed to signup', ...options });
}
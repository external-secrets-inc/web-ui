import axiosInstance from '@/services/axiosConfig';
import { apiWrapper } from '@/services/servicesHelpers';
import { getTenantIdFromToken } from '@/lib/utils'; // Utility function to extract TenantId from token

export async function login(email: string, password: string, tenant: string, show: boolean) {
  return apiWrapper(async () => {
    const response = await axiosInstance.post('/public/auth/login', { email, password, tenant });
    const token = response.data.token;
    const tenantId = getTenantIdFromToken(token); // Extract tenantId from token

    return {
      token,
      tenantId, // Return tenantId along with the token
      tenant, // And tenant name
    };
  }, 'Failed to login!' , show);
}

export async function signup(email: string, name: string, password: string, tenant: string) {
  return apiWrapper(async () => {
    const response = await axiosInstance.post('/public/auth/signup', { email, name, password, tenant });
    return response.data;
  }, 'Failed to signup', true);
}
import axiosInstance from '@/services/axiosConfig';
import { getTenantIdFromToken, getUserIdFromToken } from '@/lib/utils';

interface LoginResponse {
  token: string;
  tenantId: string | null;
  tenant: string;
  userId: string | null;
}

export const login = async (
  email: string,
  password: string,
  tenant: string,
): Promise<LoginResponse> => {
  const response = await axiosInstance.post('/public/auth/login', {
    email,
    password,
    tenant,
  });
  
  const token = response.data.token;
  const tenantId = getTenantIdFromToken(token);
  const userId = getUserIdFromToken(token);

  return {
    token,
    tenantId,
    tenant,
    userId,
  };
};
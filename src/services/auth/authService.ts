import axiosInstance from '@/services/axiosConfig';
import { apiWrapper } from '@/services/servicesHelpers';

export async function login(email: string, password: string, tenant: string) {
  return apiWrapper(async () => {
    const response = await axiosInstance.post('/public/auth/login', { email, password, tenant });
    return response.data.token;
  }, 'Failed to login');
}

export async function signup(email: string, name: string, password: string, tenant: string) {
  return apiWrapper(async () => {
    const response = await axiosInstance.post('/public/auth/signup', { email, name, password, tenant });
    return response.data;
  }, 'Failed to signup');
}
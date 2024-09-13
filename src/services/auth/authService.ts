import axiosInstance from '../axiosConfig';

export async function login(email: string, password: string, tenant: string) {
  const response = await axiosInstance.post('/public/auth/login', { email, password, tenant });
  return response.data.token;
}

export async function signup(email: string, name: string, password: string, tenant: string) {
  const response = await axiosInstance.post('/public/auth/signup', { email, name, password, tenant });
  return response.data;
}

export function getAuthHeaders() {
  const authCookieName = '_auth';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${authCookieName}=`);
  const token = parts.length === 2 ? parts.pop()?.split(';').shift() : null;

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

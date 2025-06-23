import axios from 'axios';
  import { TENANT_MANAGER_DOMAIN, AUDIT_POC_DOMAIN, ESO_SERVER_DOMAIN } from '@/constants';

/**
 * Available backend services that can be targeted by axios requests
 */
const BACKEND_DOMAINS = {
  TENANT_MANAGER: TENANT_MANAGER_DOMAIN,
  AUDIT_POC: AUDIT_POC_DOMAIN,
  ESO_SERVER: ESO_SERVER_DOMAIN,
} as const;

export type BackendType = keyof typeof BACKEND_DOMAINS;

// Extend AxiosRequestConfig to support backend switching
declare module 'axios' {
  interface AxiosRequestConfig {
    /**
     * Specifies which backend service to target for this request.
     * This is processed by the AxiosInterceptor component's request interceptor.
     * @example
     * Using default TENANT_MANAGER backend
     * `axios.get('/api/users')`
     *
     * Switch to AUDIT_POC backend
     * `axios.post('/api/audit/data', data, { backend: 'AUDIT_POC' })`
     *
     * Switch to ESO_SERVER backend
     * `axios.get('/api/secrets', { backend: 'ESO_SERVER' })`
     */
    backend?: BackendType;
  }
}

/**
 * Base axios instance configured for the default TENANT_MANAGER backend.
 *
 * IMPORTANT: This instance requires the AxiosInterceptor component to be present in the
 * component tree for:
 * 1. Backend switching via the 'backend' config option
 * 2. Authentication handling (401 responses)
 *
 * @see AxiosInterceptor.tsx component for the implementation of these features
 */
const axiosInstance = axios.create({
  baseURL: BACKEND_DOMAINS.TENANT_MANAGER,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { BACKEND_DOMAINS };
export default axiosInstance;
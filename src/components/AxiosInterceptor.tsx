import React, { useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance, { BACKEND_DOMAINS } from '@/services/axiosConfig';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { useSignOut } from '@/hooks/useSignOut';
import { toast } from 'sonner';

interface AxiosInterceptorProps {
  children: ReactNode;
}

/**
 * Component that provides two essential axios interceptors:
 * 1. BackendRouter (Request): Dynamically routes requests to different backend
 *    services based on config.backend property.
 *
 * 2. AuthGuard (Response): Handles authentication failures (401), manages user
 *    session, and redirects to login when necessary. Also tracks sign-out
 *    events and clears any react query cache on sign-out.
 *
 * 3. backendErrorNormalizer (Response): Normalizes error responses with a consistent
 *    structure for each backend.
 *
 * Order is important! Backend routing must happen before any other request
 * modifications. This component must wrap any part of the app that makes
 * authenticated API calls or needs to switch between backends.
 */
const AxiosInterceptor: React.FC<AxiosInterceptorProps> = ({ children }) => {
  const navigate = useNavigate();
  const signOut = useSignOut();
  const queryClient = useQueryClient();

  useEffect(() => {
    // MUST BE FIRST: Routes requests to different backend services
    // This allows components to target specific backends (e.g., AUDIT_POC)
    const backendRouter = axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (config.backend) {
          config.baseURL = BACKEND_DOMAINS[config.backend];
        }
        return config;
      }
    );

    // Protects routes by handling authentication failures
    // Manages user session and ensures proper sign-out flow
    const authGuard = axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error?.response?.status === 401) {
          toast('Session expired', {
            description: 'Please sign in again to continue.',
            duration: 30000,
            cancel: {
              label: 'Dismiss',
              onClick: () => { },
            },
          });
          signOut({ reason: 'session_expired' });
        }
        return Promise.reject(error);
      }
    );

    // Normalizes error responses for each backend
    // Ensures a consistent error structure for components to handle
    const backendErrorNormalizer = axiosInstance.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          const backend = error.config.backend;
          if (backend === 'AUDIT_POC') {
            // Normalize error response for AUDIT_POC backend
            const expectedAuditError = error.response?.data?.message;
            error.response.data = {
              errors: {
                body: expectedAuditError || 'An error occurred',
              },
            };
          } else if (backend === 'TENANT_MANAGER') {
            // Normalize error response for TENANT_MANAGER backend
            const expectedTenantError = error.response?.data?.errors?.body;
            error.response.data = {
              errors: {
                body: expectedTenantError || 'An error occurred',
              },
            };
          } else if (backend === 'ESO_SERVER') {
            // Normalize error response for ESO_SERVER backend
            const expectedEsoError = error.response?.data?.error;
            error.response.data = {
              errors: {
                body: expectedEsoError || 'An error occurred',
              },
            };
          }
        }
        return Promise.reject(error);
      }
    );

    // Clean up in reverse order
    return () => {
      axiosInstance.interceptors.response.eject(backendErrorNormalizer);
      axiosInstance.interceptors.response.eject(authGuard);
      axiosInstance.interceptors.request.eject(backendRouter);
    };
  }, [navigate, queryClient, signOut]);

  return <>{children}</>;
};

export default AxiosInterceptor;

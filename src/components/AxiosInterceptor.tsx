import React, { useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import axiosInstance, { BACKEND_DOMAINS } from '@/services/axiosConfig';
import { trackSignedOut } from '@/analytics';

interface AxiosInterceptorProps {
  children: ReactNode;
}

/**
 * Component that provides two essential axios interceptors:
 * 1. BackendRouter: Dynamically routes requests to different backend services
 * 2. AuthGuard: Handles authentication failures and user session
 *
 * This component must wrap any part of the app that makes authenticated
 * API calls or needs to switch between backends.
 */
const AxiosInterceptor: React.FC<AxiosInterceptorProps> = ({ children }) => {
  const navigate = useNavigate();
  const signOut = useSignOut();

  useEffect(() => {
    // Routes requests to different backend services based on config.backend
    const backendRouter = axiosInstance.interceptors.request.use((config) => {
      if (config.backend) {
        config.baseURL = BACKEND_DOMAINS[config.backend];
      }
      return config;
    });

    // Handles authentication failures globally
    const authGuard = axiosInstance.interceptors.response.use(
      response => response,
      error => {
        if (error?.response?.status === 401) {
          signOut();
          trackSignedOut(false);
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    // Cleanup all interceptors on unmount
    return () => {
      axiosInstance.interceptors.request.eject(backendRouter);
      axiosInstance.interceptors.response.eject(authGuard);
    };
  }, [navigate, signOut]);

  return <>{children}</>;
};

export default AxiosInterceptor;

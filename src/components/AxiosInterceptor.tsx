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
 * 1. Request Interceptor: Handles backend switching via config.backend
 * 2. Response Interceptor: Handles authentication failures (401)
 *
 * This component must wrap any part of the app that makes authenticated
 * API calls or needs to switch between backends.
 */
const AxiosInterceptor: React.FC<AxiosInterceptorProps> = ({ children }) => {
  const navigate = useNavigate();
  const signOut = useSignOut();

  useEffect(() => {
    // REQUEST INTERCEPTOR
    // Handles backend switching before request is sent
    const reqInterceptor = axiosInstance.interceptors.request.use((config) => {
      if (config.backend) {
        config.baseURL = BACKEND_DOMAINS[config.backend];
      }
      return config;
    });

    // RESPONSE INTERCEPTOR
    // Handles authentication failures globally
    const resInterceptor = axiosInstance.interceptors.response.use(
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

    // Cleanup both interceptors on unmount
    return () => {
      axiosInstance.interceptors.request.eject(reqInterceptor);
      axiosInstance.interceptors.response.eject(resInterceptor);
    };
  }, [navigate, signOut]);

  return <>{children}</>;
};

export default AxiosInterceptor;

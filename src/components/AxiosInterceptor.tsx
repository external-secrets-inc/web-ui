import React, { useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import axiosInstance from '@/services/axiosConfig';
import { trackSignedOut } from '@/analytics';

interface AxiosInterceptorProps {
  children: ReactNode;
}

const AxiosInterceptor: React.FC<AxiosInterceptorProps> = ({ children }) => {
  const navigate = useNavigate();
  const signOut = useSignOut();

  useEffect(() => {
    const resInterceptor = (response: any) => {
      return response;
    };

    const errInterceptor = (error: any) => {
      if (error?.response?.status === 401) {
        signOut();
        trackSignedOut(false);
        navigate('/login');
      }
      return Promise.reject(error);
    };

    const interceptor = axiosInstance.interceptors.response.use(resInterceptor, errInterceptor);

    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, [navigate, signOut]);

  return <>{children}</>;
};

export default AxiosInterceptor;
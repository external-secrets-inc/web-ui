import React, { useEffect, useState } from 'react';
import { Navigate, NavigateProps } from 'react-router-dom';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { IUserData } from '@/types';
import Auth from '@/components/Auth';

interface NavigateWithOrgProps extends NavigateProps {
  children?: React.ReactNode;
  to: string;
  fallbackToLogin?: boolean;
  fallbackToSignup?: boolean;
  replace?: boolean;
}

const NavigateWithOrg: React.FC<NavigateWithOrgProps> = ({ children, to, fallbackToLogin = false, fallbackToSignup = false, replace = false, ...navigateProps }) => {
  const isAuthenticated = useIsAuthenticated();
  const authUser = useAuthUser<IUserData>();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      const user = authUser;
      const organizationURL = user?.tenant;
      if (organizationURL) {
        setRedirectTo(`/${organizationURL}${to}`);
      } else {
        console.warn('Tenant information is missing.');
        setRedirectTo(null);
      }
    } else {
      setRedirectTo(null);
    }
    setLoading(false);
  }, [isAuthenticated, authUser, to]);

  if (loading) {
    return null; // TODO: Use a proper loader or nah?
  }

  if (redirectTo) {
    return <Navigate {...navigateProps} to={redirectTo} replace={replace} />;
  }

  if (!isAuthenticated && fallbackToLogin) {
    return <Auth variant="login" />;
  }

  if (!isAuthenticated && fallbackToSignup) {
    return <Auth variant="signup" />;
  }

  return <>{children}</>; // Render children if no redirection is needed
};

export default NavigateWithOrg;
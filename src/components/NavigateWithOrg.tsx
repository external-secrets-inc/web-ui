import React, { useEffect, useState } from 'react';
import { Navigate, NavigateProps } from 'react-router-dom';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { IUserData } from '@/types';

interface NavigateWithOrgProps extends NavigateProps {
  children?: React.ReactNode;
  to: string;
  replace?: boolean;
}

/**
 * Redirects authenticated users to their org-specific path.
 * Renders children if the user is not authenticated (though this component
 * is typically used within routes already protected by authentication checks).
 */
const NavigateWithOrg: React.FC<NavigateWithOrgProps> = ({ children, to, replace = false, ...navigateProps }) => {
  const isAuthenticated = useIsAuthenticated();
  const authUser = useAuthUser<IUserData>();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let targetPath: string | null = null;
    if (isAuthenticated) {
      const user = authUser;
      const organizationURL = user?.tenant;
      if (organizationURL) {
        targetPath = `/${organizationURL}${to.startsWith('/') ? to : `/${to}`}`;
      } else {
        console.error('NavigateWithOrg: User is authenticated but tenant information is missing.');
      }
    }

    setRedirectTo(targetPath);
    setLoading(false);
  }, [isAuthenticated, authUser, to]);

  if (loading) {
    return null;
  }

  if (redirectTo) {
    return <Navigate {...navigateProps} to={redirectTo} replace={replace} />;
  }

  return <>{children}</>;
};

export default NavigateWithOrg;
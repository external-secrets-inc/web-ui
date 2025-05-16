import { IUserData } from "@/types";
import React, { useEffect, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import { Navigate, Outlet } from "react-router-dom";

/**
 * A layout guard component specifically for auth routes (/login, /signup).
 * If the user is authenticated (and has an org), it redirects them to the main app (/org/agents).
 * If the user is not authenticated, it renders an <Outlet /> to display the nested route (AuthLayout).
 * Returns null during the loading state to prevent content flash.
 */
export const AuthRedirectGuard: React.FC = () => {
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
        targetPath = `/${organizationURL}/agents`;
      } else {
        console.error(
          "AuthRedirectGuard: User is authenticated but tenant information is missing."
        );
      }
    }

    setRedirectTo(targetPath);
    setLoading(false);
  }, [isAuthenticated, authUser]);

  if (loading) {
    return null;
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

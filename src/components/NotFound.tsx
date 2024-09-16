import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { IUserData } from '@/types';

export function NotFound() {
  const isAuthenticated = useIsAuthenticated();
  const authUser = useAuthUser<IUserData>();

  const tenant = isAuthenticated ? authUser?.tenant : null;
  const agentsPath = tenant ? `/${tenant}/agents` : "/";

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-4">Oops! Page Not Found</h2>
      <p className="mb-8 text-gray-500">
        Sorry, we couldn't find the page you were looking for.
      </p>

      <div className="flex space-x-4">
        {isAuthenticated ? (
          <Button asChild className="mt-4">
            <Link to={agentsPath}>Back to Your Agents</Link>
          </Button>
        ) : (
          <Button asChild className="mt-4">
            <Link to="/">Back to Home</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
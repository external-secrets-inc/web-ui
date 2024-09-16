import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function NotFound() {

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-4">Oops! Page Not Found</h2>
      <p className="mb-8 text-gray-500">
        Sorry, we couldn't find the page you were looking for. It may have been moved or deleted.
      </p>

      <div className="flex space-x-4">
        <Button asChild className="mt-4">
          <Link to="/">Go to Home</Link>
        </Button>
        <Button asChild className="mt-4">
          <Link to="/login">Back to Login</Link>
        </Button>
      </div>
    </div>
  );
}
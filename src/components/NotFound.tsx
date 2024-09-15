import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/'); // Auto-redirect to home after 5 seconds
    }, 5000);

    return () => clearTimeout(timer); // Clear timeout if the user leaves the page
  }, [navigate]);

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

      <p className="text-gray-400 mt-4">You will be redirected to the homepage in 5 seconds.</p>
    </div>
  );
}
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function NotFound() {
  return (
    <>
      <h1 className="text-5xl">404</h1>
      <h2 className="text-xl">Not Found</h2>

      <Button asChild className="mt-8">
        <Link to="/">Back to Home</Link>
      </Button>
    </>
  )
}
"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <p className="mb-6 max-w-md">
        {error.message ||
          "An unexpected error occurred. This might be due to missing environment variables or configuration issues."}
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>Try again</Button>
        <Link href="/">
          <Button variant="outline">Go back home</Button>
        </Link>
      </div>
    </div>
  )
}

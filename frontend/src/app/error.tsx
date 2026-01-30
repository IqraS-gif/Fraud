
"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-slate-950 text-white">
      <h2 className="text-xl font-bold text-red-500">Something went wrong!</h2>
      <p className="text-slate-400">{error.message || "An unexpected error occurred."}</p>
      <Button
        variant="outline"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  )
}

"use client"

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
        <p className="text-gray-600">
          Don&apos;t worry, it&apos;s not your fault. We&apos;re working on it!
        </p>
        <Button
          onClick={reset}
          variant="outline"
          className="mt-4"
        >
          Try again
        </Button>
      </div>
    </div>
  )
} 
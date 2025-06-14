"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      event.preventDefault()
      setError(event.error || new Error("An unknown error occurred"))
      setHasError(true)

      // Log to monitoring service if available
      console.error("Unhandled error:", event.error)
    }

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      event.preventDefault()
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason) || "An unknown promise rejection occurred")

      setError(error)
      setHasError(true)

      // Log to monitoring service if available
      console.error("Unhandled promise rejection:", event.reason)
    }

    window.addEventListener("error", errorHandler)
    window.addEventListener("unhandledrejection", rejectionHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
      window.removeEventListener("unhandledrejection", rejectionHandler)
    }
  }, [])

  if (!hasError) return <>{children}</>

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-tss-background">
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/5 border border-white/10 shadow-xl rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent rounded-2xl z-0 opacity-50" />
        <CardHeader className="relative z-10">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Something went wrong</CardTitle>
          <CardDescription className="text-center">We encountered an unexpected error</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg border border-red-500/20 mb-4 overflow-auto max-h-32">
            <p className="font-mono text-sm">{error?.message || "Unknown error"}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center relative z-10 border-t border-white/5 bg-white/2">
          <Button onClick={() => window.location.reload()} className="bg-red-500 hover:bg-red-600 text-white">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

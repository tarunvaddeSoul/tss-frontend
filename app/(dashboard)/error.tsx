"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

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
    <div className="flex items-center justify-center p-4 bg-background text-foreground" style={{ minHeight: "calc(100vh - 200px)" }}>
      <Card className="w-full max-w-md relative bg-card border shadow-xl rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl z-0" />
        <CardHeader className="relative z-10">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Something went wrong</CardTitle>
          <CardDescription className="text-center">
            This page could not be loaded. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg border border-destructive/20 mb-4 overflow-auto max-h-32">
            <p className="font-mono text-sm">{error?.message || "Unknown error"}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center relative z-10 border-t">
          <Button onClick={() => reset()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

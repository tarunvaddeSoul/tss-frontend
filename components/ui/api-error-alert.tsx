"use client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ApiErrorAlertProps {
  error: Error | null
  title?: string
  onDismiss?: () => void
  className?: string
}

export function ApiErrorAlert({ error, title = "Error", onDismiss, className }: ApiErrorAlertProps) {
  if (!error) return null

  return (
    <Alert variant="destructive" className={cn("relative", className)}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="mt-2 whitespace-pre-wrap">{error.message}</div>
      </AlertDescription>
      {onDismiss && (
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 p-0" onClick={onDismiss}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  )
}

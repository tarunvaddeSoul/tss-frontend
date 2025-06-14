"use client"

import { useState, useEffect } from "react"
import { WifiOff } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    // Define event handlers
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: "Connection Restored",
        description: "You're back online.",
        variant: "default",
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: "Connection Lost",
        description: "You're currently offline. Some features may be unavailable.",
        variant: "destructive",
      })
    }

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full",
          "bg-red-500/20 text-red-500 border border-red-500/20",
          "shadow-lg backdrop-blur-sm",
        )}
      >
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">Offline</span>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/hooks/use-auth"
import { Shield } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { motion } from "framer-motion"

function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isInitializing } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if user is logged in
    if (!isInitializing && user) {
      router.push("/dashboard")
    }
  }, [user, isInitializing, router])

  // Show loading screen only for initial auth check
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        <div className="flex flex-col items-center gap-4">
          <Shield className="h-12 w-12 text-primary animate-pulse" />
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_50%)]" />
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md relative"
      >
        <div className="absolute inset-0 bg-card/50 backdrop-blur-sm rounded-lg -z-10" />
        {children}
      </motion.div>
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Tulsyan Security Services. All rights reserved.</p>
      </div>
    </div>
  )
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </AuthProvider>
  )
}

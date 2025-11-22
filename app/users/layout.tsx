"use client"

import type React from "react"
import { AuthProvider } from "@/hooks/use-auth"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Shield } from "lucide-react"
import { motion } from "framer-motion"

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}


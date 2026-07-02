"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { AuthProvider, useAuth } from "@/hooks/use-auth"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { motion, useReducedMotion } from "framer-motion"

function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isInitializing } = useAuth()
  const router = useRouter()
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!isInitializing && user) {
      router.push("/dashboard")
    }
  }, [user, isInitializing, router])

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Image src="/tss-logo.png" alt="TSS" width={48} height={48} className="animate-pulse object-contain" />
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Loading</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute inset-x-0 top-0 h-1 bg-brand" />
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="mb-8 flex flex-col items-center gap-3">
        <Image src="/tss-logo.png" alt="Tulsyan Security Services" width={44} height={44} className="object-contain" />
        <div className="text-center">
          <div className="font-display text-base font-bold tracking-tight">Tulsyan Security Services</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Staff Portal</div>
        </div>
      </div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="z-10 w-full max-w-md"
      >
        {children}
      </motion.div>

      <div className="mt-8 text-center">
        <p className="font-mono text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} Tulsyan Security Services. All rights reserved.
        </p>
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

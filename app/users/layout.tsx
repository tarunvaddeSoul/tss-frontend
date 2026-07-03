"use client"

import type React from "react"
import Image from "next/image"
import { AuthProvider } from "@/hooks/use-auth"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { motion, useReducedMotion } from "framer-motion"

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion()

  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}

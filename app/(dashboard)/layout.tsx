"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { AuthProvider, useAuth } from "@/hooks/use-auth"

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isInitializing } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isInitializing && !user) {
      router.push("/login")
    }
  }, [user, isInitializing, router])

  if (isInitializing) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden" data-dashboard-layout>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 min-h-0">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-h-0">{children}</main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  )
}

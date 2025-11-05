"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Shield, LogOut, ChevronRight, Building2, Briefcase, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SettingsNavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const settingsNavItems: SettingsNavItem[] = [
  {
    title: "Profile",
    href: "/settings/profile",
    icon: <User className="h-4 w-4" />,
  },
  {
    title: "Security",
    href: "/settings/security",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    title: "Department",
    href: "/settings/department",
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    title: "Designation",
    href: "/settings/designation",
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    title: "Salary Rate Schedule",
    href: "/settings/salary-rate-schedule",
    icon: <DollarSign className="h-4 w-4" />,
  },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    setIsLoggingOut(false)
    setIsLogoutDialogOpen(false)
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 shadow-xl rounded-2xl overflow-hidden">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Settings</h2>
              <nav className="space-y-1">
                {settingsNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      pathname === item.href
                        ? "bg-primary/20 text-primary"
                        : "text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/5",
                    )}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                    {pathname === item.href && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Link>
                ))}
                <button
                  onClick={() => setIsLogoutDialogOpen(true)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>
        </aside>
        <div className="flex-1">{children}</div>
      </div>

      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="backdrop-blur-sm bg-white/5 border border-white/10 shadow-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>Are you sure you want to logout from your account?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsLogoutDialogOpen(false)}
              className="border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

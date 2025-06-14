"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  LogOut,
  Shield,
  Settings,
  HelpCircle,
  Mail,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"

interface SidebarProps {
  className?: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  subItems?: { title: string; href: string }[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Employees",
    href: "/employees",
    icon: Users,
    subItems: [
      {
        title: "List Employees",
        href: "/employees",
      },
      {
        title: "Add Employee",
        href: "/employees/add",
      },
    ],
  },
  {
    title: "Companies",
    href: "/companies",
    icon: Building2,
    subItems: [
      {
        title: "List Companies",
        href: "/companies",
      },
      {
        title: "Add Company",
        href: "/companies/add",
      },
    ],
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: ClipboardCheck,
    subItems: [
      { title: "Mark By Site", href: "/attendance/mark-by-site" },
      { title: "Upload", href: "/attendance/upload" },
      { title: "Reports", href: "/attendance/reports" },
    ],
  },
  {
    title: "Payroll",
    href: "/payroll",
    icon: DollarSign,
    subItems: [
      {
        title: "Calculate Payroll",
        href: "/payroll/calculate",
      },
      {
        title: "Reports",
        href: "/payroll/reports",
      },
    ],
  },
]

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [isMobile, setIsMobile] = useState(false)
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Check if we're on mobile and handle resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile && !collapsed) {
        setCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [collapsed])

  // Initialize expanded state based on current path
  useEffect(() => {
    const newExpandedItems: Record<string, boolean> = {}

    navItems.forEach((item) => {
      if (item.subItems) {
        const isActive = item.subItems.some(
          (subItem) => pathname === subItem.href || pathname.startsWith(`${subItem.href}/`),
        )
        newExpandedItems[item.href] = isActive
      }
    })

    setExpandedItems(newExpandedItems)
  }, [pathname])

  const toggleExpand = (href: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    setExpandedItems((prev) => ({
      ...prev,
      [href]: !prev[href],
    }))
  }

  const toggleCollapse = () => {
    setCollapsed(!collapsed)
    // Close all expanded items when collapsing
    if (!collapsed) {
      setExpandedItems({})
    }
  }

  const handleHelpClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setHelpDialogOpen(true)
  }

  const handleSendEmail = () => {
    window.location.href = "mailto:vaddeofficial@gmail.com?subject=TSS Support Request"
  }

  // Check if a nav item or any of its subitems is active
  const isNavItemActive = (item: NavItem) => {
    if (pathname === item.href) return true
    if (item.subItems) {
      return item.subItems.some((subItem) => pathname === subItem.href || pathname.startsWith(`${subItem.href}/`))
    }
    return false
  }

  return (
    <>
      <aside
        className={cn(
          "flex flex-col bg-card text-card-foreground border-r transition-all duration-300 h-screen",
          collapsed ? "w-[70px]" : "w-[280px]",
          className,
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center h-16 px-4 border-b">
          {!collapsed ? (
            <div className="flex items-center gap-2 flex-1">
              <Shield className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">TSS</span>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          )}

          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className={cn("rounded-full hover:bg-muted", collapsed && "mx-auto")}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </Button>
          )}
        </div>

        {/* User profile */}
        {!collapsed && (
          <div className="flex items-center gap-3 p-4 border-b">
            <Avatar>
              <AvatarImage src={user?.avatar || ""} alt={user?.name || "User"} />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = isNavItemActive(item)

              return (
                <div key={item.href} className="relative">
                  {/* Main nav item */}
                  <Link
                    href={item.subItems ? "#" : item.href}
                    onClick={item.subItems ? (e) => toggleExpand(item.href, e) : undefined}
                    className={cn(
                      "flex items-center h-10 px-2 rounded-md transition-colors group",
                      isActive && !item.subItems && "bg-primary text-primary-foreground",
                      isActive && item.subItems && "bg-muted",
                      !isActive && "hover:bg-muted/50",
                      collapsed && "justify-center",
                    )}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-center w-6 h-6">
                            <item.icon
                              size={20}
                              className={cn(
                                "flex-shrink-0",
                                isActive && !item.subItems && "text-primary-foreground",
                                isActive && item.subItems && "text-primary",
                              )}
                            />
                          </div>
                        </TooltipTrigger>
                        {collapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
                      </Tooltip>
                    </TooltipProvider>

                    {!collapsed && (
                      <>
                        <span className={cn("ml-2 text-sm", isActive && item.subItems && "text-primary font-medium")}>
                          {item.title}
                        </span>

                        {item.subItems && (
                          <ChevronDown
                            size={16}
                            className={cn(
                              "ml-auto transition-transform duration-200",
                              expandedItems[item.href] && "transform rotate-180",
                            )}
                          />
                        )}
                      </>
                    )}
                  </Link>

                  {/* Subitems */}
                  {item.subItems && (
                    <>
                      {/* Collapsed state: show in tooltip */}
                      {collapsed && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="mt-1 flex justify-center">
                                <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="p-0">
                              <div className="flex flex-col min-w-[180px] p-1 bg-card rounded-md shadow-md">
                                {item.subItems.map((subItem) => (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    className={cn(
                                      "flex items-center h-9 px-3 rounded-md transition-colors",
                                      pathname === subItem.href
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                  >
                                    <span className="h-5 w-5 flex items-center justify-center">
                                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                    </span>
                                    <span className="text-sm">{subItem.title}</span>
                                  </Link>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Expanded state: show inline */}
                      {!collapsed && expandedItems[item.href] && (
                        <div className="mt-1 ml-4 pl-4 border-l space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={cn(
                                "flex items-center h-9 px-3 rounded-md transition-colors",
                                pathname === subItem.href
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                              )}
                            >
                              <span className="h-5 w-5 flex items-center justify-center">
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              </span>
                              <span className="text-sm">{subItem.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Footer actions */}
        <div className="p-3 border-t space-y-1">
          {!collapsed ? (
            <>
              <Button variant="ghost" className="w-full justify-start h-10" asChild>
                <Link href="/settings/profile">
                  <Settings size={18} className="mr-2" />
                  <span className="text-sm">Settings</span>
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start h-10" onClick={handleHelpClick}>
                <HelpCircle size={18} className="mr-2" />
                <span className="text-sm">Help & Support</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => logout()}
              >
                <LogOut size={18} className="mr-2" />
                <span className="text-sm">Logout</span>
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href="/settings/profile">
                        <Settings size={18} />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Settings</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleHelpClick}>
                      <HelpCircle size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Help & Support</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => logout()}>
                      <LogOut size={18} className="text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Logout</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </aside>

      {/* Help & Support Dialog */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Help & Support</DialogTitle>
            <DialogDescription>Need assistance with TSS? Contact our support team for help.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium">Contact Email:</p>
              <div className="flex items-center gap-2 bg-muted p-3 rounded-md">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm">vaddeofficial@gmail.com</span>
              </div>
            </div>
            <Button className="w-full" onClick={handleSendEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

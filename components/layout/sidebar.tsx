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
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
        href: "/employees/list",
      },
      {
        title: "Advanced Search",
        href: "/employees/advanced-search",
      },
      // {
      //   title: "Add Employee",
      //   href: "/employees/add",
      // },
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
      // {
      //   title: "Add Company",
      //   href: "/companies/add",
      // },
      // {
      //   title: "Salary Templates",
      //   href: "/companies/templates",
      // },
    ],
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: ClipboardCheck,
  },
  {
    title: "Payroll",
    href: "/payroll",
    icon: DollarSign,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

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

  const toggleExpand = (href: string) => {
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

  return (
    <div
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
            <Shield className="h-8 w-8 text-primary fill-secondary" />
          </div>
        )}

        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className={cn("rounded-full", collapsed && "mx-auto")}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <div key={item.href}>
                {item.subItems ? (
                  // Item with subitems
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full flex items-center justify-start h-10",
                        pathname.startsWith(item.href) && "bg-muted",
                        collapsed && "justify-center p-2",
                      )}
                      onClick={() => !collapsed && toggleExpand(item.href)}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center w-6 h-6">
                              <item.icon size={20} className="flex-shrink-0" />
                            </div>
                          </TooltipTrigger>
                          {collapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
                        </Tooltip>
                      </TooltipProvider>
                      {!collapsed && (
                        <>
                          <span className="ml-2 text-sm">{item.title}</span>
                          <ChevronDown
                            size={16}
                            className={cn(
                              "transition-transform duration-200 ml-auto",
                              expandedItems[item.href] && "transform rotate-180",
                            )}
                          />
                        </>
                      )}
                    </Button>

                    {/* Subitems */}
                    {collapsed ? (
                      // Show subitems as tooltip when collapsed
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full flex items-center justify-center h-10",
                                pathname.startsWith(item.href) && "bg-muted",
                                "p-2"
                              )}
                            >
                              <div className="flex items-center justify-center w-6 h-6">
                                <item.icon size={20} className="flex-shrink-0" />
                              </div>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="p-0">
                            <div className="flex flex-col min-w-[160px]">
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
                    ) : (
                      // Show subitems inline when expanded
                      expandedItems[item.href] && (
                        <div className="pl-8 border-l space-y-1 ml-3">
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
                      )
                    )}
                  </div>
                ) : (
                  // Regular item
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full flex items-center h-10",
                        pathname === item.href && "bg-primary text-primary-foreground",
                        collapsed ? "justify-center p-2" : "justify-start",
                      )}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center w-6 h-6">
                              <item.icon size={20} className="flex-shrink-0" />
                            </div>
                          </TooltipTrigger>
                          {collapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
                        </Tooltip>
                      </TooltipProvider>

                      {!collapsed && <span className="ml-2 text-sm">{item.title}</span>}
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>
      </ScrollArea>

      {/* Footer actions */}
      <div className="p-2 border-t space-y-1">
        {!collapsed ? (
          <>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/settings">
                <Settings size={20} className="mr-2" />
                <span className="text-sm">Settings</span>
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/help">
                <HelpCircle size={20} className="mr-2" />
                <span className="text-sm">Help & Support</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => logout()}
            >
              <LogOut size={20} className="mr-2" />
              <span className="text-sm">Logout</span>
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings">
                      <Settings size={20} />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => logout()}>
                    <LogOut size={20} className="text-destructive" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  )
}

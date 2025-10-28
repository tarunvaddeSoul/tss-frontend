"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  DollarSign,
  ChevronRight,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  Mail,
  Menu,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

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
      { title: "List Employees", href: "/employees" },
      { title: "Add Employee", href: "/employees/add" },
      { title: "Advanced Search", href: "/employees/advanced-search" },
    ],
  },
  {
    title: "Companies",
    href: "/companies",
    icon: Building2,
    subItems: [
      { title: "List Companies", href: "/companies" },
      { title: "Add Company", href: "/companies/add" },
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
      { title: "Calculate Payroll", href: "/payroll/calculate" },
      { title: "Reports", href: "/payroll/reports" },
    ],
  },
]

export function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
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
    setExpandedItems((prev) => ({ ...prev, [href]: !prev[href] }))
  }

  const handleHelpClick = () => setHelpDialogOpen(true)

  const handleSendEmail = () => {
    window.location.href = "mailto:vaddeofficial@gmail.com?subject=TSS Support Request"
  }

  const isNavItemActive = (item: NavItem) => {
    if (pathname === item.href) return true
    if (item.subItems) {
      return item.subItems.some((subItem) => pathname === subItem.href || pathname.startsWith(`${subItem.href}/`))
    }
    return false
  }

  // Desktop Sidebar Component
  const DesktopSidebar = ({ collapsed }: { collapsed: boolean }) => (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-card text-card-foreground border-r transition-all duration-300 h-screen",
        collapsed ? "w-[70px]" : "w-[280px]",
        className,
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b">
        {!collapsed ? (
          <div className="flex items-center gap-2 flex-1">
            <Image src="/tss-logo.png" alt="TSS Logo" width={32} height={32} priority />
            <span className="font-bold text-xl">Tulsyan</span>
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <Image src="/tss-logo.png" alt="TSS Logo" width={32} height={32} priority />
          </div>
        )}
      </div>

      {/* User Profile */}
      {!collapsed && user && (
        <div className="flex items-center gap-3 p-4 border-b">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = isNavItemActive(item)
            const Icon = item.icon

            return (
              <div key={item.href}>
                {item.subItems ? (
                  <button
                    onClick={() => toggleExpand(item.href)}
                    className={cn(
                      "w-full flex items-center h-10 px-3 rounded-md transition-colors",
                      collapsed ? "justify-center" : "justify-between",
                      isActive && !expandedItems[item.href]
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </div>
                    {!collapsed && <ChevronDown size={16} className={cn(expandedItems[item.href] && "rotate-180")} />}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "w-full flex items-center h-10 px-3 rounded-md transition-colors",
                      collapsed ? "justify-center" : "",
                      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Icon size={20} />
                    {!collapsed && <span className="ml-3 text-sm">{item.title}</span>}
                  </Link>
                )}

                {/* Subitems */}
                {item.subItems && expandedItems[item.href] && !collapsed && (
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
                        <span className="h-1.5 w-1.5 rounded-full bg-current mr-3" />
                        <span className="text-sm">{subItem.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-3 border-t space-y-1">
        {!collapsed ? (
          <>
            <Button variant="ghost" className="w-full justify-start h-9" asChild>
              <Link href="/settings/profile">
                <Settings size={18} className="mr-2" />
                Settings
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start h-9" onClick={handleHelpClick}>
              <HelpCircle size={18} className="mr-2" />
              Help
            </Button>
            <Button variant="ghost" className="w-full justify-start h-9 text-destructive" onClick={logout}>
              <LogOut size={18} className="mr-2" />
              Logout
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
                <TooltipContent side="right">Help</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={logout}>
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
  )

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Image src="/tss-logo.png" alt="TSS Logo" width={32} height={32} priority />
            <SheetTitle>Tulsyan</SheetTitle>
          </div>
        </SheetHeader>

        {user && (
          <div className="flex items-center gap-3 p-4 border-b">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = isNavItemActive(item)
              const Icon = item.icon

              return (
                <div key={item.href}>
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => toggleExpand(item.href)}
                        className={cn(
                          "w-full flex items-center justify-between h-10 px-3 rounded-md transition-colors",
                          isActive && !expandedItems[item.href]
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={20} />
                          <span className="text-sm">{item.title}</span>
                        </div>
                        <ChevronDown size={16} className={cn(expandedItems[item.href] && "rotate-180")} />
                      </button>
                      {expandedItems[item.href] && (
                        <div className="mt-1 ml-4 pl-4 border-l space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "flex items-center h-9 px-3 rounded-md transition-colors",
                                pathname === subItem.href
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                              )}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current mr-3" />
                              <span className="text-sm">{subItem.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "w-full flex items-center h-10 px-3 rounded-md transition-colors",
                        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <Icon size={20} />
                      <span className="ml-3 text-sm">{item.title}</span>
                    </Link>
                  )}
                </div>
              )
            })}
          </nav>
        </ScrollArea>

        <div className="p-3 border-t space-y-1">
          <Button variant="ghost" className="w-full justify-start h-9" asChild>
            <Link href="/settings/profile">
              <Settings size={18} className="mr-2" />
              Settings
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start h-9" onClick={handleHelpClick}>
            <HelpCircle size={18} className="mr-2" />
            Help
          </Button>
          <Button variant="ghost" className="w-full justify-start h-9 text-destructive" onClick={logout}>
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar collapsed={false} />

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

export function MobileMenuToggle() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <button
      onClick={() => setMobileOpen(!mobileOpen)}
      className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
      aria-label="Toggle menu"
    >
      {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
  )
}

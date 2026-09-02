"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"
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
  ChevronsUpDown,
  LogOut,
  Settings,
  HelpCircle,
  Mail,
  Menu,
  X,
  ChevronLeft,
  Zap,
  Keyboard,
  Command,
  User,
  Shield,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps {
  className?: string
}

// Sidebar Context for collapse state
interface SidebarContextType {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebarContext() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebarContext must be used within Sidebar")
  }
  return context
}

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  subItems?: { title: string; href: string }[]
}

interface NavSection {
  header?: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    header: "Everyday Work",
    items: [
      {
        title: "Attendance",
        href: "/attendance",
        icon: ClipboardCheck,
        subItems: [
          { title: "Mark by Site", href: "/attendance/mark-by-site" },
          { title: "Upload Attendance", href: "/attendance/upload" },
          { title: "Records", href: "/attendance/records" },
          { title: "Reports", href: "/attendance/reports" },
        ],
      },
      {
        title: "Payroll",
        href: "/payroll",
        icon: DollarSign,
        subItems: [
          { title: "Run Payroll", href: "/payroll/calculate" },
          { title: "Reports", href: "/payroll/reports" },
        ],
      },
    ],
  },
  {
    header: "Master Data",
    items: [
      {
        title: "Employees",
        href: "/employees",
        icon: Users,
        subItems: [
          { title: "All Employees", href: "/employees" },
          { title: "Add Employee", href: "/employees/add" },
          { title: "Search Employees", href: "/employees/advanced-search" },
        ],
      },
      {
        title: "Clients",
        href: "/clients",
        icon: Building2,
        subItems: [
          { title: "All Clients", href: "/clients" },
          { title: "Add Client", href: "/clients/add" },
          { title: "Salary Slips", href: "/clients/salary-slips" },
        ],
      },
    ],
  },
]

export const navItems: NavItem[] = navSections.flatMap((section) => section.items)

export function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed")
      return saved === "true"
    }
    return false
  })
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed))
  }, [collapsed])

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Keyboard shortcut for sidebar toggle (Cmd/Ctrl + B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault()
        setCollapsed((prev) => !prev)
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "K") {
        e.preventDefault()
        setShowKeyboardShortcuts(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev)
  }

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

  const renderAccountMenu = () => (
    <DropdownMenuContent side="top" align="start" className="w-56">
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none truncate">{user?.name}</p>
          <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/settings/profile">
          <User className="mr-2 h-4 w-4" />
          My Profile
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/settings/security">
          <Shield className="mr-2 h-4 w-4" />
          Password
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => setLogoutConfirmOpen(true)}
        className="text-destructive focus:text-destructive"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  )

  // Desktop Sidebar Component
  const DesktopSidebar = () => (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggleCollapsed }}>
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-background border-r transition-all duration-200 h-screen relative group overflow-visible",
          collapsed ? "w-[72px]" : "w-[264px]",
          className,
        )}
      >
        {/* Logo Section - Always visible */}
        <div className="flex items-center h-16 px-4 border-b relative overflow-visible">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 flex-1">
              <Image src="/tss-logo.png" alt="TSS Logo" width={30} height={30} priority />
              <span className="leading-tight">
                <span className="block font-display text-[13px] font-bold tracking-tight">Tulsyan Security</span>
                <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Ops Portal</span>
              </span>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-pointer">
                      <Image src="/tss-logo.png" alt="TSS Logo" width={30} height={30} priority />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="font-bold">Tulsyan Security</div>
                    <div className="text-xs text-muted-foreground">Services Pvt. Ltd.</div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        
        {/* Collapse Toggle Button - Positioned relative to sidebar */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute -right-3 top-8 -translate-y-1/2 h-6 w-6 rounded-full bg-card border shadow-sm hover:bg-muted transition-colors z-50 pointer-events-auto",
            collapsed && "rotate-180"
          )}
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>


        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {navSections.map((section, sIdx) => (
              <div key={section.header ?? `section-${sIdx}`} className={sIdx > 0 ? "mt-3" : ""}>
                {section.header &&
                  (collapsed ? (
                    <div className="mx-2 my-2 border-t border-border/60" />
                  ) : (
                    <p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
                      {section.header}
                    </p>
                  ))}
                <div className="space-y-1">
                  {section.items.map((item) => {
                const isActive = isNavItemActive(item)
                const Icon = item.icon

                return (
                  <div key={item.href}>
                    {item.subItems ? (
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => toggleExpand(item.href)}
                              className={cn(
                                "w-full flex items-center h-10 px-3 rounded-md transition-all relative group/item",
                                collapsed ? "justify-center" : "justify-between",
                                isActive && !expandedItems[item.href]
                                  ? "bg-brand/[0.07] text-brand"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Icon size={20} className="shrink-0" />
                                {!collapsed && <span className="text-sm">{item.title}</span>}
                              </div>
                              {!collapsed && (
                                <ChevronDown
                                  size={16}
                                  className={cn(
                                    "shrink-0 transition-transform",
                                    expandedItems[item.href] && "rotate-180"
                                  )}
                                />
                              )}
                              {collapsed && isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand" />
                              )}
                            </button>
                          </TooltipTrigger>
                          {collapsed && (
                            <TooltipContent side="right">
                              <div>{item.title}</div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.href}
                              className={cn(
                                "w-full flex items-center h-10 px-3 rounded-md transition-all relative group/item",
                                collapsed ? "justify-center" : "",
                                isActive
                                  ? "bg-brand/[0.07] text-brand font-medium"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                              )}
                            >
                              <Icon size={20} className="shrink-0" />
                              {!collapsed && <span className="ml-3 text-sm">{item.title}</span>}
                              {collapsed && isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand" />
                              )}
                            </Link>
                          </TooltipTrigger>
                          {collapsed && (
                            <TooltipContent side="right">
                              <div>{item.title}</div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* Subitems */}
                    {item.subItems && expandedItems[item.href] && !collapsed && (
                      <div className="mt-1 ml-4 pl-4 border-l border-border/50 space-y-1 animate-in slide-in-from-top-2">
                        {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={cn(
                                "flex items-center h-9 px-3 rounded-md transition-colors group/sub",
                                pathname === subItem.href
                                  ? "bg-brand/[0.07] text-brand font-medium"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                              )}
                            >
                              <span
                                className={cn(
                                  "h-1 w-1 rounded-full mr-3 transition-all",
                                  pathname === subItem.href
                                    ? "bg-brand"
                                    : "bg-muted-foreground/30 group-hover/sub:bg-brand/50"
                                )}
                              />
                              <span className="text-sm">{subItem.title}</span>
                            </Link>
                          ))}
                      </div>
                    )}
                  </div>
                )
              })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Quick Actions / Innovations Section */}
        {!collapsed && (
          <div className="px-3 pb-2 border-t pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 text-xs text-muted-foreground"
              onClick={() => setShowKeyboardShortcuts(true)}
            >
              <Keyboard className="h-3.5 w-3.5 mr-2" />
              Keyboard Shortcuts
            </Button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-3 border-t space-y-1">
          {!collapsed ? (
            <>
              <Button variant="ghost" className="w-full justify-start h-9" asChild>
                <Link href="/settings">
                  <Settings size={18} className="mr-2" />
                  Settings
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start h-9" onClick={handleHelpClick}>
                <HelpCircle size={18} className="mr-2" />
                Help
              </Button>
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="mt-1 w-full flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  {renderAccountMenu()}
                </DropdownMenu>
              )}
            </>
          ) : (
            <TooltipProvider delayDuration={100}>
              <div className="flex flex-col items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" asChild className="hover:bg-muted transition-colors">
                      <Link href="/settings">
                        <Settings size={18} />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Settings</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleHelpClick} className="hover:bg-muted transition-colors">
                      <HelpCircle size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Help</TooltipContent>
                </Tooltip>
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-full outline-none">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    {renderAccountMenu()}
                  </DropdownMenu>
                )}
              </div>
            </TooltipProvider>
          )}
        </div>
      </aside>
    </SidebarContext.Provider>
  )

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center gap-2.5">
            <Image src="/tss-logo.png" alt="TSS Logo" width={30} height={30} priority />
            <SheetTitle className="text-[15px]">Tulsyan Security</SheetTitle>
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
                            ? "bg-brand/[0.07] text-brand"
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
                                  ? "bg-brand/[0.07] text-brand font-medium"
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
                        isActive ? "bg-brand/[0.07] text-brand font-medium" : "text-muted-foreground hover:bg-muted",
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
      <DesktopSidebar />

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

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>Use these shortcuts to navigate faster</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <Command className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Toggle Sidebar</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="font-mono text-xs">
                  {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}
                </Badge>
                <span className="text-xs text-muted-foreground">+</span>
                <Badge variant="outline" className="font-mono text-xs">
                  B
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Show Shortcuts</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="font-mono text-xs">
                  {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}
                </Badge>
                <span className="text-xs text-muted-foreground">+</span>
                <Badge variant="outline" className="font-mono text-xs">
                  Shift
                </Badge>
                <span className="text-xs text-muted-foreground">+</span>
                <Badge variant="outline" className="font-mono text-xs">
                  K
                </Badge>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation */}
      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Log out?</DialogTitle>
            <DialogDescription>You will need to sign in again to access the portal.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setLogoutConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </DialogFooter>
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

"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { AlertCircle, FileSpreadsheet, Search, Building2, User, TrendingUp, RefreshCw, FileText, Download, Eye, Loader2, X, DollarSign, Info, Settings, Check } from "lucide-react"
import { SalaryCategory } from "@/types/salary"
import { useToast } from "@/components/ui/use-toast"
import { payrollService } from "@/services/payrollService"
import { useCompany } from "@/hooks/use-company"
import { employeeService } from "@/services/employeeService"
import { MonthPicker } from "@/components/ui/month-picker"
import { exportPayrollToExcel, formatCurrency, formatDate, getCurrentDateTime, type PayrollReportRecord } from "@/utils/payroll-export"
import { PayrollReportResponseData, ReportFilters, ReportType } from "@/types/payroll"
import type { Employee } from "@/types/employee"
import dynamic from "next/dynamic"
import { format } from "date-fns"

// Dynamically import PDF preview dialog to prevent SSR issues
const DynamicPdfPreviewDialog = dynamic(
  () => import("@/components/pdf/pdf-preview-dialog").then((mod) => ({ default: mod.PdfPreviewDialog })),
  {
    ssr: false,
  },
)

// Field configuration for column customization
interface ColumnField {
  key: string
  label: string
  category: "essential" | "deductions" | "allowances" | "information"
  defaultVisible: boolean
}

const COLUMN_FIELDS: ColumnField[] = [
  { key: "employeeId", label: "Employee ID", category: "essential", defaultVisible: true },
  { key: "company", label: "Company", category: "essential", defaultVisible: true },
  { key: "month", label: "Month", category: "essential", defaultVisible: true },
  { key: "category", label: "Category", category: "essential", defaultVisible: true },
  { key: "rate", label: "Rate", category: "essential", defaultVisible: true },
  { key: "basicPay", label: "Basic Pay", category: "essential", defaultVisible: true },
  { key: "grossSalary", label: "Gross Salary", category: "essential", defaultVisible: true },
  { key: "netSalary", label: "Net Salary", category: "essential", defaultVisible: true },
  { key: "pf", label: "PF", category: "deductions", defaultVisible: true },
  { key: "esic", label: "ESIC", category: "deductions", defaultVisible: true },
  { key: "totalDeductions", label: "Total Deductions", category: "deductions", defaultVisible: true },
  { key: "bonus", label: "Bonus", category: "allowances", defaultVisible: false },
  { key: "advanceTaken", label: "Advance Taken", category: "deductions", defaultVisible: false },
  { key: "lwf", label: "LWF", category: "deductions", defaultVisible: false },
  { key: "designation", label: "Designation", category: "information", defaultVisible: false },
  { key: "department", label: "Department", category: "information", defaultVisible: false },
  { key: "createdAt", label: "Created", category: "information", defaultVisible: true },
]

const STORAGE_KEY = "payroll-reports-column-preferences"

// Load column preferences from localStorage
const loadColumnPreferences = (): Record<string, boolean> => {
  if (typeof window === "undefined") {
    return {}
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Error loading column preferences:", error)
  }
  // Return default preferences
  const defaults: Record<string, boolean> = {}
  COLUMN_FIELDS.forEach((field) => {
    defaults[field.key] = field.defaultVisible
  })
  return defaults
}

// Save column preferences to localStorage
const saveColumnPreferences = (preferences: Record<string, boolean>) => {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch (error) {
    console.error("Error saving column preferences:", error)
  }
}

export function PayrollReports() {
  const { toast } = useToast()
  const { companies, isLoading: loadingCompanies } = useCompany()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialize filters from URL query parameters
  const getInitialFilters = (): ReportFilters => {
    const companyId = searchParams.get("companyId") || undefined
    const startMonth = searchParams.get("startMonth") || undefined
    const endMonth = searchParams.get("endMonth") || undefined
    
    return {
      companyId,
      startMonth,
      endMonth,
      page: 1,
      limit: 20,
    }
  }

  // State management
  const [reportType, setReportType] = useState<ReportType>("company")
  const [filters, setFilters] = useState<ReportFilters>(getInitialFilters())
  const [initialized, setInitialized] = useState(false)
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false)
  const [employeeSuggestions, setEmployeeSuggestions] = useState<Employee[]>([])
  const [searchingEmployees, setSearchingEmployees] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [reportData, setReportData] = useState<PayrollReportResponseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfOpen, setPdfOpen] = useState(false)
  const [columnPreferences, setColumnPreferences] = useState<Record<string, boolean>>(loadColumnPreferences)
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false)
  const [tempPreferences, setTempPreferences] = useState<Record<string, boolean>>(columnPreferences)

  // Search employees with debounce
  const searchEmployees = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim() || searchTerm.length < 2) {
        setEmployeeSuggestions([])
        return
      }

      setSearchingEmployees(true)
      try {
        const response = await employeeService.getEmployees({
          searchText: searchTerm,
        })
        setEmployeeSuggestions(response.data?.data || [])
      } catch (error) {
        console.error("Error searching employees:", error)
        setEmployeeSuggestions([])
      } finally {
        setSearchingEmployees(false)
      }
    },
    [],
  )

  // Debounce employee search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (employeeSearch) {
        searchEmployees(employeeSearch)
      } else {
        setEmployeeSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [employeeSearch, searchEmployees])

  // Fetch report data
  const fetchReportData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await payrollService.getPayrollReport({
        companyId: filters.companyId,
        employeeId: filters.employeeId,
        startMonth: filters.startMonth,
        endMonth: filters.endMonth,
        page: filters.page,
        limit: filters.limit,
      })

      setReportData(response.data)
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch payroll report data"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Initialize from URL params on mount
  useEffect(() => {
    if (!initialized && companies.length > 0) {
      const companyId = searchParams.get("companyId")
      const startMonth = searchParams.get("startMonth")
      const endMonth = searchParams.get("endMonth")
      
      if (companyId) {
        setReportType("company")
        setFilters((prev) => ({
          ...prev,
          companyId: companyId || undefined,
          startMonth: startMonth || undefined,
          endMonth: endMonth || undefined,
        }))
      }
      
      setInitialized(true)
    }
  }, [companies, searchParams, initialized])

  // Effect to fetch data when filters change
  useEffect(() => {
    if (initialized) {
      if (reportType === "company" && filters.companyId) {
        fetchReportData()
      } else if (reportType === "employee" && filters.employeeId) {
        fetchReportData()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, filters, initialized])

  // Handle report type change
  const handleReportTypeChange = (type: ReportType) => {
    setReportType(type)
    setFilters({ page: 1, limit: 20 })
    setReportData(null)
    setError(null)
    setEmployeeSearch("")
    setSelectedEmployee(null)
  }

  // Handle filter changes
  const updateFilter = (key: keyof ReportFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value, // Reset to page 1 when other filters change
    }))
  }

  // Handle employee selection
  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee)
    setEmployeeSearch(employee.employeeId || employee.id)
    setEmployeeSearchOpen(false)
    updateFilter("employeeId", employee.employeeId || employee.id)
  }

  // Handle employee search input change
  const handleEmployeeSearchChange = (value: string) => {
    setEmployeeSearch(value)
    if (!value.trim()) {
      setSelectedEmployee(null)
      updateFilter("employeeId", undefined)
    }
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    updateFilter("page", page)
  }

  // Column customization handlers
  const handleOpenCustomize = () => {
    setTempPreferences({ ...columnPreferences })
    setCustomizeDialogOpen(true)
  }

  const handleSaveCustomize = () => {
    setColumnPreferences(tempPreferences)
    saveColumnPreferences(tempPreferences)
    setCustomizeDialogOpen(false)
    toast({
      title: "Preferences Saved",
      description: "Column preferences have been saved and will be remembered.",
    })
  }

  const handleResetCustomize = () => {
    const defaults: Record<string, boolean> = {}
    COLUMN_FIELDS.forEach((field) => {
      defaults[field.key] = field.defaultVisible
    })
    setTempPreferences(defaults)
  }

  const handleToggleField = (key: string) => {
    setTempPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Check if any record has a value for conditional columns
  const hasFieldValue = (fieldKey: string): boolean => {
    if (!reportData?.records.length) return false
    
    return reportData.records.some((record) => {
      const salaryData = record.salaryData as any
      const calculations = salaryData?.calculations || {}
      const deductions = salaryData?.deductions || {}
      const allowances = salaryData?.allowances || {}
      const information = salaryData?.information || {}
      
      switch (fieldKey) {
        case "pf":
          return (deductions?.pf ?? salaryData?.pf ?? 0) > 0
        case "esic":
          return (deductions?.esic ?? salaryData?.esic ?? 0) > 0
        case "bonus":
          return (allowances?.bonus ?? salaryData?.bonus ?? 0) > 0
        case "advanceTaken":
          return (deductions?.advanceTaken ?? salaryData?.advanceTaken ?? 0) > 0
        case "lwf":
          return (deductions?.lwf ?? salaryData?.lwf ?? 0) > 0
        case "designation":
          return !!(information?.designation ?? salaryData?.designation)
        case "department":
          return !!(information?.department ?? salaryData?.department)
        default:
          return true
      }
    })
  }

  // Export functions
  const handleExportExcel = () => {
    if (!reportData?.records.length) {
      toast({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive",
      })
      return
    }

    const filename =
      reportType === "company"
        ? `Company_Payroll_Report_${companies.find((c) => c.id === filters.companyId)?.name || "Report"}`
        : `Employee_${filters.employeeId}_Payroll_Report`

    const result = exportPayrollToExcel(reportData.records, filename)

    if (result.success) {
      toast({
        title: "Export Successful",
        description: `Report exported as ${result.fileName}`,
      })
    } else {
      toast({
        title: "Export Failed",
        description: result.error || "Failed to export report",
        variant: "destructive",
      })
    }
  }

  // Open PDF preview
  const handleOpenPDFPreview = () => {
    setPdfOpen(true)
  }

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (!reportData?.records.length) return null

    const records = reportData.records
    return {
      totalRecords: reportData.total,
      totalGrossSalary: records.reduce((sum, r) => {
        const calculations = r.salaryData?.calculations || {}
        return sum + (calculations?.grossSalary ?? r.salaryData?.grossSalary ?? 0)
      }, 0),
      totalNetSalary: records.reduce((sum, r) => {
        const calculations = r.salaryData?.calculations || {}
        return sum + (calculations?.netSalary ?? r.salaryData?.netSalary ?? 0)
      }, 0),
      totalDeductions: records.reduce((sum, r) => {
        const deductions = r.salaryData?.deductions || {}
        return sum + (deductions?.totalDeductions ?? r.salaryData?.totalDeductions ?? 0)
      }, 0),
      totalBasicPay: records.reduce((sum, r) => {
        const calculations = r.salaryData?.calculations || {}
        return sum + (calculations?.basicPay ?? r.salaryData?.basicPay ?? 0)
      }, 0),
      uniqueEmployees: new Set(records.map((r) => r.employeeId)).size,
      uniqueCompanies: new Set(records.map((r) => r.companyId)).size,
    }
  }

  const summaryStats = getSummaryStats()

  // Get report title for PDF
  const getReportTitle = () => {
    if (reportType === "company") {
      return companies.find((c) => c.id === filters.companyId)?.name || "Company"
    } else {
      return selectedEmployee
        ? `${selectedEmployee.firstName} ${selectedEmployee.lastName} (${selectedEmployee.employeeId || selectedEmployee.id})`
        : `Employee ${filters.employeeId}`
    }
  }

  // Get period text for PDF
  const getPeriodText = () => {
    if (filters.startMonth && filters.endMonth) {
      return `${format(new Date(filters.startMonth), "MMM yyyy")} - ${format(new Date(filters.endMonth), "MMM yyyy")}`
    } else if (filters.startMonth) {
      return format(new Date(filters.startMonth), "MMMM yyyy")
    }
    return undefined
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Payroll Reports</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Generate and download comprehensive payroll reports</p>
        </div>
      </div>

      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <TrendingUp className="h-5 w-5 shrink-0" />
            Generate Report
          </CardTitle>
          <CardDescription className="text-sm">Select report type and apply filters to generate payroll reports</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={reportType} onValueChange={(value) => handleReportTypeChange(value as ReportType)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Reports
              </TabsTrigger>
              <TabsTrigger value="employee" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Employee Reports
              </TabsTrigger>
            </TabsList>

            {/* Company Reports Tab */}
            <TabsContent value="company" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="md:col-span-1 lg:col-span-1">
                  <Label htmlFor="company-select">Company *</Label>
                  <Select
                    value={filters.companyId || ""}
                    onValueChange={(value) => updateFilter("companyId", value || undefined)}
                    disabled={loadingCompanies}
                  >
                    <SelectTrigger id="company-select" className="h-12">
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id ?? ""}>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
                            <span className="truncate">{company.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-1 lg:col-span-1">
                  <Label htmlFor="start-month">Start Month (Optional)</Label>
                  <MonthPicker
                    value={filters.startMonth ? new Date(filters.startMonth) : undefined}
                    onChange={(date) => {
                      if (date) {
                        updateFilter("startMonth", format(date, "yyyy-MM"))
                      } else {
                        updateFilter("startMonth", undefined)
                      }
                    }}
                    placeholder="Select start month"
                  />
                </div>

                <div className="md:col-span-1 lg:col-span-1">
                  <Label htmlFor="end-month">End Month (Optional)</Label>
                  <MonthPicker
                    value={filters.endMonth ? new Date(filters.endMonth) : undefined}
                    onChange={(date) => {
                      if (date) {
                        updateFilter("endMonth", format(date, "yyyy-MM"))
                      } else {
                        updateFilter("endMonth", undefined)
                      }
                    }}
                    placeholder="Select end month"
                  />
                </div>

                <div className="flex items-end md:col-span-2 lg:col-span-1">
                  <Button onClick={fetchReportData} disabled={!filters.companyId || loading} className="w-full h-12">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Loading...</span>
                        <span className="sm:hidden">Loading</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Generate Report</span>
                        <span className="sm:hidden">Generate</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Employee Reports Tab */}
            <TabsContent value="employee" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="employee-search">Employee *</Label>
                  <Popover open={employeeSearchOpen} onOpenChange={setEmployeeSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={employeeSearchOpen}
                        className="w-full justify-between h-12 text-left font-normal"
                      >
                        <span className="truncate flex-1 mr-2">
                          {selectedEmployee
                            ? `${selectedEmployee.firstName} ${selectedEmployee.lastName} (${selectedEmployee.employeeId || selectedEmployee.id})`
                            : employeeSearch || "Search employee..."}
                        </span>
                        <Search className="h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[90vw] sm:w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search employee by ID or name..."
                          value={employeeSearch}
                          onValueChange={handleEmployeeSearchChange}
                        />
                        <CommandList>
                          {searchingEmployees ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : employeeSuggestions.length === 0 && employeeSearch.length >= 2 ? (
                            <CommandEmpty>No employees found.</CommandEmpty>
                          ) : employeeSuggestions.length === 0 ? (
                            <CommandEmpty>Type at least 2 characters to search...</CommandEmpty>
                          ) : (
                            <CommandGroup>
                              {employeeSuggestions.map((employee) => (
                                <CommandItem
                                  key={employee.id}
                                  value={`${employee.employeeId || employee.id} ${employee.firstName} ${employee.lastName}`}
                                  onSelect={() => handleEmployeeSelect(employee)}
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    <User className="h-4 w-4 shrink-0 opacity-70" />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate">
                                        {employee.firstName} {employee.lastName}
                                      </div>
                                      <div className="text-xs opacity-80 truncate">
                                        {employee.employeeId || employee.id}
                                      </div>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedEmployee && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-6 text-xs"
                      onClick={() => {
                        setSelectedEmployee(null)
                        setEmployeeSearch("")
                        updateFilter("employeeId", undefined)
                      }}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                <div>
                  <Label htmlFor="employee-company">Company (Optional)</Label>
                  <Select
                    value={filters.companyId || "all"}
                    onValueChange={(value) => updateFilter("companyId", value === "all" ? undefined : value)}
                    disabled={loadingCompanies}
                  >
                    <SelectTrigger id="employee-company" className="h-12">
                      <SelectValue placeholder="All companies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All companies</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id ?? ""}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="employee-start-month">Start Month (Optional)</Label>
                  <MonthPicker
                    value={filters.startMonth ? new Date(filters.startMonth) : undefined}
                    onChange={(date) => {
                      if (date) {
                        updateFilter("startMonth", format(date, "yyyy-MM"))
                      } else {
                        updateFilter("startMonth", undefined)
                      }
                    }}
                    placeholder="Select start month"
                  />
                </div>

                <div>
                  <Label htmlFor="employee-end-month">End Month (Optional)</Label>
                  <MonthPicker
                    value={filters.endMonth ? new Date(filters.endMonth) : undefined}
                    onChange={(date) => {
                      if (date) {
                        updateFilter("endMonth", format(date, "yyyy-MM"))
                      } else {
                        updateFilter("endMonth", undefined)
                      }
                    }}
                    placeholder="Select end month"
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={fetchReportData} disabled={!filters.employeeId || loading} className="w-full h-12">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Loading...</span>
                        <span className="sm:hidden">Loading</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Generate Report</span>
                        <span className="sm:hidden">Generate</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {summaryStats && (
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl w-full">
            <Card>
              <CardContent className="pt-6">
                <div className="text-xl sm:text-2xl font-bold">{summaryStats.totalRecords}</div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Records</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-xl sm:text-2xl font-bold truncate">{formatCurrency(summaryStats.totalGrossSalary)}</div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Gross Salary</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-xl sm:text-2xl font-bold truncate">{formatCurrency(summaryStats.totalNetSalary)}</div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Net Salary</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-xl sm:text-2xl font-bold truncate">{formatCurrency(summaryStats.totalDeductions)}</div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Deductions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-xl sm:text-2xl font-bold">
                  {reportType === "company" ? summaryStats.uniqueEmployees : summaryStats.uniqueCompanies}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {reportType === "company" ? "Unique Employees" : "Unique Companies"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Export Actions */}
      {reportData?.records.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Export Report</CardTitle>
            <CardDescription className="text-sm">Download the payroll report in your preferred format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" size="lg" onClick={handleExportExcel} className="flex-1 sm:flex-initial">
                <FileSpreadsheet className="mr-2 h-5 w-5 shrink-0" />
                <span className="hidden sm:inline">Export Excel</span>
                <span className="sm:hidden">Excel</span>
              </Button>
              <Button variant="outline" size="lg" onClick={handleOpenPDFPreview} className="flex-1 sm:flex-initial">
                <FileText className="mr-2 h-5 w-5 shrink-0" />
                <span className="hidden sm:inline">View & Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg sm:text-xl">Report Data</CardTitle>
              <CardDescription className="text-sm">
                {reportData
                  ? `Showing ${reportData.records.length} of ${reportData.total} record${reportData.total !== 1 ? "s" : ""}`
                  : "No data available"}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleOpenCustomize} className="w-full sm:w-auto">
              <Settings className="h-4 w-4 mr-2" />
              Customize Columns
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : reportData?.records.length ? (
            <>
              <div className="rounded-md border overflow-x-auto scrollbar-sleek -mx-4 sm:mx-0 px-4 sm:px-0">
                <div className="min-w-full inline-block align-middle">
                  <Table className="min-w-[1200px]">
                    <TableHeader>
                      <TableRow>
                        {COLUMN_FIELDS.map((field) => {
                          // Show column if:
                          // 1. User preference is true, OR
                          // 2. It's essential and not explicitly hidden, OR
                          // 3. It's bonus/LWF/advanceTaken and has value (auto-show when data exists)
                          const hasValue = hasFieldValue(field.key)
                          const isAutoShowField = ["bonus", "lwf", "advanceTaken"].includes(field.key)
                          const shouldShow = columnPreferences[field.key] || 
                            (field.category === "essential" && columnPreferences[field.key] !== false) ||
                            (isAutoShowField && hasValue) ||
                            (field.category !== "essential" && hasValue && columnPreferences[field.key])
                          
                          if (!shouldShow) return null
                          
                          const isRightAligned = ["basicPay", "grossSalary", "netSalary", "pf", "esic", "totalDeductions", "bonus", "advanceTaken", "lwf"].includes(field.key)
                          
                          // Get min-width class based on field key
                          const getMinWidthClass = (key: string) => {
                            const widthMap: Record<string, string> = {
                              employeeId: "min-w-[120px]",
                              company: "min-w-[120px]",
                              month: "min-w-[100px]",
                              category: "min-w-[100px]",
                              rate: "min-w-[100px]",
                              basicPay: "min-w-[110px]",
                              grossSalary: "min-w-[120px]",
                              pf: "min-w-[90px]",
                              esic: "min-w-[90px]",
                              netSalary: "min-w-[120px]",
                              totalDeductions: "min-w-[110px]",
                              bonus: "min-w-[100px]",
                              advanceTaken: "min-w-[110px]",
                              lwf: "min-w-[90px]",
                              designation: "min-w-[120px]",
                              department: "min-w-[120px]",
                              createdAt: "min-w-[100px]",
                            }
                            return widthMap[key] || "min-w-[100px]"
                          }
                          
                          return (
                            <TableHead 
                              key={field.key}
                              className={`${getMinWidthClass(field.key)} ${isRightAligned ? "text-right" : ""}`}
                            >
                              {field.label}
                            </TableHead>
                          )
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.records.map((record) => {
                        const salaryData = record.salaryData as any
                        // Access grouped salary data with fallbacks
                        const calculations = salaryData?.calculations || {}
                        const deductions = salaryData?.deductions || {}
                        const allowances = salaryData?.allowances || {}
                        const information = salaryData?.information || {}
                        
                        const salaryCategory = salaryData?.salaryCategory || salaryData?.category
                        const isSpecialized = salaryCategory === SalaryCategory.SPECIALIZED
                        const pfAmount = deductions?.pf ?? salaryData?.pf ?? 0
                        const esicAmount = deductions?.esic ?? salaryData?.esic ?? 0
                        const grossSalary = calculations?.grossSalary ?? salaryData?.grossSalary ?? 0
                        const showPF = pfAmount > 0
                        const showESIC = esicAmount > 0
                        const pfDisabled = pfAmount === 0 && grossSalary > 15000
                        const esicDisabled = esicAmount === 0 && grossSalary > 15000
                        
                        // Helper function to render cell content based on field key
                        const renderCell = (fieldKey: string) => {
                          const isRightAligned = ["basicPay", "grossSalary", "netSalary", "pf", "esic", "totalDeductions", "bonus", "advanceTaken", "lwf"].includes(fieldKey)
                          const cellClassName = `${isRightAligned ? "text-right whitespace-nowrap" : ""} ${fieldKey === "employeeId" ? "font-medium" : ""} ${fieldKey === "createdAt" ? "text-muted-foreground whitespace-nowrap" : ""}`
                          
                          switch (fieldKey) {
                            case "employeeId":
                              return (
                                <TableCell key={fieldKey} className={cellClassName}>
                                  <Badge variant="outline" className="truncate max-w-[120px] inline-block">
                                    {record.employeeId}
                                  </Badge>
                                </TableCell>
                              )
                            case "company":
                              return (
                                <TableCell key={fieldKey} className={cellClassName}>
                                  <span className="truncate max-w-[120px] inline-block">
                                    {record.companyName || information?.companyName || "N/A"}
                                  </span>
                                </TableCell>
                              )
                            case "month":
                              return (
                                <TableCell key={fieldKey} className={cellClassName}>
                                  <Badge variant="outline">{record.month}</Badge>
                                </TableCell>
                              )
                            case "category":
                              return (
                                <TableCell key={fieldKey} className={cellClassName}>
                                  {salaryCategory ? (
                                    <div className="flex flex-col gap-1">
                                      <Badge variant="outline" className="text-xs w-fit">
                                        {salaryCategory}
                                      </Badge>
                                      {salaryData?.salarySubCategory && (
                                        <span className="text-xs text-muted-foreground truncate">
                                          {salaryData.salarySubCategory}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">N/A</span>
                                  )}
                                </TableCell>
                              )
                            case "rate":
                              return (
                                <TableCell key={fieldKey} className={cellClassName}>
                                  {isSpecialized && salaryData?.monthlySalary ? (
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">{formatCurrency(salaryData.monthlySalary)}</span>
                                      <span className="text-xs text-muted-foreground">/month</span>
                                    </div>
                                  ) : salaryData?.salaryPerDay ? (
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">{formatCurrency(salaryData.salaryPerDay)}</span>
                                      <span className="text-xs text-muted-foreground">/day</span>
                                    </div>
                                  ) : calculations?.wagesPerDay ?? calculations?.rate ? (
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">{formatCurrency(calculations?.wagesPerDay ?? calculations?.rate ?? 0)}</span>
                                      <span className="text-xs text-muted-foreground">/day</span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">N/A</span>
                                  )}
                                </TableCell>
                              )
                            case "basicPay":
                              return (
                                <TableCell key={fieldKey} className={cellClassName}>
                                  {formatCurrency(calculations?.basicPay ?? salaryData?.basicPay ?? 0)}
                                </TableCell>
                              )
                            case "grossSalary":
                              return (
                                <TableCell key={fieldKey} className={cellClassName}>
                                  {formatCurrency(grossSalary)}
                                </TableCell>
                              )
                            case "pf":
                              return (
                                <TableCell key={fieldKey} className={cellClassName}>
                                  {showPF ? (
                                    formatCurrency(pfAmount)
                                  ) : pfDisabled ? (
                                    <div className="flex items-center justify-end gap-1" title="PF disabled: Gross salary > ₹15,000">
                                      <span className="text-xs text-muted-foreground">-</span>
                                      <Info className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                              )
                            case "esic":
                              return (
                                <TableCell key={fieldKey} className={cellClassName}>
                                  {showESIC ? (
                                    formatCurrency(esicAmount)
                                  ) : esicDisabled ? (
                                    <div className="flex items-center justify-end gap-1" title="ESIC disabled: Gross salary > ₹15,000">
                                      <span className="text-xs text-muted-foreground">-</span>
                                      <Info className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                              )
                            case "netSalary":
                              return (
                                <TableCell key={fieldKey} className={`${cellClassName} font-medium`}>
                                  {formatCurrency(calculations?.netSalary ?? salaryData?.netSalary ?? 0)}
                                </TableCell>
                              )
                            case "totalDeductions":
                              return (
                                <TableCell key={fieldKey} className={cellClassName}>
                                  {formatCurrency(deductions?.totalDeductions ?? salaryData?.totalDeductions ?? 0)}
                                </TableCell>
                              )
                            case "bonus":
                              const bonusAmount = allowances?.bonus ?? salaryData?.bonus ?? 0
                              return (
                                <TableCell key={fieldKey} className={cellClassName}>
                                  {bonusAmount > 0 ? formatCurrency(bonusAmount) : "-"}
                                </TableCell>
                              )
                            case "advanceTaken":
                              const advanceAmount = deductions?.advanceTaken ?? salaryData?.advanceTaken ?? 0
                              return (
                                <TableCell key={fieldKey} className={cellClassName}>
                                  {advanceAmount > 0 ? formatCurrency(advanceAmount) : "-"}
                                </TableCell>
                              )
                            case "lwf":
                              const lwfAmount = deductions?.lwf ?? salaryData?.lwf ?? 0
                              return (
                                <TableCell key={fieldKey} className={cellClassName}>
                                  {lwfAmount > 0 ? formatCurrency(lwfAmount) : "-"}
                                </TableCell>
                              )
                            case "designation":
                              return (
                                <TableCell key={fieldKey} className={cellClassName}>
                                  {information?.designation ?? salaryData?.designation ?? "N/A"}
                                </TableCell>
                              )
                            case "department":
                              return (
                                <TableCell key={fieldKey} className={cellClassName}>
                                  {information?.department ?? salaryData?.department ?? "N/A"}
                                </TableCell>
                              )
                            case "createdAt":
                              return (
                                <TableCell key={fieldKey} className={cellClassName}>
                                  {formatDate(record.createdAt)}
                                </TableCell>
                              )
                            default:
                              return null
                          }
                        }
                        
                        return (
                          <TableRow key={record.id}>
                            {COLUMN_FIELDS.map((field) => {
                              // Show column if:
                              // 1. User preference is true, OR
                              // 2. It's essential and not explicitly hidden, OR
                              // 3. It's bonus/LWF/advanceTaken and has value (auto-show when data exists)
                              const hasValue = hasFieldValue(field.key)
                              const isAutoShowField = ["bonus", "lwf", "advanceTaken"].includes(field.key)
                              const shouldShow = columnPreferences[field.key] || 
                                (field.category === "essential" && columnPreferences[field.key] !== false) ||
                                (isAutoShowField && hasValue) ||
                                (field.category !== "essential" && hasValue && columnPreferences[field.key])
                              
                              if (!shouldShow) return null
                              
                              return renderCell(field.key)
                            })}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              {reportData.total > reportData.limit && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    currentPage={reportData.page}
                    totalPages={Math.ceil(reportData.total / reportData.limit)}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {reportType === "company" && !filters.companyId && "Select a company to generate reports"}
                {reportType === "employee" && !filters.employeeId && "Select an employee to generate reports"}
                {((reportType === "company" && filters.companyId) || (reportType === "employee" && filters.employeeId)) &&
                  !loading &&
                  "No payroll data found"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {reportType === "company"
                  ? "Choose a company and click 'Generate Report' to view payroll data."
                  : "Search for an employee and click 'Generate Report' to view payroll data."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF Preview Dialog */}
      {reportData && reportData.records.length > 0 && (
        <DynamicPdfPreviewDialog
          open={pdfOpen}
          onOpenChange={setPdfOpen}
          title={`${getReportTitle()} - Payroll Report`}
          description={getPeriodText() || "All Periods"}
          fileName={`payroll-report-${getReportTitle().replace(/\s+/g, "_")}-${getCurrentDateTime()}`}
          renderDocument={async () => {
            const { default: PayrollReportPDF } = await import("./pdf/payroll-report-pdf")
            // Get employee name for single employee reports
            const employeeName = reportData.records.length === 1 && selectedEmployee
              ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
              : undefined
            return (
              <PayrollReportPDF
                data={reportData.records}
                title={getReportTitle()}
                totalRecords={reportData.total}
                startMonth={filters.startMonth ? format(new Date(filters.startMonth), "MMM yyyy") : undefined}
                endMonth={filters.endMonth ? format(new Date(filters.endMonth), "MMM yyyy") : undefined}
                employeeName={employeeName}
              />
            )
          }}
        />
      )}

      {/* Column Customization Dialog */}
      <Dialog open={customizeDialogOpen} onOpenChange={setCustomizeDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
            <DialogTitle>Customize Columns</DialogTitle>
            <DialogDescription>
              Select which columns to display in the payroll report table. Your preferences will be saved.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 min-h-0" style={{ maxHeight: 'calc(85vh - 180px)' }}>
            <div className="space-y-6 py-2 pr-4">
              {/* Essential Fields */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Essential Fields</h3>
                <div className="space-y-2">
                  {COLUMN_FIELDS.filter((f) => f.category === "essential").map((field) => (
                    <div key={field.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.key}
                        checked={tempPreferences[field.key] ?? field.defaultVisible}
                        onCheckedChange={() => handleToggleField(field.key)}
                      />
                      <Label
                        htmlFor={field.key}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {field.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Deductions</h3>
                <div className="space-y-2">
                  {COLUMN_FIELDS.filter((f) => f.category === "deductions").map((field) => {
                    const hasValue = hasFieldValue(field.key)
                    return (
                      <div key={field.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={field.key}
                          checked={tempPreferences[field.key] ?? field.defaultVisible}
                          onCheckedChange={() => handleToggleField(field.key)}
                          disabled={!hasValue && !tempPreferences[field.key]}
                        />
                        <Label
                          htmlFor={field.key}
                          className={`text-sm font-normal flex-1 ${!hasValue && !tempPreferences[field.key] ? "text-muted-foreground cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          {field.label}
                          {!hasValue && (
                            <span className="ml-2 text-xs text-muted-foreground">(No data)</span>
                          )}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Allowances */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Allowances</h3>
                <div className="space-y-2">
                  {COLUMN_FIELDS.filter((f) => f.category === "allowances").map((field) => {
                    const hasValue = hasFieldValue(field.key)
                    return (
                      <div key={field.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={field.key}
                          checked={tempPreferences[field.key] ?? field.defaultVisible}
                          onCheckedChange={() => handleToggleField(field.key)}
                          disabled={!hasValue && !tempPreferences[field.key]}
                        />
                        <Label
                          htmlFor={field.key}
                          className={`text-sm font-normal flex-1 ${!hasValue && !tempPreferences[field.key] ? "text-muted-foreground cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          {field.label}
                          {!hasValue && (
                            <span className="ml-2 text-xs text-muted-foreground">(No data)</span>
                          )}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Information</h3>
                <div className="space-y-2">
                  {COLUMN_FIELDS.filter((f) => f.category === "information").map((field) => {
                    const hasValue = hasFieldValue(field.key)
                    return (
                      <div key={field.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={field.key}
                          checked={tempPreferences[field.key] ?? field.defaultVisible}
                          onCheckedChange={() => handleToggleField(field.key)}
                          disabled={!hasValue && !tempPreferences[field.key]}
                        />
                        <Label
                          htmlFor={field.key}
                          className={`text-sm font-normal flex-1 ${!hasValue && !tempPreferences[field.key] ? "text-muted-foreground cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          {field.label}
                          {!hasValue && (
                            <span className="ml-2 text-xs text-muted-foreground">(No data)</span>
                          )}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0 pt-4 border-t px-6 pb-6 mt-4">
            <Button variant="outline" onClick={handleResetCustomize}>
              Reset to Defaults
            </Button>
            <Button variant="outline" onClick={() => setCustomizeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCustomize}>
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

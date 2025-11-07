"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { AlertCircle, FileSpreadsheet, Search, Building2, User, TrendingUp, RefreshCw, FileText, Download, Eye, Loader2, X, DollarSign, Info } from "lucide-react"
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

export function PayrollReports() {
  const { toast } = useToast()
  const { companies, isLoading: loadingCompanies } = useCompany()

  // State management
  const [reportType, setReportType] = useState<ReportType>("company")
  const [filters, setFilters] = useState<ReportFilters>({
    page: 1,
    limit: 20,
  })
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false)
  const [employeeSuggestions, setEmployeeSuggestions] = useState<Employee[]>([])
  const [searchingEmployees, setSearchingEmployees] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [reportData, setReportData] = useState<PayrollReportResponseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfOpen, setPdfOpen] = useState(false)

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

  // Effect to fetch data when filters change
  useEffect(() => {
    if (reportType === "company" && filters.companyId) {
      fetchReportData()
    } else if (reportType === "employee" && filters.employeeId) {
      fetchReportData()
    }
  }, [reportType, filters])

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
      totalGrossSalary: records.reduce((sum, r) => sum + (r.salaryData.grossSalary || 0), 0),
      totalNetSalary: records.reduce((sum, r) => sum + (r.salaryData.netSalary || 0), 0),
      totalDeductions: records.reduce((sum, r) => sum + (r.salaryData.totalDeductions || 0), 0),
      totalBasicPay: records.reduce((sum, r) => sum + (r.salaryData.basicPay || 0), 0),
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
                        <TableHead className="min-w-[120px]">Employee ID</TableHead>
                        <TableHead className="min-w-[120px]">Company</TableHead>
                        <TableHead className="min-w-[100px]">Month</TableHead>
                        <TableHead className="min-w-[100px]">Category</TableHead>
                        <TableHead className="min-w-[100px]">Rate</TableHead>
                        <TableHead className="text-right min-w-[110px]">Basic Pay</TableHead>
                        <TableHead className="text-right min-w-[120px]">Gross Salary</TableHead>
                        <TableHead className="text-right min-w-[90px]">PF</TableHead>
                        <TableHead className="text-right min-w-[90px]">ESIC</TableHead>
                        <TableHead className="text-right min-w-[120px]">Net Salary</TableHead>
                        <TableHead className="text-right min-w-[110px]">Deductions</TableHead>
                        <TableHead className="min-w-[100px]">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.records.map((record) => {
                        const salaryData = record.salaryData as any
                        const salaryCategory = salaryData?.salaryCategory || salaryData?.category
                        const isSpecialized = salaryCategory === SalaryCategory.SPECIALIZED
                        const showPF = salaryData?.pf !== undefined && salaryData?.pf > 0
                        const showESIC = salaryData?.esic !== undefined && salaryData?.esic > 0
                        const pfDisabled = salaryData?.pf === 0 && salaryData?.grossSalary > 15000
                        const esicDisabled = salaryData?.esic === 0 && salaryData?.grossSalary > 15000
                        
                        return (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">
                              <Badge variant="outline" className="truncate max-w-[120px] inline-block">
                                {record.employeeId}
                              </Badge>
                            </TableCell>
                            <TableCell className="truncate max-w-[120px]">{record.companyName || "N/A"}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{record.month}</Badge>
                            </TableCell>
                            <TableCell>
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
                            <TableCell>
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
                              ) : salaryData?.wagesPerDay ? (
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{formatCurrency(salaryData.wagesPerDay)}</span>
                                  <span className="text-xs text-muted-foreground">/day</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatCurrency(salaryData?.basicPay || 0)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatCurrency(salaryData?.grossSalary || 0)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {showPF ? (
                                formatCurrency(salaryData.pf)
                              ) : pfDisabled ? (
                                <div className="flex items-center justify-end gap-1" title="PF disabled: Gross salary > ₹15,000">
                                  <span className="text-xs text-muted-foreground">-</span>
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {showESIC ? (
                                formatCurrency(salaryData.esic)
                              ) : esicDisabled ? (
                                <div className="flex items-center justify-end gap-1" title="ESIC disabled: Gross salary > ₹15,000">
                                  <span className="text-xs text-muted-foreground">-</span>
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium whitespace-nowrap">
                              {formatCurrency(salaryData?.netSalary || 0)}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatCurrency(salaryData?.totalDeductions || 0)}</TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(record.createdAt)}</TableCell>
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
            return (
              <PayrollReportPDF
                data={reportData.records}
                title={getReportTitle()}
                totalRecords={reportData.total}
                startMonth={filters.startMonth ? format(new Date(filters.startMonth), "MMM yyyy") : undefined}
                endMonth={filters.endMonth ? format(new Date(filters.endMonth), "MMM yyyy") : undefined}
              />
            )
          }}
        />
      )}
    </div>
  )
}

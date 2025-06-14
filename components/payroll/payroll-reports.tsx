"use client"

import { useState, useEffect } from "react"
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
import { AlertCircle, FileDown, Search, Building2, User, TrendingUp, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { payrollService } from "@/services/payrollService"
import { useCompany } from "@/hooks/use-company"
import { MonthPicker } from "@/components/ui/month-picker"
import { exportPayrollToExcel, formatCurrency, formatDate, type PayrollReportRecord } from "@/utils/payroll-export"
import { PayrollReportPDFDownloadButton } from "./pdf/payroll-report-pdf"
import { PayrollReportResponseData, ReportFilters, ReportType } from "@/types/payroll"

export function PayrollReports() {
  const { toast } = useToast()
  const { companies, isLoading: loadingCompanies } = useCompany()

  // State management
  const [reportType, setReportType] = useState<ReportType>("company")
  const [filters, setFilters] = useState<ReportFilters>({
    page: 1,
    limit: 10,
  })
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [reportData, setReportData] = useState<PayrollReportResponseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    setFilters({ page: 1, limit: 10 })
    setReportData(null)
    setError(null)
  }

  // Handle filter changes
  const updateFilter = (key: keyof ReportFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value, // Reset to page 1 when other filters change
    }))
  }

  // Handle employee search
  const handleEmployeeSearch = () => {
    if (!employeeSearch.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter an employee ID to search",
        variant: "destructive",
      })
      return
    }
    updateFilter("employeeId", employeeSearch.trim())
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
      reportType === "company" ? `Company_Payroll_Report` : `Employee_${filters.employeeId}_Payroll_Report`

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

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (!reportData?.records.length) return null

    const records = reportData.records
    return {
      totalRecords: reportData.total,
      totalGrossSalary: records.reduce((sum, r) => sum + (r.salaryData.grossSalary || 0), 0),
      totalNetSalary: records.reduce((sum, r) => sum + (r.salaryData.netSalary || 0), 0),
      totalDeductions: records.reduce((sum, r) => sum + (r.salaryData.totalDeductions || 0), 0),
      uniqueEmployees: new Set(records.map((r) => r.employeeId)).size,
      uniqueCompanies: new Set(records.map((r) => r.companyId)).size,
    }
  }

  const summaryStats = getSummaryStats()

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Payroll Reports
          </CardTitle>
          <CardDescription>
            Generate comprehensive payroll reports with advanced filtering and export options
          </CardDescription>
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
            <TabsContent value="company" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="company-select">Company *</Label>
                  <Select
                    value={filters.companyId || "default"}
                    onValueChange={(value) => updateFilter("companyId", value)}
                    disabled={loadingCompanies}
                  >
                    <SelectTrigger id="company-select">
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id ?? ''}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="start-month">Start Month</Label>
                  <MonthPicker
                    value={filters.startMonth ? new Date(filters.startMonth) : undefined}
                    onChange={(date) => updateFilter("startMonth", date ? date.toISOString() : undefined)}
                    placeholder="Select start month"
                  />
                </div>

                <div>
                  <Label htmlFor="end-month">End Month</Label>
                  <MonthPicker
                    value={filters.endMonth ? new Date(filters.endMonth) : undefined}
                    onChange={(value) => updateFilter("endMonth", value ? value.toISOString() : undefined)}
                    placeholder="Select end month"
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={fetchReportData} disabled={!filters.companyId || loading} className="w-full">
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Generate Report
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Employee Reports Tab */}
            <TabsContent value="employee" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="employee-search">Employee ID *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="employee-search"
                      placeholder="Enter employee ID"
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEmployeeSearch()}
                    />
                    <Button variant="secondary" onClick={handleEmployeeSearch} disabled={!employeeSearch.trim()}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="employee-company">Company (Optional)</Label>
                  <Select
                    value={filters.companyId || "default"}
                    onValueChange={(value) => updateFilter("companyId", value || undefined)}
                    disabled={loadingCompanies}
                  >
                    <SelectTrigger id="employee-company">
                      <SelectValue placeholder="All companies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">All companies</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id ?? ''}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="employee-start-month">Start Month</Label>
                  <MonthPicker
                    value={filters.startMonth ? new Date(filters.startMonth) : undefined}
                    onChange={(value) => updateFilter("startMonth", value)}
                    placeholder="Select start month"
                  />
                </div>

                <div>
                  <Label htmlFor="employee-end-month">End Month</Label>
                  <MonthPicker
                    value={filters.startMonth ? new Date(filters.startMonth) : undefined}
                    onChange={(value) => updateFilter("endMonth", value)}
                    placeholder="Select end month"
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={fetchReportData} disabled={!filters.employeeId || loading} className="w-full">
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Generate Report
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{summaryStats.totalRecords}</div>
              <p className="text-sm text-muted-foreground">Total Records</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalGrossSalary)}</div>
              <p className="text-sm text-muted-foreground">Total Gross Salary</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalNetSalary)}</div>
              <p className="text-sm text-muted-foreground">Total Net Salary</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalDeductions)}</div>
              <p className="text-sm text-muted-foreground">Total Deductions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {reportType === "company" ? summaryStats.uniqueEmployees : summaryStats.uniqueCompanies}
              </div>
              <p className="text-sm text-muted-foreground">
                {reportType === "company" ? "Unique Employees" : "Unique Companies"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export Actions */}
      {reportData?.records.length ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleExportExcel}>
                <FileDown className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
              <PayrollReportPDFDownloadButton
                data={reportData.records}
                title={
                  reportType === "company"
                    ? companies.find((c) => c.id === filters.companyId)?.name || "Company"
                    : `Employee ${filters.employeeId}`
                }
                totalRecords={reportData.total}
              />
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
          <CardTitle className="flex items-center justify-between">
            <span>Report Data</span>
            {reportData && (
              <Badge variant="secondary">
                Showing {reportData.records.length} of {reportData.total} records
              </Badge>
            )}
          </CardTitle>
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Basic Pay</TableHead>
                      <TableHead className="text-right">Gross Salary</TableHead>
                      <TableHead className="text-right">Net Salary</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employeeId}</TableCell>
                        <TableCell>{record.companyName || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.month}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(record.salaryData.basicPay || 0)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(record.salaryData.grossSalary || 0)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(record.salaryData.netSalary || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(record.salaryData.totalDeductions || 0)}
                        </TableCell>
                        <TableCell>{formatDate(record.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {reportData.total > reportData.limit && (
                <div className="mt-4">
                  <Pagination
                    currentPage={reportData.page}
                    totalPages={Math.ceil(reportData.total / reportData.limit)}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              {reportType === "company" && !filters.companyId && "Select a company to generate reports"}
              {reportType === "employee" && !filters.employeeId && "Enter an employee ID to generate reports"}
              {((reportType === "company" && filters.companyId) || (reportType === "employee" && filters.employeeId)) &&
                !loading &&
                "No payroll data found for the selected criteria"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

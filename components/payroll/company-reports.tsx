"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ChevronDown, ChevronUp, FileDown, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { payrollService } from "@/services/payrollService"
import { companyService } from "@/services/companyService"
import { useCompany } from "@/hooks/use-company"
import { exportCompanyPayrollToExcel } from "@/utils/file-export"
import { CompanyPayrollPDFDownloadButton } from "./pdf/company-payroll-pdf"
import type { CompanyPayrollMonth } from "@/types/payroll"

export function CompanyReports() {
  const { toast } = useToast()
  const { companies, isLoading: loadingCompanies } = useCompany()

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [companyName, setCompanyName] = useState<string>("")
  const [companyDetails, setCompanyDetails] = useState<{
    address?: string
    contactPersonName?: string
    contactPersonNumber?: string
    companyOnboardingDate?: string
  } | null>(null)
  const [payrollData, setPayrollData] = useState<CompanyPayrollMonth[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)

  const fetchPayrollData = async () => {
    if (!selectedCompanyId) return

    setLoading(true)
    setError(null)

    try {
      const [payrollResponse, companyResponse] = await Promise.all([
        payrollService.getPastPayrolls(selectedCompanyId, page, 10),
        companyService.getCompanyById(selectedCompanyId),
      ])
      
      setPayrollData(payrollResponse.data.records || [])
      setTotalPages(payrollResponse.data.totalPages || 1)
      setCompanyName(payrollResponse.data.companyName || "")
      
      // Fetch company details for PDF
      if (companyResponse.data) {
        setCompanyDetails({
          address: companyResponse.data.address,
          contactPersonName: companyResponse.data.contactPersonName,
          contactPersonNumber: companyResponse.data.contactPersonNumber,
          companyOnboardingDate: companyResponse.data.companyOnboardingDate,
        })
      }
    } catch (err) {
      setError("Failed to fetch payroll data. Please try again.")
      toast({
        title: "Error",
        description: "Failed to fetch payroll data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedCompanyId) {
      fetchPayrollData()
    }
  }, [selectedCompanyId, page])

  const handleCompanyChange = (value: string) => {
    setSelectedCompanyId(value)
    setPage(1)
  }

  const toggleExpandMonth = (month: string) => {
    if (expandedMonth === month) {
      setExpandedMonth(null)
    } else {
      setExpandedMonth(month)
    }
  }

  const handleExportExcel = () => {
    if (payrollData.length === 0) {
      toast({
        title: "No data to export",
        description: "Please select a company with payroll data first",
        variant: "destructive",
      })
      return
    }

    try {
      exportCompanyPayrollToExcel(payrollData, companyName)
      toast({
        title: "Export successful",
        description: "Payroll data has been exported to Excel",
      })
    } catch (err) {
      toast({
        title: "Export failed",
        description: "Failed to export payroll data to Excel",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Company Payroll Reports</CardTitle>
          <CardDescription className="text-sm">View and export payroll reports for companies</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Section */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="min-w-0">
                <label htmlFor="company-select" className="text-sm font-medium mb-2 block truncate">
                  Select Company
                </label>
                <Select value={selectedCompanyId} onValueChange={handleCompanyChange} disabled={loadingCompanies}>
                  <SelectTrigger id="company-select" className="h-12 w-full">
                    <SelectValue placeholder="Select a company" className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id ?? ""} value={company.id ?? ""} className="truncate">
                        <span className="truncate block">{company.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Export Actions */}
            {payrollData.length > 0 && (
              <div className="flex flex-wrap gap-3 sm:gap-4 pt-2 border-t">
                <Button variant="outline" size="lg" onClick={handleExportExcel} disabled={loading || payrollData.length === 0} className="flex-1 sm:flex-initial min-w-0">
                  <FileDown className="mr-2 h-5 w-5 shrink-0" />
                  <span className="hidden sm:inline truncate">Export Excel</span>
                  <span className="sm:hidden truncate">Excel</span>
                </Button>

                <CompanyPayrollPDFDownloadButton
                  data={payrollData}
                  companyName={companyName}
                  companyDetails={companyDetails || undefined}
                  disabled={loading || payrollData.length === 0}
                  className="flex-1 sm:flex-initial min-w-0"
                />
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Payroll Data</CardTitle>
          <CardDescription className="text-sm">
            {payrollData.length > 0
              ? `Showing ${payrollData.length} month${payrollData.length !== 1 ? "s" : ""} of payroll data`
              : selectedCompanyId
              ? "No payroll data found for this company"
              : "Select a company to view payroll data"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : payrollData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">
                {selectedCompanyId ? "No payroll data found for this company" : "Select a company to view payroll data"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto scrollbar-sleek">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Employee Count</TableHead>
                      <TableHead>Total Net Salary</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {payrollData.map((month) => (
                    <>
                      <TableRow
                        key={month.month}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleExpandMonth(month.month)}
                      >
                        <TableCell className="font-medium truncate max-w-[150px]">{month.month}</TableCell>
                        <TableCell className="whitespace-nowrap">{month.employeeCount}</TableCell>
                        <TableCell className="whitespace-nowrap">₹{month.totalNetSalary.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="shrink-0">
                            {expandedMonth === month.month ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {expandedMonth === month.month && (
                        <TableRow>
                          <TableCell colSpan={4} className="p-0">
                            <div className="bg-muted/30 p-4">
                              <h4 className="text-sm font-medium mb-2">Employee Details</h4>
                              <div className="overflow-x-auto scrollbar-sleek">
                                <Table className="min-w-[600px]">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Basic Pay</TableHead>
                                    <TableHead>Gross Salary</TableHead>
                                    <TableHead>Net Salary</TableHead>
                                    <TableHead>Deductions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {month.records.map((record) => (
                                    <TableRow key={record.employeeId}>
                                      <TableCell className="truncate max-w-[200px]">
                                        {record.employee
                                          ? `${record.employee.firstName} ${record.employee.lastName}`
                                          : record.employeeId}
                                      </TableCell>
                                      <TableCell className="whitespace-nowrap">₹{((record.salaryData?.calculations?.basicPay ?? record.salaryData?.basicPay) || 0).toLocaleString()}</TableCell>
                                      <TableCell className="whitespace-nowrap">₹{((record.salaryData?.calculations?.grossSalary ?? record.salaryData?.grossSalary) || 0).toLocaleString()}</TableCell>
                                      <TableCell className="whitespace-nowrap">₹{((record.salaryData?.calculations?.netSalary ?? record.salaryData?.netSalary) || 0).toLocaleString()}</TableCell>
                                      <TableCell className="whitespace-nowrap">
                                        ₹{((record.salaryData?.deductions?.totalDeductions ?? record.salaryData?.totalDeductions) || 0).toLocaleString()}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

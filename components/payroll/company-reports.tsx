"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ChevronDown, ChevronUp, FileDown } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { payrollService } from "@/services/payrollService"
import { useCompany } from "@/hooks/use-company"
import { exportCompanyPayrollToExcel } from "@/utils/file-export"
import { CompanyPayrollPDFDownloadButton } from "./pdf/company-payroll-pdf"
import type { CompanyPayrollMonth } from "@/types/payroll"

export function CompanyReports() {
  const { toast } = useToast()
  const { companies, isLoading: loadingCompanies } = useCompany()

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [companyName, setCompanyName] = useState<string>("")
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
      const response = await payrollService.getPastPayrolls(selectedCompanyId, page, 10)
      setPayrollData(response.data.records || [])
      setTotalPages(response.data.totalPages || 1)
      setCompanyName(response.data.companyName || "")
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
          <CardTitle>Company Payroll Reports</CardTitle>
          <CardDescription>View and export payroll reports for companies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-2 block">Select Company</label>
              <Select value={selectedCompanyId} onValueChange={handleCompanyChange} disabled={loadingCompanies}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id ?? ""} value={company.id ?? ""}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={handleExportExcel} disabled={loading || payrollData.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Export Excel
              </Button>

              <CompanyPayrollPDFDownloadButton
                data={payrollData}
                companyName={companyName}
                disabled={loading || payrollData.length === 0}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : payrollData.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {selectedCompanyId ? "No payroll data found for this company" : "Select a company to view payroll data"}
            </div>
          ) : (
            <>
              <Table>
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
                        <TableCell className="font-medium">{month.month}</TableCell>
                        <TableCell>{month.employeeCount}</TableCell>
                        <TableCell>₹{month.totalNetSalary.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            {expandedMonth === month.month ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {expandedMonth === month.month && (
                        <TableRow>
                          <TableCell colSpan={4} className="p-0">
                            <div className="bg-muted/30 p-4">
                              <h4 className="text-sm font-medium mb-2">Employee Details</h4>
                              <Table>
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
                                      <TableCell>
                                        {record.employee
                                          ? `${record.employee.firstName} ${record.employee.lastName}`
                                          : record.employeeId}
                                      </TableCell>
                                      <TableCell>₹{(record.salaryData.basicPay || 0).toLocaleString()}</TableCell>
                                      <TableCell>₹{(record.salaryData.grossSalary || 0).toLocaleString()}</TableCell>
                                      <TableCell>₹{(record.salaryData.netSalary || 0).toLocaleString()}</TableCell>
                                      <TableCell>
                                        ₹{(record.salaryData.totalDeductions || 0).toLocaleString()}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4">
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

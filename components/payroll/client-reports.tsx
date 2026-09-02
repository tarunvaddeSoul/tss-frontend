"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ChevronDown, ChevronUp, FileDown, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { payrollService } from "@/services/payrollService"
import { clientService } from "@/services/clientService"
import { useClient } from "@/hooks/use-client"
import { exportClientPayrollToExcel } from "@/utils/file-export"
import { ClientPayrollPDFDownloadButton } from "./pdf/client-payroll-pdf"
import type { ClientPayrollMonth } from "@/types/payroll"

export function ClientReports() {
  const { toast } = useToast()
  const { clients, isLoading: loadingClients } = useClient()

  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [clientName, setClientName] = useState<string>("")
  const [clientDetails, setClientDetails] = useState<{
    address?: string
    contactPersonName?: string
    contactPersonNumber?: string
    clientOnboardingDate?: string
  } | null>(null)
  const [payrollData, setPayrollData] = useState<ClientPayrollMonth[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)

  const fetchPayrollData = async () => {
    if (!selectedClientId) return

    setLoading(true)
    setError(null)

    try {
      const [payrollResponse, clientResponse] = await Promise.all([
        payrollService.getPastPayrolls(selectedClientId, page, 10),
        clientService.getClientById(selectedClientId),
      ])
      
      setPayrollData(payrollResponse.data.records || [])
      setTotalPages(payrollResponse.data.totalPages || 1)
      setClientName(payrollResponse.data.clientName || "")
      
      // Fetch client details for PDF
      if (clientResponse.data) {
        setClientDetails({
          address: clientResponse.data.address,
          contactPersonName: clientResponse.data.contactPersonName,
          contactPersonNumber: clientResponse.data.contactPersonNumber,
          clientOnboardingDate: clientResponse.data.clientOnboardingDate,
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
    if (selectedClientId) {
      fetchPayrollData()
    }
  }, [selectedClientId, page])

  const handleClientChange = (value: string) => {
    setSelectedClientId(value)
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
        description: "Please select a client with payroll data first",
        variant: "destructive",
      })
      return
    }

    try {
      exportClientPayrollToExcel(payrollData, clientName)
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
          <CardTitle className="text-lg sm:text-xl">Client Payroll Reports</CardTitle>
          <CardDescription className="text-sm">View and export payroll reports for clients</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Section */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="min-w-0">
                <label htmlFor="client-select" className="text-sm font-medium mb-2 block truncate">
                  Select Client
                </label>
                <Combobox
                  id="client-select"
                  options={clients.map((client) => ({ value: client.id ?? "", label: client.name }))}
                  value={selectedClientId}
                  onChange={handleClientChange}
                  placeholder="Select a client"
                  searchPlaceholder="Search clients..."
                  emptyText="No clients found."
                  disabled={loadingClients}
                  className="h-12 w-full"
                />
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

                <ClientPayrollPDFDownloadButton
                  data={payrollData}
                  clientName={clientName}
                  clientDetails={clientDetails || undefined}
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
              : selectedClientId
              ? "No payroll data found for this client"
              : "Select a client to view payroll data"}
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
            <div className="text-center py-12">
              <p className="registry-eyebrow mb-3">No records on file</p>
              <p className="text-sm text-muted-foreground">
                {selectedClientId ? "No payroll data found for this client" : "Select a client to view payroll data"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto scrollbar-sleek">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Employee Count</TableHead>
                      <TableHead className="text-right">Total Net Salary</TableHead>
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
                        <TableCell className="font-mono text-[13px] font-medium truncate max-w-[150px]">{month.month}</TableCell>
                        <TableCell className="text-right font-mono text-[13px] whitespace-nowrap">{month.employeeCount}</TableCell>
                        <TableCell className="text-right font-mono text-[13px] whitespace-nowrap">₹{month.totalNetSalary.toLocaleString()}</TableCell>
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
                                    <TableHead className="text-right">Basic Pay</TableHead>
                                    <TableHead className="text-right">Gross Salary</TableHead>
                                    <TableHead className="text-right">Net Salary</TableHead>
                                    <TableHead className="text-right">Deductions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {month.records.map((record) => (
                                    <TableRow key={record.employeeId}>
                                      <TableCell className="font-medium truncate max-w-[200px]">
                                        {record.employee
                                          ? `${record.employee.firstName} ${record.employee.lastName}`
                                          : record.employeeId}
                                      </TableCell>
                                      <TableCell className="text-right font-mono text-[13px] whitespace-nowrap">₹{((record.salaryData?.calculations?.basicPay ?? record.salaryData?.basicPay) || 0).toLocaleString()}</TableCell>
                                      <TableCell className="text-right font-mono text-[13px] whitespace-nowrap">₹{((record.salaryData?.calculations?.grossSalary ?? record.salaryData?.grossSalary) || 0).toLocaleString()}</TableCell>
                                      <TableCell className="text-right font-mono text-[13px] font-semibold whitespace-nowrap">₹{((record.salaryData?.calculations?.netSalary ?? record.salaryData?.netSalary) || 0).toLocaleString()}</TableCell>
                                      <TableCell className="text-right font-mono text-[13px] whitespace-nowrap">
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

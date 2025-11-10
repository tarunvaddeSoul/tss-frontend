"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FileDown, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { payrollService } from "@/services/payrollService"
import { useCompany } from "@/hooks/use-company"
import { Input } from "@/components/ui/input"
import { MonthPicker } from "@/components/ui/month-picker"
import { exportEmployeePayrollToExcel } from "@/utils/file-export"
import { EmployeePayrollPDFDownloadButton } from "./pdf/employee-payroll-pdf"
import { employeeService } from "@/services/employeeService"
import type { EmployeePayrollRecord } from "@/types/payroll"
import type { Employee } from "@/types/employee"

export function EmployeeReports() {
    const { toast } = useToast()
    const { companies, loading: loadingCompanies } = useCompany()

    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all")
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
    const [employeeSearch, setEmployeeSearch] = useState<string>("")
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loadingEmployees, setLoadingEmployees] = useState(false)
    const [startMonth, setStartMonth] = useState<Date | undefined>(undefined)
    const [endMonth, setEndMonth] = useState<Date | undefined>(undefined)

    const [payrollData, setPayrollData] = useState<EmployeePayrollRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch employees when company changes
    useEffect(() => {
        const fetchEmployees = async () => {
            if (selectedCompanyId === "all") {
                setEmployees([])
                return
            }

            setLoadingEmployees(true)
            try {
                const response = await employeeService.getEmployeesByCompany(selectedCompanyId)
                setEmployees(response.data || [])
            } catch (err) {
                toast({
                    title: "Error",
                    description: "Failed to fetch employees",
                    variant: "destructive",
                })
            } finally {
                setLoadingEmployees(false)
            }
        }

        fetchEmployees()
    }, [selectedCompanyId, toast])

    const fetchPayrollData = async () => {
        if (!selectedEmployeeId) return

        setLoading(true)
        setError(null)

        try {
            const response = await payrollService.getEmployeePayrollReport(
                selectedEmployeeId,
                selectedCompanyId === "all" ? undefined : selectedCompanyId,
                startMonth,
                endMonth,
            )
            setPayrollData(response || [])
        } catch (err) {
            setError("Failed to fetch payroll data. Please try again.")
            toast({
                title: "Error",
                description: "Failed to fetch employee payroll data",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (selectedEmployeeId) {
            fetchPayrollData()
        }
    }, [selectedEmployeeId, selectedCompanyId, startMonth, endMonth])

    const handleSearch = async () => {
        if (!employeeSearch) return

        setLoadingEmployees(true)
        try {
            const response = await employeeService.getEmployees(employeeSearch)
            if (response.data && response.data.length > 0) {
                setSelectedEmployeeId(response.data[0].id)
            } else {
                toast({
                    title: "No employees found",
                    description: "No employees match your search criteria",
                    variant: "destructive",
                })
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to search employees",
                variant: "destructive",
            })
        } finally {
            setLoadingEmployees(false)
        }
    }

    const handleExportExcel = () => {
        if (payrollData.length === 0) {
            toast({
                title: "No data to export",
                description: "Please select an employee with payroll data first",
                variant: "destructive",
            })
            return
        }

        try {
            exportEmployeePayrollToExcel(payrollData, selectedEmployeeId)
            toast({
                title: "Export successful",
                description: "Employee payroll data has been exported to Excel",
            })
        } catch (err) {
            toast({
                title: "Export failed",
                description: "Failed to export payroll data to Excel",
                variant: "destructive",
            })
        }
    }

    // Calculate summary values using grouped structure
    const totalGrossSalary = payrollData.reduce((sum, record) => {
      const calculations = record.salaryData?.calculations || {}
      return sum + (calculations?.grossSalary ?? record.salaryData?.grossSalary ?? 0)
    }, 0)
    const totalDeductions = payrollData.reduce((sum, record) => {
      const deductions = record.salaryData?.deductions || {}
      return sum + (deductions?.totalDeductions ?? record.salaryData?.totalDeductions ?? 0)
    }, 0)
    const totalNetSalary = payrollData.reduce((sum, record) => {
      const calculations = record.salaryData?.calculations || {}
      return sum + (calculations?.netSalary ?? record.salaryData?.netSalary ?? 0)
    }, 0)

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Employee Payroll Reports</CardTitle>
                    <CardDescription className="text-sm">View and export payroll reports for individual employees</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filter Section */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="min-w-0">
                                <label htmlFor="employee-company" className="text-sm font-medium mb-2 block truncate">
                                    Company (Optional)
                                </label>
                                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId} disabled={loadingCompanies}>
                                    <SelectTrigger id="employee-company" className="h-12 w-full">
                                        <SelectValue placeholder="All Companies" className="truncate" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="truncate">
                                            <span className="truncate block">All Companies</span>
                                        </SelectItem>
                                        {companies.map((company) => (
                                            <SelectItem key={company.id} value={company.id ?? ""} className="truncate">
                                                <span className="truncate block">{company.name}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="min-w-0">
                                <label htmlFor="employee-select" className="text-sm font-medium mb-2 block truncate">
                                    Employee
                                </label>
                                {selectedCompanyId !== "all" ? (
                                    <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId} disabled={loadingEmployees}>
                                        <SelectTrigger id="employee-select" className="h-12 w-full">
                                            <SelectValue placeholder="Select an employee" className="truncate" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((employee) => (
                                                <SelectItem key={employee.id} value={employee.id} className="truncate">
                                                    <span className="truncate block">
                                                        {employee.firstName} {employee.lastName} ({employee.id})
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="flex gap-2 min-w-0">
                                        <Input
                                            id="employee-search"
                                            placeholder="Search by ID or name"
                                            value={employeeSearch}
                                            onChange={(e) => setEmployeeSearch(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && employeeSearch) {
                                                    handleSearch()
                                                }
                                            }}
                                            className="h-12 flex-1 min-w-0"
                                        />
                                        <Button variant="secondary" onClick={handleSearch} disabled={!employeeSearch || loadingEmployees} className="h-12 px-3 sm:px-4 shrink-0">
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0">
                                <label htmlFor="start-month" className="text-sm font-medium mb-2 block truncate">
                                    Start Month (Optional)
                                </label>
                                <MonthPicker
                                    id="start-month"
                                    value={startMonth}
                                    onChange={setStartMonth}
                                    placeholder="Select start month"
                                />
                            </div>

                            <div className="min-w-0">
                                <label htmlFor="end-month" className="text-sm font-medium mb-2 block truncate">
                                    End Month (Optional)
                                </label>
                                <MonthPicker
                                    id="end-month"
                                    value={endMonth}
                                    onChange={setEndMonth}
                                    placeholder="Select end month"
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

                                <EmployeePayrollPDFDownloadButton
                                    data={payrollData}
                                    employeeId={selectedEmployeeId}
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

            {/* Summary Statistics */}
            {payrollData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xl sm:text-2xl font-bold truncate">₹{totalGrossSalary.toLocaleString()}</div>
                            <p className="text-xs sm:text-sm text-muted-foreground">Total Gross Salary</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xl sm:text-2xl font-bold truncate">₹{totalDeductions.toLocaleString()}</div>
                            <p className="text-xs sm:text-sm text-muted-foreground">Total Deductions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xl sm:text-2xl font-bold truncate">₹{totalNetSalary.toLocaleString()}</div>
                            <p className="text-xs sm:text-sm text-muted-foreground">Total Net Salary</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Payroll Data</CardTitle>
                    <CardDescription className="text-sm">
                        {payrollData.length > 0
                            ? `Showing ${payrollData.length} month${payrollData.length !== 1 ? "s" : ""} of payroll data`
                            : selectedEmployeeId
                            ? "No payroll data found for this employee"
                            : "Select an employee to view payroll data"}
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
                                {selectedEmployeeId
                                    ? "No payroll data found for this employee"
                                    : "Select an employee to view payroll data"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto scrollbar-sleek">
                              <Table className="min-w-[800px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Month</TableHead>
                                        <TableHead>Basic Pay</TableHead>
                                        <TableHead>Gross Salary</TableHead>
                                        <TableHead>Net Salary</TableHead>
                                        <TableHead>PF</TableHead>
                                        <TableHead>ESIC</TableHead>
                                        <TableHead>LWF</TableHead>
                                        <TableHead>Bonus</TableHead>
                                        <TableHead>Advance</TableHead>
                                        <TableHead>Total Deductions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payrollData.map((record) => {
                                      const salaryData = record.salaryData as any
                                      const calculations = salaryData?.calculations || {}
                                      const deductions = salaryData?.deductions || {}
                                      const allowances = salaryData?.allowances || {}
                                      
                                      const pf = deductions?.pf ?? salaryData?.pf ?? 0
                                      const esic = deductions?.esic ?? salaryData?.esic ?? 0
                                      const lwf = deductions?.lwf ?? salaryData?.lwf ?? 0
                                      const bonus = allowances?.bonus ?? salaryData?.bonus ?? 0
                                      const advanceTaken = deductions?.advanceTaken ?? salaryData?.advanceTaken ?? 0
                                      
                                      return (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">{record.month}</TableCell>
                                            <TableCell>₹{(calculations?.basicPay ?? salaryData?.basicPay ?? 0).toLocaleString()}</TableCell>
                                            <TableCell>₹{(calculations?.grossSalary ?? salaryData?.grossSalary ?? 0).toLocaleString()}</TableCell>
                                            <TableCell>₹{(calculations?.netSalary ?? salaryData?.netSalary ?? 0).toLocaleString()}</TableCell>
                                            <TableCell>{pf > 0 ? `₹${pf.toLocaleString()}` : "-"}</TableCell>
                                            <TableCell>{esic > 0 ? `₹${esic.toLocaleString()}` : "-"}</TableCell>
                                            <TableCell>{lwf > 0 ? `₹${lwf.toLocaleString()}` : "-"}</TableCell>
                                            <TableCell>{bonus > 0 ? `₹${bonus.toLocaleString()}` : "-"}</TableCell>
                                            <TableCell>{advanceTaken > 0 ? `₹${advanceTaken.toLocaleString()}` : "-"}</TableCell>
                                            <TableCell>₹{(deductions?.totalDeductions ?? salaryData?.totalDeductions ?? 0).toLocaleString()}</TableCell>
                                        </TableRow>
                                      )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

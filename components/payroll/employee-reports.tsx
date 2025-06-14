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

    // Calculate summary values
    const totalGrossSalary = payrollData.reduce((sum, record) => sum + (record.salaryData.grossSalary || 0), 0)
    const totalDeductions = payrollData.reduce((sum, record) => sum + (record.salaryData.totalDeductions || 0), 0)
    const totalNetSalary = payrollData.reduce((sum, record) => sum + (record.salaryData.netSalary || 0), 0)

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Employee Payroll Reports</CardTitle>
                    <CardDescription>View and export payroll reports for individual employees</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Company (Optional)</label>
                            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId} disabled={loadingCompanies}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Companies" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Companies</SelectItem>
                                    {companies.map((company) => (
                                        <SelectItem key={company.id} value={company.id ?? ""}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Employee</label>
                            {selectedCompanyId !== "all" ? (
                                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId} disabled={loadingEmployees}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((employee) => (
                                            <SelectItem key={employee.id} value={employee.id}>
                                                {employee.firstName} {employee.lastName} ({employee.id})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Search by ID or name"
                                        value={employeeSearch}
                                        onChange={(e) => setEmployeeSearch(e.target.value)}
                                    />
                                    <Button variant="secondary" onClick={handleSearch} disabled={!employeeSearch}>
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Start Month (Optional)</label>
                            <MonthPicker value={startMonth} onChange={setStartMonth} placeholder="Select start month" />

                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">End Month (Optional)</label>
                            <MonthPicker value={endMonth} onChange={setEndMonth} placeholder="Select end month" />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <Button variant="outline" onClick={handleExportExcel} disabled={loading || payrollData.length === 0}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Export Excel
                        </Button>

                        <EmployeePayrollPDFDownloadButton
                            data={payrollData}
                            employeeId={selectedEmployeeId}
                            disabled={loading || payrollData.length === 0}
                        />
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
                            {selectedEmployeeId
                                ? "No payroll data found for this employee"
                                : "Select an employee to view payroll data"}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold">₹{totalGrossSalary.toLocaleString()}</div>
                                        <p className="text-sm text-muted-foreground">Total Gross Salary</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold">₹{totalDeductions.toLocaleString()}</div>
                                        <p className="text-sm text-muted-foreground">Total Deductions</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold">₹{totalNetSalary.toLocaleString()}</div>
                                        <p className="text-sm text-muted-foreground">Total Net Salary</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Month</TableHead>
                                        <TableHead>Basic Pay</TableHead>
                                        <TableHead>Gross Salary</TableHead>
                                        <TableHead>Net Salary</TableHead>
                                        <TableHead>PF</TableHead>
                                        <TableHead>ESIC</TableHead>
                                        <TableHead>Bonus</TableHead>
                                        <TableHead>Advance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payrollData.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">{record.month}</TableCell>
                                            <TableCell>₹{(record.salaryData.basicPay || 0).toLocaleString()}</TableCell>
                                            <TableCell>₹{(record.salaryData.grossSalary || 0).toLocaleString()}</TableCell>
                                            <TableCell>₹{(record.salaryData.netSalary || 0).toLocaleString()}</TableCell>
                                            <TableCell>₹{(record.salaryData.pf || 0).toLocaleString()}</TableCell>
                                            <TableCell>₹{(record.salaryData.esic || 0).toLocaleString()}</TableCell>
                                            <TableCell>₹{(record.salaryData.bonus || 0).toLocaleString()}</TableCell>
                                            <TableCell>₹{(record.salaryData.advanceTaken || 0).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

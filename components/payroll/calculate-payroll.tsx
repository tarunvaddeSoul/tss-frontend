"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MonthPicker } from "@/components/ui/month-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCompany } from "@/hooks/use-company"
import { usePayroll, usePayrollAdminInputs } from "@/hooks/use-payroll"
import { Calendar, Users, Calculator, CheckCircle, AlertCircle, Building2, IndianRupee, Loader2, Info, Eye, FileText } from "lucide-react"
import { format } from "date-fns"
import type { PayrollStep, CalculatePayrollDto } from "@/types/payroll"
import { companyService } from "@/services/companyService"
import { CompanyEmployee } from "@/types/company"
import { SalaryCategory } from "@/types/salary"
import { payrollService } from "@/services/payrollService"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

const PAYROLL_STEPS: PayrollStep[] = [
    {
        id: 1,
        title: "Select Company & Month",
        description: "Choose company and payroll period",
        completed: false,
        current: true,
    },
    { id: 2, title: "Review Data", description: "Verify employee and attendance data", completed: false, current: false },
    { id: 3, title: "Admin Input", description: "Fill required custom fields", completed: false, current: false },
    { id: 4, title: "Calculate", description: "Calculate payroll amounts", completed: false, current: false },
    { id: 5, title: "Finalize", description: "Review and finalize payroll", completed: false, current: false },
]

// Mock employee data for testing
const MOCK_EMPLOYEES = [
    { id: "TSS1052", name: "John Doe" },
    { id: "TSS1053", name: "Jane Smith" },
    { id: "TSS1054", name: "Robert Johnson" },
]

export default function CalculatePayroll() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [steps, setSteps] = useState(PAYROLL_STEPS)
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
    const [errors, setErrors] = useState<string[]>([])
    const [employees, setEmployees] = useState<CompanyEmployee[]>([])
    const [isFinalized, setIsFinalized] = useState(false)
    const [existingPayroll, setExistingPayroll] = useState<{
        records: any[]
        totalEmployees: number
        totalNetSalary: number
        totalGrossSalary: number
        finalizedDate: string
    } | null>(null)
    const [checkingPayroll, setCheckingPayroll] = useState(false)
    const [showExistingPayrollDialog, setShowExistingPayrollDialog] = useState(false)
    const [showRecalculateDialog, setShowRecalculateDialog] = useState(false)

    const { companies, isLoading: companiesLoading } = useCompany()
    const {
        isCalculating,
        isFinalizing,
        calculationResult,
        selectedCompany,
        adminInputFields,
        fetchCompanyDetails,
        calculatePayroll,
        finalizePayroll,
        resetCalculation,
    } = usePayroll()

    const { adminInputs, updateAdminInput, validateAdminInputs, resetInputs } = usePayrollAdminInputs()

    // Debug logging
    useEffect(() => {
        console.log("Current step:", currentStep)
        console.log("Admin input fields:", adminInputFields)
        console.log(calculationResult)
    }, [currentStep, adminInputFields])

    const updateStepStatus = (stepId: number, completed: boolean, current: boolean) => {
        setSteps((prev) =>
            prev.map((step) => ({
                ...step,
                completed: step.id < stepId ? true : step.id === stepId ? completed : false,
                current: step.id === stepId ? current : false,
            })),
        )
    }

    // Check for finalized payroll when company/month changes
    // If getPayrollByMonth returns data, it means payroll is already finalized
    useEffect(() => {
        const checkFinalizedPayroll = async () => {
            if (!selectedCompanyId || !selectedMonth) {
                setExistingPayroll(null)
                return
            }

            setCheckingPayroll(true)
            try {
                const payrollMonth = format(selectedMonth, "yyyy-MM")
                const payrollData = await payrollService.getPayrollByMonth(selectedCompanyId, payrollMonth)
                
                // If payroll data exists, it means payroll is finalized
                if (payrollData && payrollData.records && payrollData.records.length > 0) {
                    setExistingPayroll({
                        records: payrollData.records,
                        totalEmployees: payrollData.summary.totalEmployees,
                        totalNetSalary: payrollData.summary.totalNetSalary,
                        totalGrossSalary: payrollData.summary.totalGrossSalary,
                        finalizedDate: payrollData.updatedAt || payrollData.createdAt,
                    })
                } else {
                    setExistingPayroll(null)
                }
            } catch (error) {
                // If error (404 or other), no finalized payroll exists
                setExistingPayroll(null)
            } finally {
                setCheckingPayroll(false)
            }
        }

        checkFinalizedPayroll()
    }, [selectedCompanyId, selectedMonth])

    const handleCompanyMonthSelect = async () => {
        if (!selectedCompanyId) {
            setErrors(["Please select a company"])
            return
        }

        setErrors([])

        // If payroll exists, show dialog instead of proceeding
        if (existingPayroll) {
            setShowExistingPayrollDialog(true)
            return
        }

        try {
            await fetchCompanyDetails(selectedCompanyId)
            // Fetch employees for the selected company
            const employeesResponse = await companyService.getCompanyEmployees(selectedCompanyId)
            console.log(employeesResponse.data)
            setEmployees(employeesResponse.data)
            setCurrentStep(2)
            updateStepStatus(2, false, true)
        } catch (error) {
            setErrors(["Failed to fetch company details. Please try again."])
        }
    }

    const handleRecalculateAnyway = () => {
        setShowRecalculateDialog(true)
    }

    const confirmRecalculate = async () => {
        setShowRecalculateDialog(false)
        setShowExistingPayrollDialog(false)
        setExistingPayroll(null) // Clear existing payroll state to proceed

        try {
            await fetchCompanyDetails(selectedCompanyId)
            const employeesResponse = await companyService.getCompanyEmployees(selectedCompanyId)
            setEmployees(employeesResponse.data)
            setCurrentStep(2)
            updateStepStatus(2, false, true)
        } catch (error) {
            setErrors(["Failed to fetch company details. Please try again."])
        }
    }

    const handleViewExistingPayroll = () => {
        setShowExistingPayrollDialog(false)
        router.push(`/payroll/reports?companyId=${selectedCompanyId}&startMonth=${format(selectedMonth, "yyyy-MM")}&endMonth=${format(selectedMonth, "yyyy-MM")}`)
    }

    const handleDataReview = () => {
        // Always go to admin input step if we have admin input fields
        if (adminInputFields.length > 0) {
            console.log("Moving to admin input step")
            setCurrentStep(3)
            updateStepStatus(3, false, true)
        } else {
            // Skip admin input if no fields require it
            console.log("No admin input fields, skipping to calculate")
            handleCalculatePayroll()
        }
    }

    const handleCalculatePayroll = async () => {
        if (adminInputFields.length > 0) {
            const employeeIds = employees.map((e) => e.id)
            const validationErrors = validateAdminInputs(employeeIds, adminInputFields)
            if (validationErrors.length > 0) {
                setErrors(validationErrors)
                return
            }
        }

        setErrors([])

        try {
            const payrollMonth = format(selectedMonth, "yyyy-MM")
            const request: CalculatePayrollDto = {
                companyId: selectedCompanyId,
                payrollMonth,
            }

            // If admin input fields exist, ensure all employees have entries for all fields with default 0
            if (adminInputFields.length > 0) {
                const processedAdminInputs: Record<string, Record<string, number>> = {}
                
                employees
                    .filter(employee => employee.status === "ACTIVE")
                    .forEach((employee) => {
                        processedAdminInputs[employee.employeeId] = {}
                        
                        adminInputFields.forEach((field) => {
                            // Use existing value if present, otherwise default to 0
                            const existingValue = adminInputs[employee.employeeId]?.[field.key]
                            processedAdminInputs[employee.employeeId][field.key] = 
                                existingValue !== undefined ? existingValue : 0
                        })
                    })
                
                request.adminInputs = processedAdminInputs
            }

            console.log("Sending calculate payroll request:", request)
            const result = await calculatePayroll(request)

            setCurrentStep(4)
            updateStepStatus(4, true, false)
            setCurrentStep(5)
            updateStepStatus(5, false, true)
        } catch (error) {
            // Error handled in hook
        }
    }

    const handleFinalizePayroll = async () => {
        if (!calculationResult) return

        try {
            const payrollRecords = calculationResult.data.payrollResults
                .filter((record) => record.salary && !record.error) // Only include records with valid salary and no errors
                .map((record) => ({
                    employeeId: record.employeeId,
                    salary: record.salary || {},
                }))

            await finalizePayroll({
                companyId: selectedCompanyId,
                payrollMonth: format(selectedMonth, "yyyy-MM"),
                payrollRecords,
            })

            setIsFinalized(true)
            updateStepStatus(5, true, false)
        } catch (error) {
            // Error handled in hook
        }
    }

    const handleReset = () => {
        setCurrentStep(1)
        setSteps(PAYROLL_STEPS)
        setSelectedCompanyId("")
        setSelectedMonth(new Date())
        setErrors([])
        setIsFinalized(false)
        setExistingPayroll(null)
        setShowExistingPayrollDialog(false)
        setShowRecalculateDialog(false)
        resetCalculation()
        resetInputs()
    }

    const selectedCompanyData = companies.find((c) => c.id === selectedCompanyId)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Calculate Payroll</h1>
                    <p className="text-muted-foreground">Process monthly payroll for your employees</p>
                </div>
                {currentStep > 1 && (
                    <Button variant="outline" onClick={handleReset}>
                        Start Over
                    </Button>
                )}
            </div>

            {/* Progress Steps */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className="flex items-center">
                                    <div
                                        className={`
                    flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium
                    ${step.completed
                                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                                : step.current
                                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                            }
                  `}
                                    >
                                        {step.completed ? <CheckCircle className="h-4 w-4" /> : step.id}
                                    </div>
                                    <div className="ml-3">
                                        <p
                                            className={`text-sm font-medium ${step.current ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"
                                                }`}
                                        >
                                            {step.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{step.description}</p>
                                    </div>
                                </div>
                                {index < steps.length - 1 && <div className="ml-6 h-px w-16 bg-gray-200 dark:bg-gray-700" />}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {errors.length > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            {/* Step 1: Company & Month Selection */}
            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Select Company & Month
                        </CardTitle>
                        <CardDescription>Choose the company and month for payroll processing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="company">Company</Label>
                                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {companies.map((company: any) => (
                                            <SelectItem key={company.id} value={company.id}>
                                                {company.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Payroll Month</Label>
                                    {checkingPayroll && (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                    {!checkingPayroll && existingPayroll && (
                                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Finalized
                                        </Badge>
                                    )}
                                    {!checkingPayroll && !existingPayroll && selectedCompanyId && (
                                        <Badge variant="outline" className="text-muted-foreground">
                                            Not Finalized
                                        </Badge>
                                    )}
                                </div>
                                <MonthPicker value={selectedMonth} onChange={(date) => date && setSelectedMonth(date)} />
                            </div>
                        </div>

                        {/* Existing Payroll Alert Banner */}
                        {existingPayroll && !checkingPayroll && (
                            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <AlertDescription className="text-amber-800 dark:text-amber-300">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="font-medium">Payroll already finalized for this month</p>
                                            <p className="text-sm">
                                                Finalized on {format(new Date(existingPayroll.finalizedDate), "MMM dd, yyyy")} • 
                                                {existingPayroll.totalEmployees} employees • 
                                                Net Salary: ₹{existingPayroll.totalNetSalary.toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleViewExistingPayroll}
                                                className="border-amber-300 text-amber-700 hover:bg-amber-100 hover:border-amber-500 hover:text-amber-900 transition-colors"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRecalculateAnyway}
                                                className="border-amber-300 text-amber-700 hover:bg-amber-100 hover:border-amber-500 hover:text-amber-900 transition-colors"
                                            >
                                                <Calculator className="h-4 w-4 mr-2" />
                                                Recalculate
                                            </Button>
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button
                            onClick={handleCompanyMonthSelect}
                            disabled={!selectedCompanyId || companiesLoading || checkingPayroll}
                            className="w-full"
                            type="button"
                        >
                            {checkingPayroll ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Checking...
                                </>
                            ) : existingPayroll ? (
                                <>
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Existing Payroll
                                </>
                            ) : (
                                <>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Continue to Data Review
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Data Review */}
            {currentStep === 2 && selectedCompany && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Review Company Data
                        </CardTitle>
                        <CardDescription>
                            Verify company information for {selectedCompany.name} - {format(selectedMonth, "MMMM yyyy")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Company Name</Label>
                                <p className="text-sm">{selectedCompany.name}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Contact Person</Label>
                                <p className="text-sm">{selectedCompany.contactPersonName}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Contact Number</Label>
                                <p className="text-sm">{selectedCompany.contactPersonNumber}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Status</Label>
                                <Badge variant={selectedCompany.status === "ACTIVE" ? "default" : "secondary"}>
                                    {selectedCompany.status}
                                </Badge>
                            </div>
                        </div>

                        {adminInputFields.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium mb-2">Admin Input Required Fields</h3>
                                <div className="flex flex-wrap gap-2">
                                    {adminInputFields.map((field) => (
                                        <Badge key={field.key} variant="outline">
                                            {field.label}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setCurrentStep(1)}>
                                Back
                            </Button>
                            <Button onClick={handleDataReview}>
                                {adminInputFields.length > 0 ? "Continue to Admin Input" : "Calculate Payroll"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Admin Input */}
            {currentStep === 3 && adminInputFields.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calculator className="h-5 w-5" />
                            Admin Input Required
                        </CardTitle>
                        <CardDescription>Fill in the required custom fields for payroll calculation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                The following fields require admin input. You can leave fields empty if not applicable for specific
                                employees.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-6">
                            {employees
                                .filter(employee => employee.status === "ACTIVE")
                                .map((employee) => (
                                <div key={employee.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold">{employee.firstName} {employee.lastName}</h3>
                                            <p className="text-sm text-muted-foreground">{employee.id}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {adminInputFields.map((field) => (
                                            <div key={field.key} className="space-y-2">
                                                <Label htmlFor={`${employee.id}-${field.key}`}>
                                                    {field.label}
                                                    <Badge
                                                        variant={
                                                            field.purpose === "ALLOWANCE" || field.purpose === "allowance"
                                                                ? "default"
                                                                : field.purpose === "DEDUCTION" || field.purpose === "deduction"
                                                                    ? "destructive"
                                                                    : "secondary"
                                                        }
                                                        className="ml-2 text-xs"
                                                    >
                                                        {field.purpose}
                                                    </Badge>
                                                </Label>
                                                <Input
                                                    id={`${employee.employeeId}-${field.key}`}
                                                    type="number"
                                                    min="0"
                                                    placeholder={field.defaultValue || "0"}
                                                    value={adminInputs[employee.employeeId]?.[field.key] || ""}
                                                    onChange={(e) =>
                                                        updateAdminInput(employee.employeeId, field.key, Number.parseFloat(e.target.value) || 0)
                                                    }
                                                />
                                                {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setCurrentStep(2)}>
                                Back
                            </Button>
                            <Button onClick={handleCalculatePayroll} disabled={isCalculating}>
                                {isCalculating ? "Calculating..." : "Calculate Payroll"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 5: Finalize */}
            {currentStep === 5 && calculationResult && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            {isFinalized ? "Payroll Finalized Successfully" : "Review & Finalize Payroll"}
                        </CardTitle>
                        <CardDescription>
                            {isFinalized
                                ? "Payroll has been successfully finalized and saved."
                                : "Review the calculated payroll and finalize to save the records"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Success Alert */}
                        {isFinalized && (
                            <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800 dark:text-green-300">
                                    <strong>Payroll Finalized!</strong> The payroll records have been successfully saved. You can view them in the Payroll Reports section.
                                </AlertDescription>
                            </Alert>
                        )}
                        {/* Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                    {calculationResult.data.totalEmployees}
                                </p>
                                <p className="text-sm text-muted-foreground">Total Employees</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                    {calculationResult.data.companyName}
                                </p>
                                <p className="text-sm text-muted-foreground">Company</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                    {calculationResult.data.payrollMonth}
                                </p>
                                <p className="text-sm text-muted-foreground">Payroll Month</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Detailed Records */}
                        <div className="rounded-md border overflow-x-auto scrollbar-sleek">
                            <Table className="min-w-[1200px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Present Days</TableHead>
                                        <TableHead>Rate</TableHead>
                                        <TableHead>Basic Pay</TableHead>
                                        <TableHead>Gross Salary</TableHead>
                                        <TableHead>PF</TableHead>
                                        <TableHead>ESIC</TableHead>
                                        <TableHead>Total Deductions</TableHead>
                                        <TableHead>Net Salary</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {calculationResult.data.payrollResults.map((record) => {
                                        const salary = record.salary as any
                                        const salaryCategory = salary?.salaryCategory
                                        const salarySubCategory = salary?.salarySubCategory
                                        // Access grouped salary data with fallbacks for backward compatibility
                                        const calculations = salary?.calculations || {}
                                        const deductions = salary?.deductions || {}
                                        const allowances = salary?.allowances || {}
                                        const information = salary?.information || {}
                                        const rate = calculations?.rate ?? salary?.rate
                                        const isSpecialized = salaryCategory === SalaryCategory.SPECIALIZED
                                        const pfEnabled = salary?.pfEnabled ?? false
                                        const esicEnabled = salary?.esicEnabled ?? false
                                        const pfAmount = deductions?.pf ?? salary?.pf ?? 0
                                        const esicAmount = deductions?.esic ?? salary?.esic ?? 0
                                        
                                        return (
                                            <TableRow key={record.employeeId}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{record.employeeName}</p>
                                                        <p className="text-xs text-muted-foreground">{record.employeeId}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {salaryCategory ? (
                                                        <div className="flex flex-col gap-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {salaryCategory}
                                                            </Badge>
                                                            {salarySubCategory && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    {salarySubCategory}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{record.presentDays}</TableCell>
                                                <TableCell>
                                                    {rate !== undefined && rate !== null ? (
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center">
                                                                <IndianRupee className="h-3 w-3 mr-1" />
                                                                <span className="text-sm font-medium">
                                                                    {rate.toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                {isSpecialized ? "/month" : "/day"}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <IndianRupee className="h-3 w-3 mr-1" />
                                                        {calculations?.basicPay ?? salary?.basicPay ? (calculations?.basicPay ?? salary?.basicPay).toLocaleString() : "N/A"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <IndianRupee className="h-3 w-3 mr-1" />
                                                        {calculations?.grossSalary ?? salary?.grossSalary ? (calculations?.grossSalary ?? salary?.grossSalary).toLocaleString() : "N/A"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {pfAmount > 0 ? (
                                                        <div className="flex items-center">
                                                            <IndianRupee className="h-3 w-3 mr-1" />
                                                            <span>{pfAmount.toLocaleString()}</span>
                                                        </div>
                                                    ) : !pfEnabled ? (
                                                        <div className="flex items-center gap-1" title="PF not enabled">
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                            <Info className="h-3 w-3 text-muted-foreground" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1" title="PF enabled but amount is 0 (Gross salary may exceed threshold)">
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                            <Info className="h-3 w-3 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {esicAmount > 0 ? (
                                                        <div className="flex items-center">
                                                            <IndianRupee className="h-3 w-3 mr-1" />
                                                            <span>{esicAmount.toLocaleString()}</span>
                                                        </div>
                                                    ) : !esicEnabled ? (
                                                        <div className="flex items-center gap-1" title="ESIC not enabled">
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                            <Info className="h-3 w-3 text-muted-foreground" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1" title="ESIC enabled but amount is 0 (Gross salary may exceed threshold)">
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                            <Info className="h-3 w-3 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <IndianRupee className="h-3 w-3 mr-1" />
                                                        {deductions?.totalDeductions ?? salary?.totalDeductions ? (deductions?.totalDeductions ?? salary?.totalDeductions).toLocaleString() : "N/A"}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    <div className="flex items-center">
                                                        <IndianRupee className="h-3 w-3 mr-1" />
                                                        {calculations?.netSalary ?? salary?.netSalary ? (calculations?.netSalary ?? salary?.netSalary).toLocaleString() : "N/A"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {record.error ? (
                                                        <Badge variant="destructive">Error</Badge>
                                                    ) : isFinalized ? (
                                                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Finalized
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="default">Pending</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-between">
                            {isFinalized ? (
                                <>
                                    <Button variant="outline" onClick={handleReset}>
                                        Calculate New Payroll
                                    </Button>
                                    <Button onClick={() => router.push("/payroll/reports")}>
                                        View Payroll Reports
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                                        Back to Edit
                                    </Button>
                                    <Button onClick={handleFinalizePayroll} disabled={isFinalizing}>
                                        {isFinalizing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Finalizing...
                                            </>
                                        ) : (
                                            "Finalize Payroll"
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Existing Payroll Summary Dialog */}
            <Dialog open={showExistingPayrollDialog} onOpenChange={setShowExistingPayrollDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Existing Payroll Found
                        </DialogTitle>
                        <DialogDescription>
                            A payroll has already been finalized for {selectedCompanyData?.name || "this company"} - {format(selectedMonth, "MMMM yyyy")}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {existingPayroll && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Total Employees</p>
                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                        {existingPayroll.totalEmployees}
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Net Salary</p>
                                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                        ₹{existingPayroll.totalNetSalary.toLocaleString("en-IN")}
                                    </p>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Gross Salary</p>
                                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                        ₹{existingPayroll.totalGrossSalary.toLocaleString("en-IN")}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Finalized On</p>
                                <p className="font-medium">
                                    {format(new Date(existingPayroll.finalizedDate), "EEEE, MMMM dd, yyyy 'at' hh:mm a")}
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowExistingPayrollDialog(false)}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleViewExistingPayroll}
                            className="w-full sm:w-auto"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View in Reports
                        </Button>
                        <Button
                            onClick={handleRecalculateAnyway}
                            className="w-full sm:w-auto"
                        >
                            <Calculator className="h-4 w-4 mr-2" />
                            Recalculate Anyway
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Recalculate Confirmation Dialog */}
            <AlertDialog open={showRecalculateDialog} onOpenChange={setShowRecalculateDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            Confirm Recalculation
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>
                                You are about to recalculate payroll for <strong>{selectedCompanyData?.name || "this company"}</strong> - <strong>{format(selectedMonth, "MMMM yyyy")}</strong>.
                            </p>
                                <p className="font-medium text-foreground">
                                    This will create a new payroll record. The existing finalized payroll will be replaced by the new one.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Are you sure you want to proceed?
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRecalculate} className="bg-amber-600 hover:bg-amber-700">
                            Yes, Recalculate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

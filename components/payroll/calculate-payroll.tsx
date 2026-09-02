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
import { Combobox } from "@/components/ui/combobox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useClient } from "@/hooks/use-client"
import { usePayroll, usePayrollAdminInputs } from "@/hooks/use-payroll"
import { Calendar, Users, Calculator, CheckCircle, AlertCircle, Building2, IndianRupee, Loader2, Info, Eye, FileText } from "lucide-react"
import { format } from "date-fns"
import type { PayrollStep, CalculatePayrollDto } from "@/types/payroll"
import { clientService } from "@/services/clientService"
import { ClientEmployee } from "@/types/client"
import { SalaryCategory } from "@/types/salary"
import { label } from "@/lib/labels"
import { payrollService } from "@/services/payrollService"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { PageHeader } from "@/components/layout/page-header"

const PAYROLL_STEPS: PayrollStep[] = [
    {
        id: 1,
        title: "Select Client & Month",
        description: "Choose client and payroll period",
        completed: false,
        current: true,
    },
    { id: 2, title: "Review Data", description: "Verify employee and attendance data", completed: false, current: false },
    { id: 3, title: "Admin Input", description: "Fill required custom fields", completed: false, current: false },
    { id: 4, title: "Calculate", description: "Calculate payroll amounts", completed: false, current: false },
    { id: 5, title: "Finalize", description: "Review and finalize payroll", completed: false, current: false },
]

export default function CalculatePayroll() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [steps, setSteps] = useState(PAYROLL_STEPS)
    const [selectedClientId, setSelectedClientId] = useState<string>("")
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
    const [errors, setErrors] = useState<string[]>([])
    const [employees, setEmployees] = useState<ClientEmployee[]>([])
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

    const { clients, isLoading: clientsLoading } = useClient()
    const {
        isCalculating,
        isFinalizing,
        calculationResult,
        selectedClient,
        adminInputFields,
        fetchClientDetails,
        calculatePayroll,
        finalizePayroll,
        resetCalculation,
    } = usePayroll()

    const { adminInputs, updateAdminInput, validateAdminInputs, resetInputs } = usePayrollAdminInputs()

    const updateStepStatus = (stepId: number, completed: boolean, current: boolean) => {
        setSteps((prev) =>
            prev.map((step) => ({
                ...step,
                completed: step.id < stepId ? true : step.id === stepId ? completed : false,
                current: step.id === stepId ? current : false,
            })),
        )
    }

    // Check for finalized payroll when client/month changes
    // If getPayrollByMonth returns data, it means payroll is already finalized
    useEffect(() => {
        const checkFinalizedPayroll = async () => {
            if (!selectedClientId || !selectedMonth) {
                setExistingPayroll(null)
                return
            }

            setCheckingPayroll(true)
            try {
                const payrollMonth = format(selectedMonth, "yyyy-MM")
                const payrollData = await payrollService.getPayrollByMonth(selectedClientId, payrollMonth)
                
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
    }, [selectedClientId, selectedMonth])

    const handleClientMonthSelect = async () => {
        if (!selectedClientId) {
            setErrors(["Please select a client"])
            return
        }

        setErrors([])

        // If payroll exists, show dialog instead of proceeding
        if (existingPayroll) {
            setShowExistingPayrollDialog(true)
            return
        }

        try {
            await fetchClientDetails(selectedClientId)
            // Fetch employees for the selected client
            const employeesResponse = await clientService.getClientEmployees(selectedClientId)
            setEmployees(employeesResponse.data)
            setCurrentStep(2)
            updateStepStatus(2, false, true)
        } catch (error) {
            setErrors(["Failed to fetch client details. Please try again."])
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
            await fetchClientDetails(selectedClientId)
            const employeesResponse = await clientService.getClientEmployees(selectedClientId)
            setEmployees(employeesResponse.data)
            setCurrentStep(2)
            updateStepStatus(2, false, true)
        } catch (error) {
            setErrors(["Failed to fetch client details. Please try again."])
        }
    }

    const handleViewExistingPayroll = () => {
        setShowExistingPayrollDialog(false)
        router.push(`/payroll/reports?clientId=${selectedClientId}&startMonth=${format(selectedMonth, "yyyy-MM")}&endMonth=${format(selectedMonth, "yyyy-MM")}`)
    }

    const handleDataReview = () => {
        // Always go to admin input step if we have admin input fields
        if (adminInputFields.length > 0) {
            setCurrentStep(3)
            updateStepStatus(3, false, true)
        } else {
            handleCalculatePayroll()
        }
    }

    const handleCalculatePayroll = async () => {
        if (adminInputFields.length > 0) {
            const employeeIds = employees
                .filter((e) => e.status === "ACTIVE")
                .map((e) => e.employeeId)
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
                clientId: selectedClientId,
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
            const processedAdminInputs: Record<string, Record<string, number>> = {}
            if (adminInputFields.length > 0) {
                employees
                    .filter((employee) => employee.status === "ACTIVE")
                    .forEach((employee) => {
                        processedAdminInputs[employee.employeeId] = {}
                        adminInputFields.forEach((field) => {
                            const existingValue = adminInputs[employee.employeeId]?.[field.key]
                            processedAdminInputs[employee.employeeId][field.key] =
                                existingValue !== undefined ? existingValue : 0
                        })
                    })
            }

            await finalizePayroll({
                clientId: selectedClientId,
                payrollMonth: format(selectedMonth, "yyyy-MM"),
                adminInputs: adminInputFields.length > 0 ? processedAdminInputs : undefined,
                force: !!existingPayroll,
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
        setSelectedClientId("")
        setSelectedMonth(new Date())
        setErrors([])
        setIsFinalized(false)
        setExistingPayroll(null)
        setShowExistingPayrollDialog(false)
        setShowRecalculateDialog(false)
        resetCalculation()
        resetInputs()
    }

    const selectedClientData = clients.find((c) => c.id === selectedClientId)

    return (
        <div className="space-y-6">
            <PageHeader
                no="03"
                eyebrow="Payroll register"
                title="Calculate Payroll"
                description="Process monthly payroll for your employees"
                actions={
                    currentStep > 1 ? (
                        <Button variant="outline" onClick={handleReset}>
                            Start Over
                        </Button>
                    ) : undefined
                }
            />

            {/* Progress Steps */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className="flex items-center">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center font-mono text-[13px] font-semibold ${
                                            step.completed
                                                ? "text-success"
                                                : step.current
                                                    ? "border-b-2 border-brand text-brand"
                                                    : "text-muted-foreground"
                                        }`}
                                    >
                                        {step.completed ? <CheckCircle className="h-4 w-4" /> : String(step.id).padStart(2, "0")}
                                    </div>
                                    <div className="ml-3">
                                        <p
                                            className={`text-sm font-medium ${
                                                step.current ? "text-brand" : step.completed ? "text-success" : "text-foreground"
                                            }`}
                                        >
                                            {step.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{step.description}</p>
                                    </div>
                                </div>
                                {index < steps.length - 1 && <div className="ml-6 h-px w-16 bg-border" />}
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

            {/* Step 1: Client & Month Selection */}
            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Select Client & Month
                        </CardTitle>
                        <CardDescription>Choose the client and month for payroll processing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="client">Client</Label>
                                <Combobox
                                    options={clients.map((client: any) => ({ value: client.id ?? "", label: client.name }))}
                                    value={selectedClientId}
                                    onChange={setSelectedClientId}
                                    placeholder="Select a client"
                                    searchPlaceholder="Search clients..."
                                    emptyText="No clients found."
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Payroll Month</Label>
                                    {checkingPayroll && (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                    {!checkingPayroll && existingPayroll && (
                                        <Badge variant="success">
                                            <CheckCircle className="h-3 w-3" />
                                            Finalized
                                        </Badge>
                                    )}
                                    {!checkingPayroll && !existingPayroll && selectedClientId && (
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
                            <Alert variant="warning">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="font-medium">Payroll already finalized for this month</p>
                                            <p className="text-sm">
                                                {(() => {
                                                    const d = new Date(existingPayroll.finalizedDate)
                                                    return !isNaN(d.getTime()) ? `Finalized on ${format(d, "MMM dd, yyyy")} • ` : ""
                                                })()}
                                                {existingPayroll.totalEmployees} employees •
                                                Net Salary: ₹{existingPayroll.totalNetSalary.toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleViewExistingPayroll}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRecalculateAnyway}
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
                            onClick={handleClientMonthSelect}
                            disabled={!selectedClientId || clientsLoading || checkingPayroll}
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
            {currentStep === 2 && selectedClient && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Review Client Data
                        </CardTitle>
                        <CardDescription>
                            Verify client information for {selectedClient.name} - {format(selectedMonth, "MMMM yyyy")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Client Name</Label>
                                <p className="text-sm">{selectedClient.name}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Contact Person</Label>
                                <p className="text-sm">{selectedClient.contactPersonName}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Contact Number</Label>
                                <p className="text-sm">{selectedClient.contactPersonNumber}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Status</Label>
                                <Badge variant={selectedClient.status === "ACTIVE" ? "success" : "destructive"}>
                                    {label.status(selectedClient.status)}
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
                            <Button onClick={handleDataReview} disabled={isCalculating}>
                                {isCalculating
                                    ? "Calculating..."
                                    : adminInputFields.length > 0
                                        ? "Continue to Admin Input"
                                        : "Calculate Payroll"}
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
                                            <p className="font-mono text-[13px] text-muted-foreground">{employee.employeeId}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {adminInputFields.map((field) => (
                                            <div key={field.key} className="space-y-2">
                                                <Label htmlFor={`${employee.employeeId}-${field.key}`}>
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
                                                    value={adminInputs[employee.employeeId]?.[field.key] ?? ""}
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
                            <Button variant="brand" onClick={handleCalculatePayroll} disabled={isCalculating}>
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
                            <Alert variant="success">
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Payroll Finalized!</strong> The payroll records have been successfully saved. You can view them in the Payroll Reports section.
                                </AlertDescription>
                            </Alert>
                        )}
                        {/* Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 rounded-md border bg-surface">
                                <p className="font-display text-2xl font-bold nums">
                                    {calculationResult.data.totalEmployees}
                                </p>
                                <p className="text-sm text-muted-foreground">Total Employees</p>
                            </div>
                            <div className="text-center p-4 rounded-md border bg-surface">
                                <p className="font-display text-2xl font-bold">
                                    {calculationResult.data.clientName}
                                </p>
                                <p className="text-sm text-muted-foreground">Client</p>
                            </div>
                            <div className="text-center p-4 rounded-md border bg-surface">
                                <p className="font-display text-2xl font-bold nums">
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
                                        <TableHead className="text-right">Present Days</TableHead>
                                        <TableHead className="text-right">Rate</TableHead>
                                        <TableHead className="text-right">Basic Pay</TableHead>
                                        <TableHead className="text-right">Gross Salary</TableHead>
                                        <TableHead className="text-right">PF</TableHead>
                                        <TableHead className="text-right">ESIC</TableHead>
                                        <TableHead className="text-right">Total Deductions</TableHead>
                                        <TableHead className="text-right">Net Salary</TableHead>
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
                                                        <p className="font-mono text-xs text-muted-foreground">{record.employeeId}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {salaryCategory ? (
                                                        <div className="flex flex-col gap-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {label.salaryCategory(salaryCategory)}
                                                            </Badge>
                                                            {salarySubCategory && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    {label.salarySubCategory(salarySubCategory)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-[13px]">{record.presentDays}</TableCell>
                                                <TableCell className="text-right">
                                                    {rate !== undefined && rate !== null ? (
                                                        <div className="flex flex-col items-end">
                                                            <div className="flex items-center">
                                                                <IndianRupee className="h-3 w-3 mr-1" />
                                                                <span className="font-mono text-[13px] font-medium">
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
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end font-mono text-[13px]">
                                                        <IndianRupee className="h-3 w-3 mr-1" />
                                                        {calculations?.basicPay ?? salary?.basicPay ? (calculations?.basicPay ?? salary?.basicPay).toLocaleString() : "N/A"}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end font-mono text-[13px]">
                                                        <IndianRupee className="h-3 w-3 mr-1" />
                                                        {calculations?.grossSalary ?? salary?.grossSalary ? (calculations?.grossSalary ?? salary?.grossSalary).toLocaleString() : "N/A"}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {pfAmount > 0 ? (
                                                        <div className="flex items-center justify-end font-mono text-[13px]">
                                                            <IndianRupee className="h-3 w-3 mr-1" />
                                                            <span>{pfAmount.toLocaleString()}</span>
                                                        </div>
                                                    ) : !pfEnabled ? (
                                                        <div className="flex items-center justify-end gap-1" title="PF not enabled">
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                            <Info className="h-3 w-3 text-muted-foreground" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-1" title="PF enabled but amount is 0 (Gross salary may exceed threshold)">
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                            <Info className="h-3 w-3 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {esicAmount > 0 ? (
                                                        <div className="flex items-center justify-end font-mono text-[13px]">
                                                            <IndianRupee className="h-3 w-3 mr-1" />
                                                            <span>{esicAmount.toLocaleString()}</span>
                                                        </div>
                                                    ) : !esicEnabled ? (
                                                        <div className="flex items-center justify-end gap-1" title="ESIC not enabled">
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                            <Info className="h-3 w-3 text-muted-foreground" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-1" title="ESIC enabled but amount is 0 (Gross salary may exceed threshold)">
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                            <Info className="h-3 w-3 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end font-mono text-[13px]">
                                                        <IndianRupee className="h-3 w-3 mr-1" />
                                                        {deductions?.totalDeductions ?? salary?.totalDeductions ? (deductions?.totalDeductions ?? salary?.totalDeductions).toLocaleString() : "N/A"}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    <div className="flex items-center justify-end font-mono text-[13px]">
                                                        <IndianRupee className="h-3 w-3 mr-1" />
                                                        {calculations?.netSalary ?? salary?.netSalary ? (calculations?.netSalary ?? salary?.netSalary).toLocaleString() : "N/A"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {record.error ? (
                                                        <Badge variant="destructive">Error</Badge>
                                                    ) : isFinalized ? (
                                                        <Badge variant="success">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Finalized
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="warning">Pending</Badge>
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
                                    <Button variant="brand" onClick={handleFinalizePayroll} disabled={isFinalizing}>
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
                            A payroll has already been finalized for {selectedClientData?.name || "this client"} - {format(selectedMonth, "MMMM yyyy")}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {existingPayroll && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-md border bg-surface">
                                    <p className="text-sm text-muted-foreground mb-1">Total Employees</p>
                                    <p className="font-display text-2xl font-bold nums">
                                        {existingPayroll.totalEmployees}
                                    </p>
                                </div>
                                <div className="p-4 rounded-md border bg-surface">
                                    <p className="text-sm text-muted-foreground mb-1">Net Salary</p>
                                    <p className="font-display text-2xl font-bold nums text-brand">
                                        ₹{existingPayroll.totalNetSalary.toLocaleString("en-IN")}
                                    </p>
                                </div>
                                <div className="p-4 rounded-md border bg-surface">
                                    <p className="text-sm text-muted-foreground mb-1">Gross Salary</p>
                                    <p className="font-display text-2xl font-bold nums">
                                        ₹{existingPayroll.totalGrossSalary.toLocaleString("en-IN")}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 rounded-md border bg-surface">
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
                            <AlertCircle className="h-5 w-5 text-warning" />
                            Confirm Recalculation
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>
                                You are about to recalculate payroll for <strong>{selectedClientData?.name || "this client"}</strong> - <strong>{format(selectedMonth, "MMMM yyyy")}</strong>.
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
                        <AlertDialogAction onClick={confirmRecalculate}>
                            Yes, Recalculate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

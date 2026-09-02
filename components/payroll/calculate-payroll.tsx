"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MonthPicker } from "@/components/ui/month-picker"
import { Combobox } from "@/components/ui/combobox"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePayroll, usePayrollAdminInputs, usePayrollClients } from "@/hooks/use-payroll"
import { Calendar, Users, Calculator, CheckCircle, AlertCircle, Building2, Loader2, Eye, FileText, Upload } from "lucide-react"
import { format, isValid } from "date-fns"
import type { PayrollStep, CalculatePayrollDto, FinalizePayrollResponse, PayrollRecord } from "@/types/payroll"
import { clientService } from "@/services/clientService"
import type { ClientEmployee } from "@/types/client"
import { employeeName, formatDateTime, formatMoney, label } from "@/lib/labels"
import { payrollService } from "@/services/payrollService"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { PageHeader } from "@/components/layout/page-header"

const ADMIN_INPUT_STEP = 3
const FINALIZE_STEP = 4

const WIZARD_STEPS: PayrollStep[] = [
    { id: 1, title: "Select client and month", description: "Who to pay and for which month" },
    { id: 2, title: "Review", description: "Check employees and attendance" },
    { id: ADMIN_INPUT_STEP, title: "Admin input", description: "Fill in the extra fields this client needs" },
    { id: FINALIZE_STEP, title: "Review and finalize", description: "Check the figures, then save" },
]

interface ExistingPayroll {
    totalEmployees: number
    totalNetSalary: number
    totalGrossSalary: number
    finalizedAt: string | null
}

interface SalaryFigures {
    category: string | null
    subCategory: string | null
    ratePerDay: number
    basicPay: number
    grossSalary: number
    pf: number
    esic: number
    totalDeductions: number
    netSalary: number
    pfEnabled?: boolean
    esicEnabled?: boolean
}

interface PayrollTotals {
    basicPay: number
    grossSalary: number
    pf: number
    esic: number
    totalDeductions: number
    netSalary: number
}

const EMPTY_TOTALS: PayrollTotals = { basicPay: 0, grossSalary: 0, pf: 0, esic: 0, totalDeductions: 0, netSalary: 0 }

function toNumber(...values: unknown[]): number {
    for (const value of values) {
        if (typeof value === "number" && !Number.isNaN(value)) return value
        if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value)
    }
    return 0
}

// Older payroll records store salary fields flat, newer ones group them, so read both.
function readSalary(record: PayrollRecord): SalaryFigures {
    const salary = (record.salary ?? {}) as Record<string, any>
    const calculations = salary.calculations ?? {}
    const deductions = salary.deductions ?? {}
    const information = salary.information ?? {}
    return {
        category: information.salaryCategory ?? salary.salaryCategory ?? null,
        subCategory: information.salarySubCategory ?? salary.salarySubCategory ?? null,
        ratePerDay: toNumber(calculations.wagesPerDay, salary.wagesPerDay, salary.salaryPerDay, calculations.rate, salary.rate),
        basicPay: toNumber(calculations.basicPay, salary.basicPay),
        grossSalary: toNumber(calculations.grossSalary, salary.grossSalary),
        pf: toNumber(deductions.pf, salary.pf),
        esic: toNumber(deductions.esic, salary.esic),
        totalDeductions: toNumber(deductions.totalDeductions, salary.totalDeductions, salary.totalDeduction),
        netSalary: toNumber(calculations.netSalary, salary.netSalary),
        pfEnabled: typeof salary.pfEnabled === "boolean" ? salary.pfEnabled : undefined,
        esicEnabled: typeof salary.esicEnabled === "boolean" ? salary.esicEnabled : undefined,
    }
}

type StatTone = "default" | "brand" | "success" | "warning" | "destructive"

const TONE_CLASS: Record<StatTone, string> = {
    default: "",
    brand: "text-brand",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
}

interface StatTileProps {
    label: string
    value: string | number
    hint?: string
    tone?: StatTone
    compact?: boolean
}

function StatTile({ label, value, hint, tone = "default", compact = false }: StatTileProps): JSX.Element {
    return (
        <div className="p-4 rounded-md border bg-surface">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`font-display font-bold nums break-words ${compact ? "text-lg" : "text-2xl"} ${TONE_CLASS[tone]}`}>{value}</p>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    )
}

interface EmployeeListProps {
    title: string
    employees: Array<{ employeeId: string; name: string }>
}

function EmployeeList({ title, employees }: EmployeeListProps): JSX.Element {
    return (
        <div className="rounded-md border bg-surface text-foreground">
            <p className="px-3 py-2 text-sm font-medium border-b">{title}</p>
            <ul className="max-h-56 overflow-y-auto scrollbar-sleek divide-y">
                {employees.map((employee) => (
                    <li key={employee.employeeId} className="flex items-center justify-between gap-3 px-3 py-1.5 text-sm">
                        <span>{employee.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">{employee.employeeId}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function monthParamToDate(value: string | null): Date | undefined {
    const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value ?? "")
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, 1) : undefined
}

function CalculatePayrollContent(): JSX.Element {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [currentStep, setCurrentStep] = useState(1)
    const [selectedClientId, setSelectedClientId] = useState(searchParams.get("clientId") ?? "")
    const [selectedMonth, setSelectedMonth] = useState<Date>(monthParamToDate(searchParams.get("month")) ?? new Date())
    const [errors, setErrors] = useState<string[]>([])
    const [employees, setEmployees] = useState<ClientEmployee[]>([])
    const [attendedEmployeeIds, setAttendedEmployeeIds] = useState<string[] | null>(null)
    const [reviewLoading, setReviewLoading] = useState(false)
    const [isRecalculating, setIsRecalculating] = useState(false)
    const [finalizeResult, setFinalizeResult] = useState<FinalizePayrollResponse["data"] | null>(null)
    const [existingPayroll, setExistingPayroll] = useState<ExistingPayroll | null>(null)
    const [checkingPayroll, setCheckingPayroll] = useState(false)
    const [showExistingPayrollDialog, setShowExistingPayrollDialog] = useState(false)
    const [showRecalculateDialog, setShowRecalculateDialog] = useState(false)
    const [showFinalizeDialog, setShowFinalizeDialog] = useState(false)

    const { clients, isLoading: clientsLoading } = usePayrollClients()
    const {
        isCalculating,
        isFinalizing,
        calculationResult,
        selectedClient,
        adminInputFields,
        fetchClientDetails,
        fetchAttendanceCoverage,
        calculatePayroll,
        finalizePayroll,
        resetCalculation,
    } = usePayroll()

    const { adminInputs, updateAdminInput, validateAdminInputs, resetInputs } = usePayrollAdminInputs()

    const payrollMonth = format(selectedMonth, "yyyy-MM")
    const monthLabel = format(selectedMonth, "MMMM yyyy")
    const hasAdminInputs = adminInputFields.length > 0
    const isFinalized = finalizeResult !== null
    const steps = hasAdminInputs ? WIZARD_STEPS : WIZARD_STEPS.filter((step) => step.id !== ADMIN_INPUT_STEP)
    const selectedClientData = clients.find((c) => c.id === selectedClientId)
    const clientName = selectedClient?.name ?? selectedClientData?.name ?? "this client"
    const reportsUrl = `/payroll/reports?clientId=${selectedClientId}&startMonth=${payrollMonth}&endMonth=${payrollMonth}`

    const activeEmployees = useMemo(() => {
        const seen = new Set<string>()
        const unique: ClientEmployee[] = []
        for (const employee of employees) {
            if (employee.status !== "ACTIVE" || seen.has(employee.employeeId)) continue
            seen.add(employee.employeeId)
            unique.push(employee)
        }
        return unique
    }, [employees])

    const missingAttendanceEmployees = useMemo(() => {
        if (attendedEmployeeIds === null) return []
        const attended = new Set(attendedEmployeeIds)
        return activeEmployees.filter((employee) => !attended.has(employee.employeeId))
    }, [activeEmployees, attendedEmployeeIds])

    const attendedCount = activeEmployees.length - missingAttendanceEmployees.length
    const coverage = activeEmployees.length > 0 ? Math.round((attendedCount / activeEmployees.length) * 100) : 0
    const attendanceUnknown = attendedEmployeeIds === null

    const results = useMemo(() => calculationResult?.data.payrollResults ?? [], [calculationResult])
    const figures = useMemo(() => results.map((record) => ({ record, salary: readSalary(record) })), [results])
    const totals = useMemo(
        () =>
            figures.reduce<PayrollTotals>(
                (acc, { salary }) => ({
                    basicPay: acc.basicPay + salary.basicPay,
                    grossSalary: acc.grossSalary + salary.grossSalary,
                    pf: acc.pf + salary.pf,
                    esic: acc.esic + salary.esic,
                    totalDeductions: acc.totalDeductions + salary.totalDeductions,
                    netSalary: acc.netSalary + salary.netSalary,
                }),
                EMPTY_TOTALS,
            ),
        [figures],
    )
    const zeroPayCount = figures.filter(({ record, salary }) => record.error || salary.netSalary <= 0).length
    const calculatedMissingAttendance =
        calculationResult?.data.missingAttendance ?? results.filter((record) => record.hasAttendance === false).map((record) => record.employeeId)
    const excludedNotActive = calculationResult?.data.excludedNotActive ?? 0
    const skippedIds = useMemo(() => new Set(finalizeResult?.skipped ?? []), [finalizeResult])

    const employeeNames = useMemo(() => {
        const names = new Map<string, string>()
        results.forEach((record) => names.set(record.employeeId, record.employeeName))
        activeEmployees.forEach((employee) => names.set(employee.employeeId, employeeName(employee)))
        return names
    }, [results, activeEmployees])
    const nameFor = (employeeId: string): string => employeeNames.get(employeeId) ?? employeeId

    useEffect(() => {
        if (!selectedClientId) {
            setExistingPayroll(null)
            return
        }

        let cancelled = false
        setCheckingPayroll(true)
        payrollService
            .getPayrollByMonth(selectedClientId, payrollMonth)
            .then((payrollData) => {
                if (cancelled) return
                const first = payrollData?.records?.[0]
                if (!payrollData || !first) {
                    setExistingPayroll(null)
                    return
                }
                const rawDate = first.finalizedAt ?? first.updatedAt ?? first.createdAt
                setExistingPayroll({
                    totalEmployees: payrollData.summary.totalEmployees,
                    totalNetSalary: payrollData.summary.totalNetSalary,
                    totalGrossSalary: payrollData.summary.totalGrossSalary,
                    finalizedAt: rawDate && isValid(new Date(rawDate)) ? rawDate : null,
                })
            })
            .catch(() => {
                if (!cancelled) setExistingPayroll(null)
            })
            .finally(() => {
                if (!cancelled) setCheckingPayroll(false)
            })

        return () => {
            cancelled = true
        }
    }, [selectedClientId, payrollMonth])

    const loadReviewData = async (): Promise<void> => {
        setReviewLoading(true)
        setErrors([])
        try {
            const [, employeesResponse, attended] = await Promise.all([
                fetchClientDetails(selectedClientId),
                clientService.getClientEmployees(selectedClientId),
                fetchAttendanceCoverage(selectedClientId, payrollMonth),
            ])
            setEmployees(employeesResponse.data)
            setAttendedEmployeeIds(attended)
            setCurrentStep(2)
        } catch {
            setErrors(["Could not load the client details. Please try again."])
        } finally {
            setReviewLoading(false)
        }
    }

    const handleClientMonthSelect = async (): Promise<void> => {
        if (!selectedClientId) {
            setErrors(["Please select a client"])
            return
        }
        if (existingPayroll) {
            setShowExistingPayrollDialog(true)
            return
        }
        await loadReviewData()
    }

    const confirmRecalculate = async (): Promise<void> => {
        setShowRecalculateDialog(false)
        setShowExistingPayrollDialog(false)
        setIsRecalculating(true)
        await loadReviewData()
    }

    const handleViewExistingPayroll = (): void => {
        setShowExistingPayrollDialog(false)
        router.push(reportsUrl)
    }

    const buildAdminInputs = (): Record<string, Record<string, number>> => {
        const inputs: Record<string, Record<string, number>> = {}
        activeEmployees.forEach((employee) => {
            inputs[employee.employeeId] = {}
            adminInputFields.forEach((field) => {
                inputs[employee.employeeId][field.key] = adminInputs[employee.employeeId]?.[field.key] ?? 0
            })
        })
        return inputs
    }

    const handleCalculatePayroll = async (): Promise<void> => {
        if (hasAdminInputs) {
            const validationErrors = validateAdminInputs(
                activeEmployees.map((employee) => employee.employeeId),
                adminInputFields,
            )
            if (validationErrors.length > 0) {
                setErrors(validationErrors)
                return
            }
        }
        setErrors([])

        const request: CalculatePayrollDto = { clientId: selectedClientId, payrollMonth }
        if (hasAdminInputs) request.adminInputs = buildAdminInputs()

        try {
            await calculatePayroll(request)
            setFinalizeResult(null)
            setCurrentStep(FINALIZE_STEP)
        } catch {
            // the hook already shows the error toast
        }
    }

    const handleReviewContinue = (): void => {
        if (hasAdminInputs) {
            setCurrentStep(ADMIN_INPUT_STEP)
            return
        }
        void handleCalculatePayroll()
    }

    const handleFinalizePayroll = async (): Promise<void> => {
        setShowFinalizeDialog(false)
        if (!calculationResult) return
        try {
            const result = await finalizePayroll({
                clientId: selectedClientId,
                payrollMonth,
                adminInputs: hasAdminInputs ? buildAdminInputs() : undefined,
                force: isRecalculating ? true : undefined,
            })
            setFinalizeResult(result.data)
        } catch {
            // the hook already shows the error toast
        }
    }

    const handleReset = (): void => {
        setCurrentStep(1)
        setSelectedClientId("")
        setSelectedMonth(new Date())
        setErrors([])
        setEmployees([])
        setAttendedEmployeeIds(null)
        setIsRecalculating(false)
        setFinalizeResult(null)
        setExistingPayroll(null)
        setShowExistingPayrollDialog(false)
        setShowRecalculateDialog(false)
        setShowFinalizeDialog(false)
        resetCalculation()
        resetInputs()
    }

    const renderRowStatus = (record: PayrollRecord, salary: SalaryFigures): JSX.Element => {
        if (isFinalized) {
            return skippedIds.has(record.employeeId) ? (
                <Badge variant="destructive">Skipped</Badge>
            ) : (
                <Badge variant="success">
                    <CheckCircle className="h-3 w-3" />
                    Finalized
                </Badge>
            )
        }
        if (record.error) return <Badge variant="destructive" title={record.error}>Error</Badge>
        if (record.hasAttendance === false) return <Badge variant="warning">No attendance</Badge>
        if (salary.netSalary <= 0) return <Badge variant="warning">Zero pay</Badge>
        return <Badge variant="outline">Ready</Badge>
    }

    const finalizedMissing = finalizeResult?.missingAttendance ?? []
    const uploadAttendanceButton = (
        <Button variant="outline" size="sm" onClick={() => router.push("/attendance/upload")}>
            <Upload className="h-4 w-4 mr-2" />
            Upload attendance
        </Button>
    )

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

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const completed = isFinalized || step.id < currentStep
                            const current = !isFinalized && step.id === currentStep
                            return (
                                <div key={step.id} className="flex items-center">
                                    <div className="flex items-center">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center font-mono text-[13px] font-semibold ${
                                                completed
                                                    ? "text-success"
                                                    : current
                                                        ? "border-b-2 border-brand text-brand"
                                                        : "text-muted-foreground"
                                            }`}
                                        >
                                            {completed ? <CheckCircle className="h-4 w-4" /> : String(index + 1).padStart(2, "0")}
                                        </div>
                                        <div className="ml-3">
                                            <p
                                                className={`text-sm font-medium ${
                                                    current ? "text-brand" : completed ? "text-success" : "text-foreground"
                                                }`}
                                            >
                                                {step.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{step.description}</p>
                                        </div>
                                    </div>
                                    {index < steps.length - 1 && <div className="ml-6 h-px w-16 bg-border" />}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

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

            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Select client and month
                        </CardTitle>
                        <CardDescription>Choose the client and the month you want to pay</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="client">Client</Label>
                                <Combobox
                                    id="client"
                                    options={clients.map((client) => ({ value: client.id ?? "", label: client.name }))}
                                    value={selectedClientId}
                                    onChange={setSelectedClientId}
                                    placeholder={clientsLoading ? "Loading clients..." : "Select a client"}
                                    searchPlaceholder="Search clients..."
                                    emptyText="No clients found."
                                    disabled={clientsLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Payroll Month</Label>
                                    {checkingPayroll && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                    {!checkingPayroll && existingPayroll && (
                                        <Badge variant="success">
                                            <CheckCircle className="h-3 w-3" />
                                            Finalized
                                        </Badge>
                                    )}
                                    {!checkingPayroll && !existingPayroll && selectedClientId && (
                                        <Badge variant="outline" className="text-muted-foreground">
                                            Not finalized
                                        </Badge>
                                    )}
                                </div>
                                <MonthPicker value={selectedMonth} onChange={(date) => date && setSelectedMonth(date)} />
                            </div>
                        </div>

                        {existingPayroll && !checkingPayroll && (
                            <Alert variant="warning">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="font-medium">Payroll is already finalized for {monthLabel}</p>
                                            <p className="text-sm">
                                                {existingPayroll.finalizedAt ? `Finalized on ${formatDateTime(existingPayroll.finalizedAt)} • ` : ""}
                                                {existingPayroll.totalEmployees} employees • Net pay {formatMoney(existingPayroll.totalNetSalary)}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={handleViewExistingPayroll}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => setShowRecalculateDialog(true)}>
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
                            disabled={!selectedClientId || clientsLoading || checkingPayroll || reviewLoading}
                            className="w-full"
                            type="button"
                        >
                            {checkingPayroll || reviewLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {checkingPayroll ? "Checking..." : "Loading..."}
                                </>
                            ) : existingPayroll ? (
                                <>
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Existing Payroll
                                </>
                            ) : (
                                <>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Continue to Review
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {currentStep === 2 && selectedClient && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Review
                        </CardTitle>
                        <CardDescription>
                            {selectedClient.name} • {monthLabel}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatTile label="Employees to be paid" value={activeEmployees.length} />
                            <StatTile
                                label={`With attendance for ${monthLabel}`}
                                value={attendanceUnknown ? "-" : attendedCount}
                                hint={attendanceUnknown ? "Could not check attendance" : `${coverage}% of employees`}
                                tone={attendanceUnknown || activeEmployees.length === 0 ? "default" : coverage === 100 ? "success" : coverage < 50 ? "destructive" : "warning"}
                            />
                            <StatTile
                                label="No attendance"
                                value={attendanceUnknown ? "-" : missingAttendanceEmployees.length}
                                tone={missingAttendanceEmployees.length > 0 ? "warning" : "default"}
                            />
                        </div>

                        {activeEmployees.length === 0 ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>No active employees are linked to this client, so there is nothing to pay.</AlertDescription>
                            </Alert>
                        ) : attendanceUnknown ? (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Could not check attendance for {monthLabel}. You can continue, but anyone without attendance will be paid {formatMoney(0)}.
                                </AlertDescription>
                            </Alert>
                        ) : missingAttendanceEmployees.length === 0 ? (
                            <Alert variant="success">
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>Attendance is in for all {activeEmployees.length} employees.</AlertDescription>
                            </Alert>
                        ) : (
                            <Alert variant={coverage < 50 ? "destructive" : "warning"}>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>{coverage < 50 ? "Most employees have no attendance" : "Some employees have no attendance"}</AlertTitle>
                                <AlertDescription>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <p>
                                            {missingAttendanceEmployees.length} of {activeEmployees.length} employees have no attendance for {monthLabel} and will not be paid until it is uploaded. Upload their attendance first unless this is expected.
                                        </p>
                                        {uploadAttendanceButton}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {missingAttendanceEmployees.length > 0 && (
                            <EmployeeList
                                title={`Employees with no attendance (${missingAttendanceEmployees.length})`}
                                employees={missingAttendanceEmployees.map((employee) => ({
                                    employeeId: employee.employeeId,
                                    name: employeeName(employee),
                                }))}
                            />
                        )}

                        {hasAdminInputs && (
                            <div>
                                <h3 className="text-sm font-medium mb-2">This client needs admin input for</h3>
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
                            <Button variant="brand" onClick={handleReviewContinue} disabled={isCalculating || activeEmployees.length === 0}>
                                {isCalculating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Calculating...
                                    </>
                                ) : hasAdminInputs ? (
                                    "Continue to Admin Input"
                                ) : (
                                    "Calculate Payroll"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === ADMIN_INPUT_STEP && hasAdminInputs && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calculator className="h-5 w-5" />
                            Admin input
                        </CardTitle>
                        <CardDescription>Fill in the extra fields this client needs. Leave a field empty to use 0.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-6">
                            {activeEmployees.map((employee) => (
                                <div key={employee.employeeId} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold">{employeeName(employee)}</h3>
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
                                {isCalculating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Calculating...
                                    </>
                                ) : (
                                    "Calculate Payroll"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === FINALIZE_STEP && calculationResult && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            {isFinalized ? "Payroll finalized" : "Review and finalize"}
                        </CardTitle>
                        <CardDescription>
                            {calculationResult.data.clientName} • {monthLabel}
                            {isFinalized ? "" : " • Check the figures below, then finalize to save them"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {finalizeResult && (
                            <>
                                <Alert variant="success">
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertTitle>Payroll finalized</AlertTitle>
                                    <AlertDescription>
                                        {finalizeResult.finalized} salary records saved for {calculationResult.data.clientName}, {monthLabel}.
                                    </AlertDescription>
                                </Alert>
                                {skippedIds.size > 0 && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>{skippedIds.size} employees were skipped</AlertTitle>
                                        <AlertDescription className="space-y-3">
                                            <p>Their salary could not be calculated, so no record was saved for them.</p>
                                            <EmployeeList
                                                title="Skipped employees"
                                                employees={finalizeResult.skipped.map((id) => ({ employeeId: id, name: nameFor(id) }))}
                                            />
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {finalizedMissing.length > 0 && (
                                    <Alert variant="warning">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>{finalizedMissing.length} employees had no attendance</AlertTitle>
                                        <AlertDescription className="space-y-3">
                                            <p>They were skipped for {monthLabel} and have no salary record. Upload their attendance and recalculate to include them.</p>
                                            <EmployeeList
                                                title="Employees with no attendance"
                                                employees={finalizedMissing.map((id) => ({ employeeId: id, name: nameFor(id) }))}
                                            />
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                            <StatTile
                                label="Employees"
                                value={calculationResult.data.totalEmployees}
                                hint={excludedNotActive > 0 ? `${excludedNotActive} not active this month` : undefined}
                            />
                            <StatTile label="Total gross" value={formatMoney(totals.grossSalary)} />
                            <StatTile label="Total net" value={formatMoney(totals.netSalary)} tone="brand" />
                            <StatTile label="Zero pay" value={zeroPayCount} tone={zeroPayCount > 0 ? "warning" : "default"} />
                            <StatTile
                                label="No attendance"
                                value={calculatedMissingAttendance.length}
                                tone={calculatedMissingAttendance.length > 0 ? "warning" : "default"}
                            />
                        </div>

                        {!isFinalized && zeroPayCount > 0 && (
                            <Alert variant={zeroPayCount === results.length ? "destructive" : "warning"}>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>
                                    {zeroPayCount === results.length ? "Every employee has zero pay" : `${zeroPayCount} employees have zero pay`}
                                </AlertTitle>
                                <AlertDescription>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <p>
                                            {calculatedMissingAttendance.length > 0
                                                ? `${calculatedMissingAttendance.length} of them have no attendance for ${monthLabel}. `
                                                : ""}
                                            Employees without attendance are skipped. Employees marked with 0 days are saved with {formatMoney(0)}. Upload attendance and recalculate if this is not expected.
                                        </p>
                                        {calculatedMissingAttendance.length > 0 && uploadAttendanceButton}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        <Separator />

                        <div className="rounded-md border overflow-x-auto scrollbar-sleek">
                            <Table className="min-w-[1200px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Present Days</TableHead>
                                        <TableHead className="text-right">Rate / Day</TableHead>
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
                                    {figures.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={11} className="text-center text-muted-foreground">
                                                No employees were calculated for this month.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {figures.map(({ record, salary }) => (
                                        <TableRow key={record.employeeId}>
                                            <TableCell>
                                                <p className="font-medium">{nameFor(record.employeeId)}</p>
                                                <p className="font-mono text-xs text-muted-foreground">{record.employeeId}</p>
                                            </TableCell>
                                            <TableCell>
                                                {salary.category ? (
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {label.salaryCategory(salary.category)}
                                                        </Badge>
                                                        {salary.subCategory && (
                                                            <span className="text-xs text-muted-foreground">{label.salarySubCategory(salary.subCategory)}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-[13px]">{record.error ? "-" : record.presentDays ?? 0}</TableCell>
                                            <TableCell className="text-right font-mono text-[13px]">{formatMoney(salary.ratePerDay)}</TableCell>
                                            <TableCell className="text-right font-mono text-[13px]">{formatMoney(salary.basicPay)}</TableCell>
                                            <TableCell className="text-right font-mono text-[13px]">{formatMoney(salary.grossSalary)}</TableCell>
                                            <TableCell className="text-right font-mono text-[13px]">
                                                {salary.pfEnabled === false ? <span className="text-xs text-muted-foreground">Not enabled</span> : formatMoney(salary.pf)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-[13px]">
                                                {salary.esicEnabled === false ? <span className="text-xs text-muted-foreground">Not enabled</span> : formatMoney(salary.esic)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-[13px]">{formatMoney(salary.totalDeductions)}</TableCell>
                                            <TableCell className={`text-right font-mono text-[13px] font-semibold ${salary.netSalary <= 0 ? "text-warning" : ""}`}>
                                                {formatMoney(salary.netSalary)}
                                            </TableCell>
                                            <TableCell>{renderRowStatus(record, salary)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                {figures.length > 0 && (
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell colSpan={2}>Total ({figures.length} employees)</TableCell>
                                            <TableCell />
                                            <TableCell />
                                            <TableCell className="text-right font-mono text-[13px]">{formatMoney(totals.basicPay)}</TableCell>
                                            <TableCell className="text-right font-mono text-[13px]">{formatMoney(totals.grossSalary)}</TableCell>
                                            <TableCell className="text-right font-mono text-[13px]">{formatMoney(totals.pf)}</TableCell>
                                            <TableCell className="text-right font-mono text-[13px]">{formatMoney(totals.esic)}</TableCell>
                                            <TableCell className="text-right font-mono text-[13px]">{formatMoney(totals.totalDeductions)}</TableCell>
                                            <TableCell className="text-right font-mono text-[13px] font-semibold">{formatMoney(totals.netSalary)}</TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </TableFooter>
                                )}
                            </Table>
                        </div>

                        <div className="flex justify-between">
                            {isFinalized ? (
                                <>
                                    <Button variant="outline" onClick={handleReset}>
                                        Run another payroll
                                    </Button>
                                    <Button variant="brand" onClick={() => router.push(reportsUrl)}>
                                        <FileText className="h-4 w-4 mr-2" />
                                        Open report and payslips
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" onClick={() => setCurrentStep(hasAdminInputs ? ADMIN_INPUT_STEP : 2)}>
                                        Back
                                    </Button>
                                    <Button variant="brand" onClick={() => setShowFinalizeDialog(true)} disabled={isFinalizing || figures.length === 0}>
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

            <Dialog open={showExistingPayrollDialog} onOpenChange={setShowExistingPayrollDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Payroll already finalized
                        </DialogTitle>
                        <DialogDescription>
                            {clientName} already has a finalized payroll for {monthLabel}.
                        </DialogDescription>
                    </DialogHeader>

                    {existingPayroll && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <StatTile label="Employees" value={existingPayroll.totalEmployees} compact />
                                <StatTile label="Net pay" value={formatMoney(existingPayroll.totalNetSalary)} tone="brand" compact />
                                <StatTile label="Gross pay" value={formatMoney(existingPayroll.totalGrossSalary)} compact />
                            </div>

                            {existingPayroll.finalizedAt && (
                                <div className="p-4 rounded-md border bg-surface">
                                    <p className="text-sm text-muted-foreground mb-1">Finalized on</p>
                                    <p className="font-medium">{formatDateTime(existingPayroll.finalizedAt)}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setShowExistingPayrollDialog(false)} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button variant="outline" onClick={handleViewExistingPayroll} className="w-full sm:w-auto">
                            <Eye className="h-4 w-4 mr-2" />
                            View in Reports
                        </Button>
                        <Button onClick={() => setShowRecalculateDialog(true)} className="w-full sm:w-auto">
                            <Calculator className="h-4 w-4 mr-2" />
                            Recalculate Anyway
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showRecalculateDialog} onOpenChange={setShowRecalculateDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-warning" />
                            Recalculate this payroll?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to recalculate payroll for <strong>{clientName}</strong>, <strong>{monthLabel}</strong>. When you finalize, the
                            new figures replace the payroll that is already saved for this month.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRecalculate}>Yes, recalculate</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
                <AlertDialogContent className="max-w-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-brand" />
                            Finalize payroll for {monthLabel}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This saves the salary records for {clientName}. Reports and payslips will use these figures
                            {isRecalculating ? ", replacing the payroll already saved for this month" : ""}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <StatTile label="Employees" value={calculationResult?.data.totalEmployees ?? figures.length} compact />
                        <StatTile label="Total gross" value={formatMoney(totals.grossSalary)} compact />
                        <StatTile label="Total net" value={formatMoney(totals.netSalary)} tone="brand" compact />
                        <StatTile label="Zero pay" value={zeroPayCount} tone={zeroPayCount > 0 ? "warning" : "default"} compact />
                        <StatTile
                            label="No attendance"
                            value={calculatedMissingAttendance.length}
                            tone={calculatedMissingAttendance.length > 0 ? "warning" : "default"}
                            compact
                        />
                    </div>
                    {zeroPayCount > 0 && (
                        <p className="text-sm text-warning">
                            {missingAttendanceEmployees.length} {missingAttendanceEmployees.length === 1 ? "employee" : "employees"} without attendance will be skipped. {zeroPayCount - missingAttendanceEmployees.length} marked with 0 days will be saved with {formatMoney(0)}.
                        </p>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFinalizePayroll}>Yes, finalize</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default function CalculatePayroll(): JSX.Element {
    return (
        <Suspense fallback={null}>
            <CalculatePayrollContent />
        </Suspense>
    )
}

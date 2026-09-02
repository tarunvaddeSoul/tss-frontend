"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import {
  CheckCircle2,
  Upload,
  Users,
  Calendar,
  Building2,
  FileText,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  Info,
  Clock,
  RotateCcw,
  Download,
  BarChart3,
  FolderOpen,
  Calculator,
} from "lucide-react"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InlineLoader } from "@/components/ui/loader"
import { Combobox } from "@/components/ui/combobox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MonthPicker } from "@/components/ui/month-picker"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { PageHeader } from "@/components/layout/page-header"
import { employeeName, formatDateTime } from "@/lib/labels"

import api, { getErrorMessage } from "@/services/api"
import { attendanceService } from "@/services/attendanceService"
import { attendanceSheetService } from "@/services/attendanceSheetService"
import { clientService } from "@/services/clientService"
import type { Client } from "@/types/client"
import type { BulkMarkAttendanceDto, ActiveEmployee } from "@/types/attendance"

import { ConfirmDialog } from "./wizard/confirm-dialog"
import { EmployeeAttendanceStep } from "./wizard/employee-attendance-step"
import { FileDropZone } from "./wizard/file-drop-zone"
import { parseAttendanceExcel } from "./wizard/parse-attendance-excel"
import type { AttendanceEntry, ExistingAttendanceRecord } from "./wizard/types"

const daysInMonth = (month: Date): number => new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()

const SHEET_ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
const SHEET_ACCEPTED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"]
const MAX_LISTED_PROBLEMS = 10

const STEP_CLIENT = 0
const STEP_MONTH = 1
const STEP_EXCEL = 2
const STEP_MARK = 3
const STEP_SHEET = 4
const STEP_REVIEW = 5
const STEP_DONE = 6

const formSchema = z
  .object({
    clientId: z.string().min(1, "Please select a client"),
    month: z.date({ required_error: "Please select a month" }),
    employees: z
      .array(
        z.object({
          employeeId: z.string(),
          selected: z.boolean(),
          presentCount: z.number().min(0, "Present count cannot be negative"),
        }),
      )
      .optional(),
    attendanceFile: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.month || !data.employees) return
    const maxDays = daysInMonth(data.month)
    data.employees.forEach((emp, index) => {
      if (emp.selected && emp.presentCount > maxDays) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Present count cannot exceed ${maxDays} for ${format(data.month, "MMMM yyyy")}`,
          path: ["employees", index, "presentCount"],
        })
      }
    })
  })

type FormValues = z.infer<typeof formSchema>

interface StepStatus {
  step: number
  title: string
  description: string
  status: "pending" | "current" | "completed"
}

interface SubmissionResult {
  created: number
  fileUploaded: boolean
  uploadError: string | null
  timestamp: Date
}

interface RawAttendanceRecord {
  employeeID?: string
  employeeId?: string
  employeeName?: string
  presentCount?: number
  designationName?: string
  departmentName?: string
}

const STEP_META: Array<Pick<StepStatus, "title" | "description">> = [
  { title: "Select Client", description: "Choose the client or site" },
  { title: "Select Month", description: "Choose the attendance month" },
  { title: "Upload Excel (Optional)", description: "Fill present days from a spreadsheet" },
  { title: "Mark Attendance", description: "Select employees and enter present days" },
  { title: "Attach Sheet (Optional)", description: "Attach the signed attendance sheet" },
  { title: "Review & Submit", description: "Check the totals and save" },
  { title: "Done", description: "Attendance saved" },
]

function previewTypeForUrl(url: string): "pdf" | "image" {
  return /\.pdf(\?|$)/i.test(url) ? "pdf" : "image"
}

async function fetchExistingAttendance(clientId: string, month: string): Promise<ExistingAttendanceRecord[]> {
  try {
    const response = await api.get<{ data?: RawAttendanceRecord[] }>("/attendance/records-by-client-and-month", {
      params: { clientId, month },
      skipErrorToast: true,
    } as Parameters<typeof api.get>[1])
    const records = Array.isArray(response.data?.data) ? response.data.data : []
    return records.flatMap((record) => {
      const employeeId = record.employeeID ?? record.employeeId
      if (!employeeId || typeof record.presentCount !== "number") return []
      return [
        {
          employeeId,
          employeeName: record.employeeName ?? employeeId,
          presentCount: record.presentCount,
          designation: record.designationName,
          department: record.departmentName,
        },
      ]
    })
  } catch {
    return []
  }
}

export function MarkAttendanceBySite(): JSX.Element {
  const [currentStep, setCurrentStep] = useState(STEP_CLIENT)
  const [clients, setClients] = useState<Client[]>([])
  const [clientsLoading, setClientsLoading] = useState(false)
  const [employees, setEmployees] = useState<ActiveEmployee[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)
  const [existingRecords, setExistingRecords] = useState<ExistingAttendanceRecord[]>([])
  const [dirty, setDirty] = useState(false)

  const [sheetUrl, setSheetUrl] = useState<string | null>(null)
  const [sheetLoading, setSheetLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<"pdf" | "image">("pdf")

  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [excelValidating, setExcelValidating] = useState(false)
  const [excelUploading, setExcelUploading] = useState(false)
  const [excelErrors, setExcelErrors] = useState<string[]>([])
  const [excelWarnings, setExcelWarnings] = useState<string[]>([])
  const [excelLoadedCount, setExcelLoadedCount] = useState<number | null>(null)
  const [excelCopySaved, setExcelCopySaved] = useState(false)
  const [existingExcelFile, setExistingExcelFile] = useState<string | null>(null)
  const [checkingExcelFile, setCheckingExcelFile] = useState(false)
  const [excelPreviewOpen, setExcelPreviewOpen] = useState(false)

  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const [zeroDaysConfirmOpen, setZeroDaysConfirmOpen] = useState(false)
  const [showOnlyZero, setShowOnlyZero] = useState(false)

  const topRef = useRef<HTMLDivElement>(null)
  const loadKeyRef = useRef<string | null>(null)

  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { clientId: "", month: undefined, employees: [], attendanceFile: undefined },
    mode: "onSubmit",
  })

  const steps: StepStatus[] = STEP_META.map((meta, step) => ({
    step,
    ...meta,
    status: currentStep === step ? "current" : currentStep > step ? "completed" : "pending",
  }))
  const progress = (currentStep / (steps.length - 1)) * 100

  const selectedClientId = form.watch("clientId")
  const selectedMonth = form.watch("month")
  const attendanceFile = form.watch("attendanceFile") as File | undefined
  const formEmployees = form.watch("employees") ?? []
  const selectedClient = clients.find((c) => c.id === selectedClientId)
  const maxDays = selectedMonth ? daysInMonth(selectedMonth) : 31
  const monthString = selectedMonth ? format(selectedMonth, "yyyy-MM") : ""
  const monthLabel = selectedMonth ? format(selectedMonth, "MMMM yyyy") : ""

  const entriesById = useMemo(() => new Map(formEmployees.map((entry) => [entry.employeeId, entry])), [formEmployees])
  const existingById = useMemo(() => new Map(existingRecords.map((record) => [record.employeeId, record])), [existingRecords])
  const employeesById = useMemo(() => new Map(employees.map((employee) => [employee.id, employee])), [employees])
  const selectedEntries = useMemo(() => formEmployees.filter((entry) => entry.selected), [formEmployees])
  const reviewStats = useMemo(
    () => ({
      employees: selectedEntries.length,
      totalDays: selectedEntries.reduce((sum, entry) => sum + entry.presentCount, 0),
      zeroDays: selectedEntries.filter((entry) => entry.presentCount === 0).length,
      overwrites: selectedEntries.filter((entry) => existingById.has(entry.employeeId)).length,
    }),
    [selectedEntries, existingById],
  )
  const mostlyZero = reviewStats.employees > 0 && reviewStats.zeroDays * 2 > reviewStats.employees

  const reportHref = selectedClientId && monthString ? `/attendance/reports?clientId=${selectedClientId}&month=${monthString}` : "/attendance/reports"
  const recordsHref = selectedClientId && monthString ? `/attendance/records?clientId=${selectedClientId}&month=${monthString}` : "/attendance/records"
  const payrollHref = selectedClientId && monthString ? `/payroll/calculate?clientId=${selectedClientId}&month=${monthString}` : "/payroll/calculate"

  useEffect(() => {
    void fetchClients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    topRef.current?.scrollIntoView({ block: "start" })
  }, [currentStep])

  const fetchClients = async (): Promise<void> => {
    try {
      setClientsLoading(true)
      setErrors([])
      const allClients = await clientService.getAllClients()
      if (allClients.length === 0) {
        setErrors(["No clients found. Please add a client first."])
        return
      }
      setClients(allClients)
    } catch (error) {
      setErrors([getErrorMessage(error)])
    } finally {
      setClientsLoading(false)
    }
  }

  const setEntries = (entries: AttendanceEntry[], markDirty: boolean): void => {
    form.setValue("employees", entries)
    if (markDirty) setDirty(true)
  }

  const resetExcelState = (): void => {
    setExcelFile(null)
    setExcelErrors([])
    setExcelWarnings([])
    setExcelLoadedCount(null)
    setExcelCopySaved(false)
  }

  const refreshAttachments = async (clientId: string, month: string): Promise<void> => {
    setSheetLoading(true)
    setCheckingExcelFile(true)
    const [sheet, excel] = await Promise.allSettled([
      attendanceSheetService.get(clientId, month),
      attendanceService.getAttendanceExcelFiles({ clientId, month }),
    ])
    if (loadKeyRef.current !== `${clientId}|${month}`) return
    setSheetUrl(sheet.status === "fulfilled" ? sheet.value.data?.attendanceSheetUrl ?? null : null)
    const excelData = excel.status === "fulfilled" ? excel.value.data : null
    setExistingExcelFile(excelData && !Array.isArray(excelData) ? excelData.attendanceExcelUrl : null)
    setSheetLoading(false)
    setCheckingExcelFile(false)
  }

  const loadMonthData = async (clientId: string, month: Date): Promise<void> => {
    const monthKey = format(month, "yyyy-MM")
    const loadKey = `${clientId}|${monthKey}`
    loadKeyRef.current = loadKey

    setLoading(true)
    setErrors([])
    setDirty(false)
    setEmployees([])
    setExistingRecords([])
    setSheetUrl(null)
    setExistingExcelFile(null)
    resetExcelState()
    form.setValue("employees", [])
    form.setValue("attendanceFile", undefined)

    void refreshAttachments(clientId, monthKey)

    try {
      const [employeesResponse, existing] = await Promise.all([
        attendanceService.getActiveEmployeesForMonth(clientId, monthKey),
        fetchExistingAttendance(clientId, monthKey),
      ])
      if (loadKeyRef.current !== loadKey) return

      const activeEmployees = employeesResponse.data?.employees ?? []
      const existingMap = new Map(existing.map((record) => [record.employeeId, record]))
      setEmployees(activeEmployees)
      setExistingRecords(existing)
      form.setValue(
        "employees",
        activeEmployees.map((employee) => {
          const saved = existingMap.get(employee.id)
          return { employeeId: employee.id, selected: !!saved, presentCount: saved?.presentCount ?? 0 }
        }),
      )
    } catch (error) {
      if (loadKeyRef.current !== loadKey) return
      setErrors([getErrorMessage(error)])
    } finally {
      if (loadKeyRef.current === loadKey) setLoading(false)
    }
  }

  const handleClientChange = (clientId: string): void => {
    form.setValue("clientId", clientId)
    setErrors([])
    const month = form.getValues("month")
    if (clientId && month) {
      void loadMonthData(clientId, month)
    } else {
      setEmployees([])
      setExistingRecords([])
      form.setValue("employees", [])
    }
  }

  const handleMonthChange = (month: Date): void => {
    form.setValue("month", month)
    setErrors([])
    const clientId = form.getValues("clientId")
    if (clientId) void loadMonthData(clientId, month)
  }

  const handleEmployeeSelection = (employeeId: string, selected: boolean): void => {
    setEntries(
      (form.getValues("employees") ?? []).map((entry) => (entry.employeeId === employeeId ? { ...entry, selected } : entry)),
      true,
    )
  }

  const handlePresentCountChange = (employeeId: string, presentCount: number): void => {
    const validCount = Math.min(maxDays, Math.max(0, presentCount))
    setEntries(
      (form.getValues("employees") ?? []).map((entry) =>
        entry.employeeId === employeeId ? { ...entry, presentCount: validCount, selected: true } : entry,
      ),
      true,
    )
  }

  const handleSelectMany = (employeeIds: string[], selected: boolean): void => {
    const ids = new Set(employeeIds)
    setEntries(
      (form.getValues("employees") ?? []).map((entry) => (ids.has(entry.employeeId) ? { ...entry, selected } : entry)),
      true,
    )
  }

  const handleFillSelected = (presentCount: number): void => {
    setEntries(
      (form.getValues("employees") ?? []).map((entry) => (entry.selected ? { ...entry, presentCount } : entry)),
      true,
    )
  }

  const validateCurrentStep = (): boolean => {
    setErrors([])
    switch (currentStep) {
      case STEP_CLIENT:
        if (!form.getValues("clientId")) {
          setErrors(["Please select a client to continue."])
          return false
        }
        return true
      case STEP_MONTH:
        if (!form.getValues("month")) {
          setErrors(["Please select a month to continue."])
          return false
        }
        return true
      case STEP_MARK: {
        const selected = (form.getValues("employees") ?? []).filter((entry) => entry.selected)
        if (selected.length === 0) {
          setErrors(["Select at least one employee to continue."])
          return false
        }
        if (selected.some((entry) => entry.presentCount < 0 || entry.presentCount > maxDays)) {
          setErrors([`Present days must be between 0 and ${maxDays} for ${monthLabel}.`])
          return false
        }
        return true
      }
      default:
        return true
    }
  }

  const nextStep = (): void => {
    if (isSubmitted || !validateCurrentStep()) return
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1)
  }

  const prevStep = (): void => {
    if (isSubmitted || currentStep === 0) return
    setErrors([])
    setCurrentStep(currentStep - 1)
  }

  const requestSubmit = (): void => {
    if (submitting || isSubmitted) return
    if (mostlyZero) {
      setZeroDaysConfirmOpen(true)
      return
    }
    void form.handleSubmit(onSubmit)()
  }

  const onSubmit = async (data: FormValues): Promise<void> => {
    if (currentStep !== STEP_REVIEW || isSubmitted || submitting) return

    const selectedEmployeesData = (data.employees ?? []).filter((entry) => entry.selected)
    if (selectedEmployeesData.length === 0) {
      setErrors(["Select at least one employee before submitting."])
      return
    }

    const month = format(data.month, "yyyy-MM")
    const bulkData: BulkMarkAttendanceDto = {
      records: selectedEmployeesData.map((entry) => ({
        employeeId: entry.employeeId,
        clientId: data.clientId,
        month,
        presentCount: entry.presentCount,
      })),
    }

    try {
      setSubmitting(true)
      setErrors([])
      await attendanceService.bulkMarkAttendance(bulkData)

      let fileUploaded = false
      let uploadError: string | null = null
      if (data.attendanceFile) {
        try {
          await attendanceService.uploadAttendanceSheet({ clientId: data.clientId, month }, data.attendanceFile)
          fileUploaded = true
        } catch (error) {
          uploadError = getErrorMessage(error)
        }
      }

      setSubmissionResult({ created: selectedEmployeesData.length, fileUploaded, uploadError, timestamp: new Date() })
      setIsSubmitted(true)
      setDirty(false)
      setCurrentStep(STEP_DONE)
      void refreshAttachments(data.clientId, month)

      toast({
        variant: "success",
        title: `Attendance saved for ${selectedEmployeesData.length} ${selectedEmployeesData.length === 1 ? "employee" : "employees"}`,
        description: `${selectedClient?.name ?? "Client"}, ${format(data.month, "MMMM yyyy")}`,
      })
      if (uploadError) {
        toast({
          variant: "destructive",
          title: "Attendance saved, but the sheet was not attached",
          description: uploadError,
        })
      }
    } catch (error) {
      const message = getErrorMessage(error)
      setErrors([`Nothing was saved. ${message}`])
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = (): void => {
    loadKeyRef.current = null
    setCurrentStep(STEP_CLIENT)
    setEmployees([])
    setExistingRecords([])
    setErrors([])
    setIsSubmitted(false)
    setSubmissionResult(null)
    setDirty(false)
    setSheetUrl(null)
    setSheetLoading(false)
    setCheckingExcelFile(false)
    setPreviewOpen(false)
    setPreviewUrl(null)
    setExistingExcelFile(null)
    setShowOnlyZero(false)
    resetExcelState()
    form.reset({ clientId: "", month: undefined, employees: [], attendanceFile: undefined })
  }

  const guardedNavigate = (href: string): void => {
    if (dirty && !isSubmitted) {
      setPendingHref(href)
      return
    }
    router.push(href)
  }

  const openSheetPreview = (url: string): void => {
    setPreviewUrl(url)
    setPreviewType(previewTypeForUrl(url))
    setPreviewOpen(true)
  }

  const generateExcelTemplate = (): void => {
    if (!selectedClient || !selectedMonth || employees.length === 0) return
    try {
      const wb = XLSX.utils.book_new()
      const rows: Array<Array<string | number>> = [
        ["Employee ID", "Employee Name", "Present Days"],
        ...employees.map((employee) => {
          const saved = existingById.get(employee.id)
          return [employee.id, employeeName(employee), saved ? saved.presentCount : ""]
        }),
      ]
      const ws = XLSX.utils.aoa_to_sheet(rows)
      ws["!cols"] = [{ wch: 15 }, { wch: 30 }, { wch: 14 }]
      XLSX.utils.book_append_sheet(wb, ws, "Attendance")
      XLSX.writeFile(wb, `Attendance_${selectedClient.name}_${format(selectedMonth, "yyyy-MM")}.xlsx`)
    } catch {
      toast({ variant: "destructive", title: "Could not create the template", description: "Please try again." })
    }
  }

  const handleExcelFileChange = async (file: File | null): Promise<void> => {
    resetExcelState()
    setExcelFile(file)
    if (!file || !selectedClient?.id || !selectedMonth) return

    setExcelValidating(true)
    const parsed = await parseAttendanceExcel(file, maxDays)
    setExcelValidating(false)

    if (!parsed.ok) {
      setExcelErrors([parsed.error])
      return
    }

    const warnings: string[] = []
    const matched = parsed.data.rows.filter((row) => employeesById.has(row.employeeId))
    const unknownRows = parsed.data.rows.filter((row) => !employeesById.has(row.employeeId))

    if (matched.length === 0) {
      setExcelErrors([
        parsed.data.rows.length === 0
          ? "Every row was skipped, so nothing could be loaded. Fill in the Present Days column and upload again."
          : "None of the employee IDs in this sheet are active for this client and month. Download a fresh template to get the right IDs.",
      ])
      if (parsed.data.problems.length > 0) {
        setExcelWarnings(parsed.data.problems.slice(0, MAX_LISTED_PROBLEMS))
      }
      return
    }

    if (parsed.data.skippedBlank > 0) {
      warnings.push(`${parsed.data.skippedBlank} ${parsed.data.skippedBlank === 1 ? "row has" : "rows have"} no present days and ${parsed.data.skippedBlank === 1 ? "was" : "were"} skipped.`)
    }
    if (unknownRows.length > 0) {
      const sample = unknownRows.slice(0, 5).map((row) => row.employeeName || row.employeeId).join(", ")
      warnings.push(`${unknownRows.length} ${unknownRows.length === 1 ? "employee" : "employees"} in the sheet ${unknownRows.length === 1 ? "is" : "are"} not active here this month and ${unknownRows.length === 1 ? "was" : "were"} skipped: ${sample}${unknownRows.length > 5 ? ` and ${unknownRows.length - 5} more` : ""}.`)
    }
    const listedProblems = parsed.data.problems.slice(0, MAX_LISTED_PROBLEMS)
    warnings.push(...listedProblems)
    if (parsed.data.problems.length > MAX_LISTED_PROBLEMS) {
      warnings.push(`and ${parsed.data.problems.length - MAX_LISTED_PROBLEMS} more rows with problems.`)
    }
    const matchedIds = new Set(matched.map((row) => row.employeeId))
    const missing = employees.length - matchedIds.size
    if (missing > 0) {
      warnings.push(`${missing} active ${missing === 1 ? "employee is" : "employees are"} not in the sheet. Their present days are unchanged.`)
    }

    const byId = new Map(matched.map((row) => [row.employeeId, row.presentDays]))
    setEntries(
      (form.getValues("employees") ?? []).map((entry) => {
        const fromExcel = byId.get(entry.employeeId)
        return fromExcel === undefined ? entry : { ...entry, selected: true, presentCount: fromExcel }
      }),
      true,
    )
    setExcelLoadedCount(matched.length)

    try {
      setExcelUploading(true)
      await attendanceService.uploadAttendanceExcel({ clientId: selectedClient.id, month: monthString }, file)
      setExcelCopySaved(true)
    } catch (error) {
      warnings.push(`The present days were loaded, but a copy of the file could not be saved: ${getErrorMessage(error)}`)
    } finally {
      setExcelUploading(false)
    }
    setExcelWarnings(warnings)
  }

  const handleSheetFileChange = (file: File | null): void => {
    if (!file) {
      form.setValue("attendanceFile", undefined)
      return
    }
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
    if (!SHEET_ACCEPTED_TYPES.includes(file.type) && !SHEET_ACCEPTED_EXTENSIONS.includes(ext)) {
      setErrors(["Please choose a PDF, JPG, JPEG or PNG file for the attendance sheet."])
      return
    }
    setErrors([])
    form.setValue("attendanceFile", file)
    setDirty(true)
  }

  const downloadFromUrl = async (url: string, filename: string): Promise<void> => {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error("Download failed")
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = objectUrl
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(objectUrl)
    } catch {
      toast({ variant: "destructive", title: "Download failed", description: "The file could not be downloaded. Please try again." })
    }
  }

  const reviewRows = useMemo(() => {
    const rows = selectedEntries.map((entry) => {
      const employee = employeesById.get(entry.employeeId)
      return {
        entry,
        name: employee ? employeeName(employee) : entry.employeeId,
        replaces: existingById.get(entry.employeeId),
      }
    })
    return showOnlyZero ? rows.filter((row) => row.entry.presentCount === 0) : rows
  }, [selectedEntries, employeesById, existingById, showOnlyZero])

  const footerPrimary = (): JSX.Element | null => {
    if (currentStep < STEP_SHEET) {
      return (
        <Button type="button" onClick={nextStep} disabled={loading || isSubmitted} className="w-full sm:w-auto">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )
    }
    if (currentStep === STEP_SHEET) {
      return (
        <Button type="button" onClick={nextStep} disabled={loading || isSubmitted} className="w-full sm:w-auto">
          {attendanceFile ? "Next: Review" : "Skip to Review"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )
    }
    if (currentStep === STEP_REVIEW) {
      return (
        <Button
          type="button"
          variant="brand"
          onClick={requestSubmit}
          disabled={submitting || reviewStats.employees === 0 || isSubmitted}
          className="w-full sm:w-auto"
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Attendance
          <CheckCircle2 className="ml-2 h-4 w-4" />
        </Button>
      )
    }
    return null
  }

  return (
    <div ref={topRef} className="container mx-auto max-w-7xl space-y-6 px-4 py-6">
      <PageHeader
        no="02"
        eyebrow="Attendance register"
        title="Mark Attendance by Site"
        description="Mark attendance for employees at a client site, step by step."
      />

      {selectedClient && selectedMonth && (
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              {sheetLoading ? (
                <span className="text-muted-foreground">Checking for an attached sheet...</span>
              ) : sheetUrl ? (
                <span className="inline-flex flex-wrap items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Sheet attached for <strong>{selectedClient.name}</strong>, {monthLabel}
                  <Button type="button" variant="link" size="sm" className="ml-1 h-auto p-0" onClick={() => openSheetPreview(sheetUrl)}>
                    View
                  </Button>
                </span>
              ) : (
                <span className="text-muted-foreground">
                  No sheet attached for {monthLabel}.{" "}
                  <button
                    type="button"
                    onClick={() => guardedNavigate("/attendance/upload")}
                    className="text-info underline-offset-4 hover:underline"
                  >
                    Upload now
                  </button>
                </span>
              )}
            </div>
            <Button type="button" variant="outline" onClick={() => guardedNavigate(recordsHref)}>
              View Records
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold md:text-xl">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Progress
            </CardTitle>
            <Badge variant="outline" className="w-fit">
              Step {Math.min(currentStep + 1, steps.length)} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent>
          <div className="hidden grid-cols-7 gap-3 lg:grid">
            {steps.map((step) => (
              <div
                key={step.step}
                className={cn(
                  "border-t-2 pt-3 text-center transition-colors duration-150",
                  step.status === "completed" ? "border-t-success" : step.status === "current" ? "border-t-brand" : "border-t-border",
                )}
              >
                <p
                  className={cn(
                    "mb-1 flex items-center justify-center gap-1 font-mono text-[11px] font-semibold tracking-[0.14em]",
                    step.status === "completed" ? "text-success" : step.status === "current" ? "text-brand" : "text-muted-foreground",
                  )}
                >
                  {step.status === "completed" && <Check className="h-3 w-3" />}
                  {String(step.step + 1).padStart(2, "0")}
                </p>
                <p className={cn("mb-1 text-xs font-medium", step.status === "pending" ? "text-muted-foreground" : "text-foreground")}>
                  {step.title}
                </p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="lg:hidden">
            <div className="mb-4 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                {steps.map((step, index) => (
                  <div
                    key={step.step}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-sm border font-mono text-[11px] font-semibold transition-colors duration-150",
                      step.status === "completed"
                        ? "border-success/40 bg-success/10 text-success"
                        : step.status === "current"
                          ? "border-brand/40 bg-brand/10 text-brand"
                          : "border-border text-muted-foreground",
                    )}
                  >
                    {step.status === "completed" ? <Check className="h-3 w-3" /> : String(index + 1).padStart(2, "0")}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-brand">{steps[currentStep]?.title}</p>
              <p className="text-xs text-muted-foreground">{steps[currentStep]?.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form noValidate onSubmit={(event) => event.preventDefault()} className="space-y-6">
          {currentStep === STEP_CLIENT && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Select Client
                </CardTitle>
                <CardDescription>Choose the client or site where you want to mark attendance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <FormControl>
                        <Combobox
                          options={clients.map((client) => ({ value: client.id ?? "", label: client.name }))}
                          value={field.value}
                          onChange={handleClientChange}
                          placeholder={clientsLoading ? "Loading clients..." : "Select a client"}
                          searchPlaceholder="Search clients..."
                          emptyText="No clients found."
                          disabled={clientsLoading || isSubmitted}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === STEP_MONTH && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Select Month
                </CardTitle>
                <CardDescription>Choose the month you are marking attendance for at {selectedClient?.name}.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Attendance Month</FormLabel>
                      <MonthPicker
                        value={field.value}
                        onChange={handleMonthChange}
                        yearRange={{ from: 2000, to: new Date().getFullYear() + 1 }}
                        disabled={isSubmitted}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedMonth && (
                  <div className="text-sm text-muted-foreground">
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading employees for {monthLabel}...
                      </span>
                    ) : employees.length > 0 ? (
                      <span>
                        {employees.length} active {employees.length === 1 ? "employee" : "employees"} in {monthLabel}
                        {existingRecords.length > 0 ? `, ${existingRecords.length} already have attendance saved.` : "."}
                      </span>
                    ) : errors.length === 0 ? (
                      <span>No active employees found for {monthLabel}. Try another month.</span>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === STEP_EXCEL && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Upload Excel (Optional)
                </CardTitle>
                <CardDescription>
                  Have the present days in a spreadsheet? Upload it to fill them in automatically. Or skip this and type them in the next step.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-md border bg-surface p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <h4 className="flex items-center gap-2 font-medium">
                        <Download className="h-4 w-4" />
                        Download the template
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Lists every active employee for {monthLabel}. Fill in the Present Days column and upload it below.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateExcelTemplate}
                      disabled={!selectedClient || !selectedMonth || employees.length === 0 || loading}
                      className="w-full sm:w-auto"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Template
                    </Button>
                  </div>
                </div>

                {!excelFile && checkingExcelFile && (
                  <p className="text-sm text-muted-foreground">Checking for an earlier upload...</p>
                )}
                {!excelFile && !checkingExcelFile && existingExcelFile && (
                  <Alert variant="info">
                    <Info className="h-4 w-4" />
                    <AlertTitle>An Excel file was uploaded earlier for {monthLabel}</AlertTitle>
                    <AlertDescription>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span>Uploading a new file replaces it.</span>
                        <Button type="button" variant="outline" size="sm" onClick={() => setExcelPreviewOpen(true)} className="w-full sm:w-auto">
                          <FileText className="mr-2 h-4 w-4" />
                          Download earlier file
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <FileDropZone
                    id="excel-file"
                    accept=".xlsx,.xls"
                    file={excelFile}
                    onFileChange={(file) => void handleExcelFileChange(file)}
                    badges={["XLSX", "XLS", "Max 10MB"]}
                    disabled={isSubmitted || excelValidating || excelUploading || loading}
                    busyText={excelValidating ? "Reading..." : excelUploading ? "Saving a copy..." : null}
                  />

                  {excelErrors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>This file could not be used</AlertTitle>
                      <AlertDescription>
                        <ul className="mt-1 list-inside list-disc space-y-1">
                          {excelErrors.map((error) => (
                            <li key={error} className="text-sm">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {excelLoadedCount !== null && excelFile && (
                    <Alert variant="success">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>
                        Present days loaded for {excelLoadedCount} {excelLoadedCount === 1 ? "employee" : "employees"}
                      </AlertTitle>
                      <AlertDescription>
                        {excelUploading
                          ? "Saving a copy of the file with this month..."
                          : excelCopySaved
                            ? "A copy of the file is saved with this month. Click Next to check the numbers."
                            : "Click Next to check the numbers."}
                      </AlertDescription>
                    </Alert>
                  )}

                  {excelWarnings.length > 0 && (
                    <Alert variant="warning">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Please check these rows</AlertTitle>
                      <AlertDescription>
                        <ul className="mt-1 list-inside list-disc space-y-1">
                          {excelWarnings.map((warning) => (
                            <li key={warning} className="text-sm">
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  The sheet needs an Employee ID column and a Present Days column. Rows with a blank Present Days cell are skipped.
                </p>
              </CardContent>
            </Card>
          )}

          {currentStep === STEP_MARK && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Mark Attendance
                </CardTitle>
                <CardDescription>
                  Tick the employees to include and enter their present days for {monthLabel}. Typing a number selects the row.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pb-6">
                {existingRecords.length > 0 && (
                  <Alert variant="info">
                    <Info className="h-4 w-4" />
                    <AlertTitle>
                      {existingRecords.length} {existingRecords.length === 1 ? "employee already has" : "employees already have"} attendance saved for {monthLabel}
                    </AlertTitle>
                    <AlertDescription>
                      Their saved days are filled in below and marked Saved. Saving again replaces those records.
                    </AlertDescription>
                  </Alert>
                )}

                {loading ? (
                  <InlineLoader text="Loading employees..." />
                ) : employees.length > 0 && selectedClientId && selectedMonth ? (
                  <EmployeeAttendanceStep
                    employees={employees}
                    entriesById={entriesById}
                    existingById={existingById}
                    clientId={selectedClientId}
                    month={selectedMonth}
                    maxDays={maxDays}
                    selectedCount={selectedEntries.length}
                    disabled={isSubmitted}
                    onToggle={handleEmployeeSelection}
                    onCountChange={handlePresentCountChange}
                    onSelectMany={handleSelectMany}
                    onFillSelected={handleFillSelected}
                  />
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>No employees to show</AlertTitle>
                    <AlertDescription>No active employees were found for {selectedClient?.name} in {monthLabel}.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === STEP_SHEET && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Attach Sheet (Optional)
                </CardTitle>
                <CardDescription>
                  Attach the signed attendance sheet for {monthLabel} if you have it. It is saved together with the attendance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileDropZone
                  id="sheet-file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  file={attendanceFile ?? null}
                  onFileChange={handleSheetFileChange}
                  badges={["PDF", "JPG", "PNG"]}
                  disabled={isSubmitted}
                />
                {sheetUrl && (
                  <p className="text-sm text-muted-foreground">
                    A sheet is already attached for {monthLabel}. Attaching a new one replaces it.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === STEP_REVIEW && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Review & Submit
                </CardTitle>
                <CardDescription>
                  {selectedClient?.name}, {monthLabel}. Check the totals below, then save.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="rounded-md border p-4">
                    <p className="text-xs text-muted-foreground">Employees</p>
                    <p className="font-mono text-2xl font-semibold tabular-nums">{reviewStats.employees}</p>
                  </div>
                  <div className="rounded-md border p-4">
                    <p className="text-xs text-muted-foreground">Total present days</p>
                    <p className="font-mono text-2xl font-semibold tabular-nums">{reviewStats.totalDays}</p>
                  </div>
                  <div className={cn("rounded-md border p-4", reviewStats.zeroDays > 0 && "border-warning/40 bg-warning/[0.04]")}>
                    <p className="text-xs text-muted-foreground">Employees with 0 days</p>
                    <p className={cn("font-mono text-2xl font-semibold tabular-nums", reviewStats.zeroDays > 0 && "text-warning")}>
                      {reviewStats.zeroDays}
                    </p>
                  </div>
                  <div className={cn("rounded-md border p-4", reviewStats.overwrites > 0 && "border-info/40 bg-info/[0.04]")}>
                    <p className="text-xs text-muted-foreground">Saved records replaced</p>
                    <p className={cn("font-mono text-2xl font-semibold tabular-nums", reviewStats.overwrites > 0 && "text-info")}>
                      {reviewStats.overwrites}
                    </p>
                  </div>
                </div>

                {mostlyZero && (
                  <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Most selected employees have 0 present days</AlertTitle>
                    <AlertDescription>
                      Payroll will pay them nothing for {monthLabel}. Go back to Mark Attendance if this is not right.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Attendance sheet</p>
                    <p>{attendanceFile?.name ?? "Not attached"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Excel file</p>
                    <p>{excelFile?.name ?? "Not used"}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-medium">Employees being saved</h4>
                    {reviewStats.zeroDays > 0 && (
                      <Button type="button" variant={showOnlyZero ? "secondary" : "outline"} size="sm" onClick={() => setShowOnlyZero((v) => !v)}>
                        {showOnlyZero ? "Show all" : `Show only 0 days (${reviewStats.zeroDays})`}
                      </Button>
                    )}
                  </div>
                  <div className="max-h-[28rem] overflow-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead className="text-right">Present Days</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reviewRows.map(({ entry, name, replaces }) => (
                          <TableRow key={entry.employeeId} className={cn(entry.presentCount === 0 && "bg-warning/[0.04]")}>
                            <TableCell>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">{name}</span>
                                <span className="font-mono text-xs text-muted-foreground">{entry.employeeId}</span>
                                {replaces && (
                                  <Badge variant="info">
                                    Replaces {replaces.presentCount} {replaces.presentCount === 1 ? "day" : "days"}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className={cn("text-right font-mono text-[13px] tabular-nums", entry.presentCount === 0 && "text-warning")}>
                              {entry.presentCount}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === STEP_DONE && submissionResult && (
            <Card>
              <CardContent className="pb-8 pt-8">
                <div className="space-y-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-success/40 bg-success/10">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-2xl font-semibold tracking-[-0.02em]">Attendance saved</h3>
                    <p className="mx-auto max-w-md text-muted-foreground">
                      {submissionResult.created} {submissionResult.created === 1 ? "employee" : "employees"} at {selectedClient?.name} for {monthLabel}.
                    </p>
                  </div>
                  <div className="mx-auto inline-block rounded-md border bg-surface p-4 text-left text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        {submissionResult.created} attendance {submissionResult.created === 1 ? "record" : "records"} saved
                      </div>
                      {submissionResult.fileUploaded && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-success" />
                          Attendance sheet attached
                        </div>
                      )}
                      {submissionResult.uploadError && (
                        <div className="flex items-start gap-2 text-warning">
                          <AlertTriangle className="mt-0.5 h-4 w-4" />
                          <span>Sheet not attached: {submissionResult.uploadError}. You can attach it from Upload Attendance.</span>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">Saved on {formatDateTime(submissionResult.timestamp)}</div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Button variant="brand" asChild>
                      <Link href={reportHref}>
                        <BarChart3 className="h-4 w-4" />
                        View attendance report
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={recordsHref}>
                        <FolderOpen className="h-4 w-4" />
                        View records
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={payrollHref}>
                        <Calculator className="h-4 w-4" />
                        Run payroll
                      </Link>
                    </Button>
                  </div>
                  <Button type="button" variant="ghost" onClick={resetForm} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Mark attendance for another month
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {errors.length > 0 && currentStep !== STEP_DONE && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Something needs attention</AlertTitle>
              <AlertDescription>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  {errors.map((error) => (
                    <li key={error} className="text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {currentStep < STEP_DONE && (
            <div className="sticky bottom-0 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0 || submitting || isSubmitted}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                {footerPrimary()}
              </div>
            </div>
          )}
        </form>
      </Form>

      <div className="h-8" />

      <ConfirmDialog
        open={pendingHref !== null}
        onOpenChange={(open) => {
          if (!open) setPendingHref(null)
        }}
        title="Leave without saving?"
        description={<p>The present days you entered here have not been saved yet. If you leave now they will be lost.</p>}
        confirmLabel="Leave anyway"
        cancelLabel="Stay here"
        destructive
        onConfirm={() => {
          const href = pendingHref
          setPendingHref(null)
          if (href) router.push(href)
        }}
      />

      <ConfirmDialog
        open={zeroDaysConfirmOpen}
        onOpenChange={setZeroDaysConfirmOpen}
        title="Save with 0 present days for most employees?"
        description={
          <>
            <p>
              {reviewStats.zeroDays} of {reviewStats.employees} selected employees have 0 present days. Payroll will pay them nothing for {monthLabel}.
            </p>
            {reviewStats.overwrites > 0 && (
              <p>
                {reviewStats.overwrites} saved {reviewStats.overwrites === 1 ? "record" : "records"} will be replaced.
              </p>
            )}
          </>
        }
        confirmLabel="Save anyway"
        cancelLabel="Go back"
        destructive
        onConfirm={() => {
          setZeroDaysConfirmOpen(false)
          void form.handleSubmit(onSubmit)()
        }}
      />

      <Dialog open={excelPreviewOpen} onOpenChange={setExcelPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Earlier Excel file
            </DialogTitle>
            <DialogDescription>
              Uploaded for {selectedClient?.name}, {monthLabel}. Excel files cannot be previewed here, so download it to open in Excel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setExcelPreviewOpen(false)}>
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!existingExcelFile) return
                const extension = existingExcelFile.toLowerCase().endsWith(".xls") ? ".xls" : ".xlsx"
                void downloadFromUrl(existingExcelFile, `Attendance_${selectedClient?.name ?? "Client"}_${monthString}${extension}`)
              }}
              disabled={!existingExcelFile}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl p-0">
          <DialogHeader className="border-b px-6 pb-4 pt-6">
            <DialogTitle className="flex items-center justify-between">
              <span>
                Attendance Sheet, {selectedClient?.name}, {monthLabel}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!previewUrl) return
                  const match = previewUrl.toLowerCase().match(/\.([a-z0-9]+)(?:\?|$)/)
                  const extension = match ? `.${match[1]}` : previewType === "pdf" ? ".pdf" : ".jpg"
                  void downloadFromUrl(previewUrl, `attendance-sheet-${selectedClient?.name ?? "sheet"}-${monthString}${extension}`)
                }}
              >
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            </DialogTitle>
            <DialogDescription>Attendance sheet preview</DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
            <div className="overflow-hidden rounded-md border bg-card">
              {previewType === "pdf" ? (
                <iframe src={previewUrl ?? ""} title="Attendance sheet" className="h-[70vh] w-full border-0" />
              ) : (
                <div className="flex min-h-[70vh] items-center justify-center bg-surface p-4">
                  <img
                    src={previewUrl ?? ""}
                    alt="Attendance sheet"
                    className="max-h-[70vh] max-w-full object-contain"
                    onError={() => setPreviewType("pdf")}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="border-t px-6 pb-6">
            <Button type="button" variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

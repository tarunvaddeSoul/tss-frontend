"use client"

import { useState, useEffect } from "react"
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
  UserCheck,
  Clock,
  RotateCcw,
  Download,
  ChevronDown,
  ChevronUp,
  History,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InlineLoader } from "@/components/ui/loader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { PageHeader } from "@/components/layout/page-header"

import { attendanceService } from "@/services/attendanceService"
import { getErrorMessage } from "@/services/api"
import { clientService } from "@/services/clientService"
import type { Client, ClientEmployee } from "@/types/client"
import type { BulkMarkAttendanceDto, ActiveEmployee } from "@/types/attendance"
import { MonthPicker } from "../ui/month-picker"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { attendanceSheetService } from "@/services/attendanceSheetService"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import { formatDate } from "@/lib/labels"

const daysInMonth = (month: Date): number => new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()

const SHEET_ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
const SHEET_ACCEPTED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"]

// Updated schema with proper validation for each step
const formSchema = z
  .object({
    clientId: z.string().min(1, "Please select a client"),
    month: z.date({
      required_error: "Please select a month",
    }),
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
  status: "pending" | "current" | "completed" | "error"
  validation?: string[]
}

interface SubmissionResult {
  created: number
  fileUploaded: boolean
  timestamp: Date
}

// Note: Frontend validation is simplified since backend now validates eligibility
// This helper is kept for display purposes only
const getEmployeeDisplayInfo = (employee: ActiveEmployee, clientId?: string) => {
  // Try to find the employment history that matches the client, or use the first one
  let employmentHistory = employee.employmentHistories?.[0]
  
  if (clientId && employee.employmentHistories) {
    const matchingHistory = employee.employmentHistories.find(
      (hist) => hist.clientId === clientId
    )
    if (matchingHistory) {
      employmentHistory = matchingHistory
    }
  }
  
  if (!employmentHistory) {
    console.warn("No employment history found for employee:", employee.id, employee)
    return { designation: "N/A", department: "N/A", joiningDate: "N/A" }
  }
  
  // Log the structure to debug
  if (!employmentHistory.designation?.name || !employmentHistory.department?.name) {
    console.log("Employment history structure:", {
      employeeId: employee.id,
      employmentHistory,
      hasDesignation: !!employmentHistory.designation,
      hasDepartment: !!employmentHistory.department,
    })
  }
  
  // Try multiple ways to access designation and department
  let designationName = employmentHistory.designation?.name
  let departmentName = employmentHistory.department?.name
  
  // Handle alternative structures
  if (!designationName && (employmentHistory as any).designationName) {
    designationName = (employmentHistory as any).designationName
  }
  if (!departmentName && (employmentHistory as any).departmentName) {
    departmentName = (employmentHistory as any).departmentName
  }
  if (!designationName && (employmentHistory as any).designation) {
    // If designation is a string instead of object
    designationName = typeof (employmentHistory as any).designation === 'string' 
      ? (employmentHistory as any).designation 
      : (employmentHistory as any).designation?.name
  }
  if (!departmentName && (employmentHistory as any).department) {
    // If department is a string instead of object
    departmentName = typeof (employmentHistory as any).department === 'string'
      ? (employmentHistory as any).department
      : (employmentHistory as any).department?.name
  }
  
  return {
    designation: designationName || "N/A",
    department: departmentName || "N/A",
    joiningDate: employmentHistory.joiningDate || "N/A",
  }
}

export function MarkAttendanceBySite() {
  const [currentStep, setCurrentStep] = useState(0)
  const [clients, setClients] = useState<Client[]>([])
  const [employees, setEmployees] = useState<ActiveEmployee[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)

  const { toast } = useToast()
  const [sheetUrl, setSheetUrl] = useState<string | null>(null)
  const [sheetLoading, setSheetLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<"pdf" | "image" | "unsupported" | "loading">("loading")
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [excelUploading, setExcelUploading] = useState(false)
  const [excelValidating, setExcelValidating] = useState(false)
  const [excelValidationErrors, setExcelValidationErrors] = useState<string[]>([])
  const [excelValidationWarnings, setExcelValidationWarnings] = useState<string[]>([])
  const [existingExcelFile, setExistingExcelFile] = useState<string | null>(null)
  const [checkingExcelFile, setCheckingExcelFile] = useState(false)
  const [excelParsed, setExcelParsed] = useState(false)
  const [excelPreviewOpen, setExcelPreviewOpen] = useState(false)
  const [excelDataToMerge, setExcelDataToMerge] = useState<Array<{ employeeId: string; selected: boolean; presentCount: number }> | null>(null)
  const [existingAttendanceRecords, setExistingAttendanceRecords] = useState<Array<{ employeeId: string; employeeName: string; presentCount: number; designation?: string; department?: string }>>([])
  const [loadingExistingAttendance, setLoadingExistingAttendance] = useState(false)

  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      month: undefined,
      employees: [],
      attendanceFile: undefined,
    },
    mode: "onChange",
  })

  const steps: StepStatus[] = [
    {
      step: 0,
      title: "Select Client",
      description: "Choose the client/site",
      status: currentStep === 0 ? "current" : currentStep > 0 ? "completed" : "pending",
      validation: ["clientId"],
    },
    {
      step: 1,
      title: "Select Month",
      description: "Choose attendance month",
      status: currentStep === 1 ? "current" : currentStep > 1 ? "completed" : "pending",
      validation: ["month"],
    },
    {
      step: 2,
      title: "Upload Excel File",
      description: "Upload pre-finalized attendance Excel",
      status: currentStep === 2 ? "current" : currentStep > 2 ? "completed" : "pending",
    },
    {
      step: 3,
      title: "Mark Attendance",
      description: "Select employees and mark attendance",
      status: currentStep === 3 ? "current" : currentStep > 3 ? "completed" : "pending",
    },
    {
      step: 4,
      title: "Upload File (Optional)",
      description: "Upload attendance sheet if available",
      status: currentStep === 4 ? "current" : currentStep > 4 ? "completed" : "pending",
    },
    {
      step: 5,
      title: "Review & Submit",
      description: "Review and submit attendance",
      status: currentStep === 5 ? "current" : currentStep > 5 ? "completed" : "pending",
    },
    {
      step: 6,
      title: "Success",
      description: "Attendance submitted successfully",
      status: currentStep === 6 ? "current" : "pending",
    },
  ]

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      setErrors([])

      const response = await clientService.getClients()

      if (!response.data?.clients || response.data.clients.length === 0) {
        const errorMsg = "No clients found. Please add clients first."
        setErrors([errorMsg])
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMsg,
        })
        return
      }

      setClients(response.data.clients)
      toast({
        title: "Success",
        description: `Loaded ${response.data.clients.length} clients`,
      })
    } catch (error: any) {
      const errorMsg = getErrorMessage(error)
      setErrors([errorMsg])
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      })
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to merge Excel data with employees list
  const mergeExcelDataWithEmployees = (excelFormData: Array<{ employeeId: string; selected: boolean; presentCount: number }>, employeesList: ActiveEmployee[]) => {
    // Create a map of Excel data by employeeId for quick lookup
    const excelDataMap = new Map(excelFormData.map(emp => [emp.employeeId, emp]))
    
    // Merge Excel data with current employees, preserving Excel values
    const mergedData = employeesList.map((emp) => {
      const excelData = excelDataMap.get(emp.id)
      if (excelData) {
        // Use Excel data (preserves presentCount and selected state)
        return excelData
      } else {
        // Employee not in Excel, use default
        return {
          employeeId: emp.id,
          selected: false,
          presentCount: 0,
        }
      }
    })
    
    form.setValue("employees", mergedData)
    
    // Update selected employees set
    const selectedSet = new Set(mergedData.filter(emp => emp.selected).map(emp => emp.employeeId))
    setSelectedEmployees(selectedSet)
    
    console.log("✅ Merged Excel data with employees:", mergedData.filter(emp => emp.selected && emp.presentCount > 0).length, "employees with data")
  }

  // Fetch active employees for client and month using new API
  const fetchActiveEmployees = async (clientId: string, month: Date) => {
    try {
      setLoading(true)
      setErrors([])

      const monthString = format(month, "yyyy-MM")
      console.log("📞 Calling /attendance/active-employees API with:", { clientId, month: monthString })
      
      // Fetch active employees
      const response = await attendanceService.getActiveEmployeesForMonth(clientId, monthString)
      
      console.log("✅ Response from /attendance/active-employees:", response)
      
      // Log first employee structure for debugging
      if (response.data?.employees && response.data.employees.length > 0) {
        console.log("🔍 Sample employee structure:", {
          employee: response.data.employees[0],
          employmentHistories: response.data.employees[0].employmentHistories,
          hasDesignation: !!response.data.employees[0].employmentHistories?.[0]?.designation,
          hasDepartment: !!response.data.employees[0].employmentHistories?.[0]?.department,
        })
      }

      if (!response.data || !response.data.employees || response.data.employees.length === 0) {
        const errorMsg = `No active employees found for ${response.data?.clientName || "this client"} in ${format(month, "MMMM yyyy")}.`
        setErrors([errorMsg])
        toast({
          title: "Warning",
          description: errorMsg,
        })
        setEmployees([])
        form.setValue("employees", [])
        setSelectedEmployees(new Set())
        return
      }

      const activeEmployees = response.data.employees
      setEmployees(activeEmployees)

      // Fetch existing attendance data to pre-fill and display
      let existingAttendance: Record<string, number> = {}
      const attendanceRecords: Array<{ employeeId: string; employeeName: string; presentCount: number; designation?: string; department?: string }> = []

      try {
        setLoadingExistingAttendance(true)
        const attendanceResponse = await attendanceService.getAttendanceByClientAndMonth({
          clientId,
          month: monthString,
        })

        if (attendanceResponse.data && Array.isArray(attendanceResponse.data)) {
          attendanceResponse.data.forEach((record: any) => {
            // API returns employeeID (uppercase D), not employeeId
            const empId = record.employeeID || record.employeeId
            if (empId && typeof record.presentCount === "number" && record.presentCount >= 0) {
              existingAttendance[empId] = record.presentCount

              // Store full record for display
              attendanceRecords.push({
                employeeId: empId,
                employeeName: record.employeeName || record.employee?.firstName + " " + record.employee?.lastName || "Unknown",
                presentCount: record.presentCount,
                designation: record.designationName || record.designation?.name,
                department: record.departmentName || record.department?.name,
              })
            }
          })
          console.log("📊 Found existing attendance for:", Object.keys(existingAttendance).length, "employees")
          console.log("📊 Existing attendance map:", existingAttendance)
        }
        
        setExistingAttendanceRecords(attendanceRecords)
      } catch (attendanceError) {
        console.log("ℹ️ No existing attendance found or error fetching:", attendanceError)
        setExistingAttendanceRecords([])
        // Not critical - continue without pre-filled data
      } finally {
        setLoadingExistingAttendance(false)
      }

      // Initialize employees form data with existing attendance pre-filled
      const employeesData = activeEmployees.map((emp: ActiveEmployee) => {
        // Match employee.id (from active employees) with employeeID (from attendance records)
        const existingCount = existingAttendance[emp.id]
        const hasExistingAttendance = existingCount !== undefined
        
        if (hasExistingAttendance) {
          console.log(`✅ Pre-filling attendance for ${emp.id}: ${existingCount} days`)
        }
        
        return {
          employeeId: emp.id, // The API returns 'id' field which is the employeeId
          selected: hasExistingAttendance, // Auto-select if attendance exists
          presentCount: hasExistingAttendance ? existingCount : 0,
        }
      })
      
      console.log("📊 Employees data with pre-filled attendance:", employeesData.filter(emp => emp.selected))
      
      form.setValue("employees", employeesData)
      
      // Update selected employees set
      const selectedIds = employeesData
        .filter((emp) => emp.selected)
        .map((emp) => emp.employeeId)
      setSelectedEmployees(new Set(selectedIds))

      const existingCount = Object.keys(existingAttendance).length
      toast({
        title: "Success",
        description: `Loaded ${activeEmployees.length} active employee(s)${existingCount > 0 ? ` (${existingCount} with existing attendance)` : ""} for ${format(month, "MMMM yyyy")}`,
      })
      console.log(`✅ Loaded ${activeEmployees.length} active employees for ${format(month, "MMMM yyyy")}`)
      if (existingCount > 0) {
        console.log(`📊 Pre-filled attendance for ${existingCount} employees`)
      }
    } catch (error: any) {
      const errorMsg = getErrorMessage(error)
      console.error("❌ Error fetching active employees:", {
        error,
        response: error?.response?.data,
        message: errorMsg,
      })
      setErrors([errorMsg])
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      })
      setEmployees([])
      form.setValue("employees", [])
      setSelectedEmployees(new Set())
    } finally {
      setLoading(false)
    }
  }

  const handleClientChange = (clientId: string) => {
    form.setValue("clientId", clientId)
    setErrors([])
    setEmployees([])
    form.setValue("employees", [])
    setSelectedEmployees(new Set())
    // Don't fetch employees until month is also selected - month change will trigger fetch
  }

  // Fetch active employees when both client and month are selected
  // Use form.watch subscription inside useEffect to properly react to changes
  useEffect(() => {
    let isMounted = true

    const subscription = form.watch((value, { name, type }) => {
      // Only react to month or clientId changes (not on blur or other events)
      if (type === "change" && (name === "month" || name === "clientId")) {
        const clientId = value.clientId
        const month = value.month

        if (clientId && month && isMounted) {
          console.log("🔄 Fetching active employees for:", { clientId, month: format(month, "yyyy-MM") })
          fetchActiveEmployees(clientId, month)
        } else if (!month && clientId && isMounted) {
          // Clear employees when month is cleared
          console.log("🧹 Clearing employees - month cleared")
          setEmployees([])
          form.setValue("employees", [])
          setSelectedEmployees(new Set())
        }
      }
    })

    // Also check initial values on mount
    const initialClientId = form.getValues("clientId")
    const initialMonth = form.getValues("month")
    if (initialClientId && initialMonth && isMounted) {
      console.log("🚀 Initial fetch for:", { clientId: initialClientId, month: format(initialMonth, "yyyy-MM") })
      fetchActiveEmployees(initialClientId, initialMonth)
    }

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount, subscription handles updates

  const handleEmployeeSelection = (employeeId: string, selected: boolean) => {
    const currentEmployees = form.getValues("employees") || []
    const updatedEmployees = currentEmployees.map((emp) => (emp.employeeId === employeeId ? { ...emp, selected } : emp))
    form.setValue("employees", updatedEmployees)

    // Update selected employees set
    const newSelected = new Set(selectedEmployees)
    if (selected) {
      newSelected.add(employeeId)
    } else {
      newSelected.delete(employeeId)
    }
    setSelectedEmployees(newSelected)
  }

  const handlePresentCountChange = (employeeId: string, presentCount: number) => {
    const month = form.getValues("month")
    const monthMax = month ? daysInMonth(month) : 31
    const validCount = Math.min(monthMax, Math.max(0, presentCount))

    const currentEmployees = form.getValues("employees") || []
    const updatedEmployees = currentEmployees.map((emp) =>
      emp.employeeId === employeeId 
        ? { ...emp, presentCount: validCount, selected: true } // Auto-select when editing
        : emp,
    )
    form.setValue("employees", updatedEmployees)
    
    // Update selected employees set if count > 0
    if (validCount > 0) {
      const newSelected = new Set(selectedEmployees)
      newSelected.add(employeeId)
      setSelectedEmployees(newSelected)
    }
  }

  const selectAllEmployees = () => {
    const selectedMonth = form.getValues("month")
    const currentEmployees = form.getValues("employees") || []
    const allSelected = currentEmployees.length > 0 && currentEmployees.every((emp) => emp.selected)

    if (!selectedMonth) {
      toast({
        variant: "destructive",
        title: "Select Month First",
        description: "Please select a month before selecting employees.",
      })
      return
    }

    // All employees from the API are already eligible (backend filters them)
    const updatedEmployees = currentEmployees.map((emp) => ({
      ...emp,
      selected: !allSelected, // Toggle selection
    }))
    form.setValue("employees", updatedEmployees)

    if (allSelected) {
      setSelectedEmployees(new Set())
      toast({
        title: "Info",
        description: "All employees deselected",
      })
    } else {
      const allIds = currentEmployees.map((emp) => emp.employeeId)
      setSelectedEmployees(new Set(allIds))
      toast({
        title: "Info",
        description: `All ${currentEmployees.length} employee(s) selected`,
      })
    }
  }

  const validateCurrentStep = async (): Promise<boolean> => {
    setErrors([])

    try {
      switch (currentStep) {
        case 0:
          const clientId = form.getValues("clientId")
          if (!clientId) {
            const error = "Please select a client"
            setErrors([error])
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: error,
            })
            return false
          }
          return true

        case 1:
          const month = form.getValues("month")
          if (!month) {
            const error = "Please select a month"
            setErrors([error])
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: error,
            })
            return false
          }
          return true

        case 2:
          // Excel upload step - optional, but if file is selected, it should be valid
          if (excelFile && excelValidationErrors.length > 0) {
            setErrors(excelValidationErrors)
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: excelValidationErrors[0] || "Excel file validation failed",
            })
            return false
          }
          // Step is optional - can proceed without Excel file
          return true

        case 3:
          const selectedMonth = form.getValues("month")
          const employeesData = form.getValues("employees") || []
          const selectedEmps = employeesData.filter((emp) => emp.selected)

          if (selectedEmps.length === 0) {
            const error = "Please select at least one employee"
            setErrors([error])
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: error,
            })
            return false
          }

          // Note: Eligibility validation is now handled by backend
          // All employees in the list are already eligible (API filters them)

          const maxDays = selectedMonth ? daysInMonth(selectedMonth) : 31
          const invalidCounts = selectedEmps.filter((emp) => emp.presentCount < 0 || emp.presentCount > maxDays)

          if (invalidCounts.length > 0) {
            const error = `Present count must be between 0 and ${maxDays} for ${selectedMonth ? format(selectedMonth, "MMMM yyyy") : "the selected month"}`
            setErrors([error])
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: error,
            })
            return false
          }

          return true

        case 4:
          // File upload is optional, always valid
          return true

        default:
          return true
      }
    } catch (error) {
      const errorMsg = "Validation failed. Please check your inputs."
      setErrors([errorMsg])
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      })
      return false
    }
  }

  const nextStep = async () => {
    // Prevent navigation if already submitted
    if (isSubmitted) {
      toast({
        title: "Already Submitted",
        description: "Attendance has already been submitted. Please start a new session.",
      })
      return
    }

    const isValid = await validateCurrentStep()
    if (!isValid) return

    // If moving from Excel step (step 2) to Mark Attendance step (step 3), preserve Excel data
    const isMovingFromExcelStep = currentStep === 2
    let excelFormData: Array<{ employeeId: string; selected: boolean; presentCount: number }> = []
    let hasExcelData = false
    
    if (isMovingFromExcelStep && selectedClient && selectedClient.id && selectedMonth) {
      // Save current form data before fetching (this contains Excel data)
      excelFormData = form.getValues("employees") || []
      hasExcelData = excelFormData.length > 0 && excelFormData.some(emp => emp.presentCount > 0)
      
      // Store Excel data for merging after step change
      if (hasExcelData) {
        setExcelDataToMerge(excelFormData)
      }
      
      // Only fetch if employees aren't already loaded
      if (employees.length === 0) {
        await fetchActiveEmployees(selectedClient.id, selectedMonth)
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setProgress(((currentStep + 1) / (steps.length - 1)) * 100)

      toast({
        title: "Progress",
        description: `Step ${currentStep + 2} of ${steps.length}`,
      })
    }
  }

  const prevStep = () => {
    // Prevent going back if already submitted
    if (isSubmitted) {
      toast({
        title: "Cannot Go Back",
        description: "Attendance has already been submitted. Please start a new session to mark new attendance.",
      })
      return
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setProgress(((currentStep - 1) / (steps.length - 1)) * 100)
      setErrors([])
    }
  }

  const onSubmit = async (data: FormValues) => {
    // Ensure we're on the Review & Submit step before submitting
    if (currentStep !== 5) {
      // If not on step 5, navigate to it first
      setCurrentStep(5)
      setProgress((5 / (steps.length - 1)) * 100)
      toast({
        title: "Please Review",
        description: "Please review your attendance data before submitting.",
      })
      return
    }

    // Prevent double submission
    if (isSubmitted || submitting) {
      toast({
        title: "Already Processing",
        description: "Attendance submission is already in progress or completed.",
      })
      return
    }

    try {
      setSubmitting(true)
      setErrors([])

      const selectedEmployeesData = (data.employees || []).filter((emp) => emp.selected)

      if (selectedEmployeesData.length === 0) {
        const error = "Please select at least one employee"
        setErrors([error])
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        })
        return
      }

      // Prepare bulk attendance data
      const attendanceRecords = selectedEmployeesData.map((emp) => ({
        employeeId: emp.employeeId,
        clientId: data.clientId,
        month: format(data.month, "yyyy-MM"),
        presentCount: emp.presentCount,
      }))

      const bulkData: BulkMarkAttendanceDto = {
        records: attendanceRecords,
      }

      let fileUploaded = false

      // The bulk endpoint is atomic: it saves every record or throws, so treat any
      // success as all-created and any error as none-saved (stay on the review step).
      try {
        await attendanceService.bulkMarkAttendance(bulkData)

        if (data.attendanceFile) {
          try {
            await attendanceService.uploadAttendanceSheet(
              {
                clientId: data.clientId,
                month: format(data.month, "yyyy-MM"),
              },
              data.attendanceFile,
            )
            fileUploaded = true
          } catch (uploadError: any) {
            const uploadErrorMsg = getErrorMessage(uploadError)
            toast({
              variant: "destructive",
              title: "Upload Error",
              description: uploadErrorMsg,
            })
            setErrors((prev) => [...prev, uploadErrorMsg])
          }
        }

        setSubmissionResult({
          created: selectedEmployeesData.length,
          fileUploaded,
          timestamp: new Date(),
        })
        setIsSubmitted(true)

        toast({
          title: "Success",
          description: `Attendance marked successfully for ${selectedEmployeesData.length} employee(s)!`,
        })

        if (fileUploaded) {
          toast({
            title: "File Upload Success",
            description: "Attendance file uploaded successfully!",
          })
        }

        setCurrentStep(6)
        setProgress(100)
      } catch (markingError: any) {
        const errorMessage =
          markingError?.response?.data?.error?.message ||
          "Failed to mark attendance. No records were saved. Please review the details and try again."
        setErrors([errorMessage])
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
          duration: 8000,
        })
      }
    } catch (error: any) {
      const errorMsg = getErrorMessage(error)
      setErrors([errorMsg])
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      })
      console.error("Error in onSubmit:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    // Reset all state in a controlled manner to avoid infinite loops
    setCurrentStep(0)
    setProgress(0)
    setEmployees([])
    setSelectedEmployees(new Set())
    setErrors([])
    setIsSubmitted(false)
    setSubmissionResult(null)
    setSheetUrl(null)
    setPreviewOpen(false)
    setPreviewUrl(null)
    setExcelFile(null)
    setExcelValidationErrors([])
    setExcelValidationWarnings([])
    setExcelParsed(false)
    setExistingExcelFile(null)
    setExcelDataToMerge(null)
    setExistingAttendanceRecords([])
    
    // Reset form after state is cleared to prevent subscription triggers
    setTimeout(() => {
      form.reset({
        clientId: "",
        month: undefined,
        employees: [],
        attendanceFile: undefined,
      })
    }, 0)

    toast({
      title: "New Session Started",
      description: "Form reset successfully. You can now mark new attendance.",
    })
  }

  const selectedClient = clients.find((c) => c.id === form.watch("clientId"))
  const selectedMonth = form.watch("month")
  const maxDays = selectedMonth ? daysInMonth(selectedMonth) : 31
  const formEmployees = form.watch("employees") || []

  // Merge Excel data when employees are loaded and we're on step 3
  useEffect(() => {
    if (excelDataToMerge && employees.length > 0 && currentStep === 3) {
      console.log("🔄 Merging Excel data with employees on step 3")
      mergeExcelDataWithEmployees(excelDataToMerge, employees)
      setExcelDataToMerge(null) // Clear after merging
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, currentStep, excelDataToMerge])

  // Fetch attachment status when client or month changes
  useEffect(() => {
    const fetchSheet = async () => {
      const clientId = selectedClient?.id || form.getValues("clientId")
      const month = selectedMonth || form.getValues("month")
      
      setSheetUrl(null)
      if (!clientId || !month) return
      
      try {
        setSheetLoading(true)
        const res = await attendanceSheetService.get(clientId, format(month, "yyyy-MM"))
        setSheetUrl(res.data?.attendanceSheetUrl || null)
      } catch (e) {
        setSheetUrl(null)
      } finally {
        setSheetLoading(false)
      }
    }
    fetchSheet()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient?.id, selectedMonth])

  // Check for existing Excel file when client or month changes
  useEffect(() => {
    const checkExistingExcel = async () => {
      const clientId = selectedClient?.id || form.getValues("clientId")
      const month = selectedMonth || form.getValues("month")
      
      setExistingExcelFile(null)
      if (!clientId || !month) return
      
      try {
        setCheckingExcelFile(true)
        const res = await attendanceService.getAttendanceExcelFiles({
          clientId,
          month: format(month, "yyyy-MM"),
        })
        
        if (res.data && typeof res.data === "object" && "attendanceExcelUrl" in res.data) {
          setExistingExcelFile(res.data.attendanceExcelUrl)
        } else {
          setExistingExcelFile(null)
        }
      } catch (e) {
        setExistingExcelFile(null)
      } finally {
        setCheckingExcelFile(false)
      }
    }
    checkExistingExcel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient?.id, selectedMonth])

  // Generate Excel template
  const generateExcelTemplate = async () => {
    if (!selectedClient || !selectedMonth) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select client and month first",
      })
      return
    }

    // Ensure employees are loaded
    if (employees.length === 0) {
      if (!selectedClient.id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid client selected",
        })
        return
      }
      try {
        setLoading(true)
        await fetchActiveEmployees(selectedClient.id, selectedMonth)
        // Wait a bit for state to update
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load employees. Please try again.",
        })
        return
      } finally {
        setLoading(false)
      }
    }

    if (employees.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No employees found for the selected client and month.",
      })
      return
    }

    try {
      // Create workbook
      const wb = XLSX.utils.book_new()
      
      // Prepare data with headers
      const data = [
        ["Employee ID", "Employee Name", "Present Days Count"],
        ...employees.map((emp) => [
          emp.id,
          `${emp.firstName} ${emp.lastName}`,
          0, // Default present days count
        ]),
      ]

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(data)
      
      // Set column widths
      ws["!cols"] = [
        { wch: 15 }, // Employee ID
        { wch: 30 }, // Employee Name
        { wch: 18 }, // Present Days Count
      ]

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Attendance")

      // Generate filename
      const filename = `Attendance_Template_${selectedClient.name}_${format(selectedMonth, "yyyy-MM")}.xlsx`

      // Write file
      XLSX.writeFile(wb, filename)

      toast({
        title: "Template Downloaded",
        description: `Excel template has been downloaded: ${filename}`,
      })
    } catch (error) {
      console.error("Error generating Excel template:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate Excel template. Please try again.",
      })
    }
  }

  // Validate Excel file
  const validateExcelFile = async (
    file: File,
  ): Promise<{ valid: boolean; errors: string[]; warnings?: string[]; data?: any[] }> => {
    const errors: string[] = []
    const warnings: string[] = []

    // Check file extension
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
    if (![".xlsx", ".xls"].includes(fileExtension)) {
      errors.push("Invalid file type. Only XLSX and XLS files are allowed.")
      return { valid: false, errors }
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      errors.push("File too large. Maximum file size is 10MB.")
      return { valid: false, errors }
    }

    try {
      // Read Excel file
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: "array" })
      
      // Get first sheet
      const firstSheetName = workbook.SheetNames[0]
      if (!firstSheetName) {
        errors.push("Excel file must contain at least one sheet.")
        return { valid: false, errors }
      }

      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

      if (jsonData.length < 2) {
        errors.push("Excel file must contain at least a header row and one data row.")
        return { valid: false, errors }
      }

      // Validate headers (case-insensitive)
      const headers = (jsonData[0] || []).map((h: any) => String(h || "").trim().toLowerCase())
      const requiredHeaders = ["employee id", "employee name", "present days count"]
      
      const missingHeaders: string[] = []
      requiredHeaders.forEach((reqHeader) => {
        if (!headers.includes(reqHeader)) {
          missingHeaders.push(reqHeader)
        }
      })

      if (missingHeaders.length > 0) {
        errors.push(
          `Missing required columns: ${missingHeaders.map((h) => `"${h}"`).join(", ")}. Please ensure columns are exactly: "Employee ID", "Employee Name", "Present Days Count".`,
        )
        return { valid: false, errors }
      }

      // Get column indices
      const employeeIdIndex = headers.indexOf("employee id")
      const employeeNameIndex = headers.indexOf("employee name")
      const presentDaysIndex = headers.indexOf("present days count")

      // Parse data rows without silently rewriting bad numbers; collect them for review.
      const maxDays = selectedMonth ? daysInMonth(selectedMonth) : 31
      const parsedData: Array<{ employeeId: string; employeeName: string; presentDays: number }> = []
      const invalidRows: string[] = []

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] || []
        const employeeId = String(row[employeeIdIndex] || "").trim()
        const employeeName = String(row[employeeNameIndex] || "").trim()
        const rawValue = row[presentDaysIndex]

        if (!employeeId && !employeeName) continue

        const rowLabel = `Row ${i + 1} (${employeeName || employeeId || "unknown"})`
        const presentDays = Number(rawValue)

        if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "" || Number.isNaN(presentDays)) {
          invalidRows.push(`${rowLabel}: present days "${rawValue ?? ""}" is not a number.`)
          continue
        }
        if (!Number.isInteger(presentDays)) {
          invalidRows.push(`${rowLabel}: present days ${presentDays} must be a whole number.`)
          continue
        }
        if (presentDays < 0 || presentDays > maxDays) {
          invalidRows.push(`${rowLabel}: present days ${presentDays} must be between 0 and ${maxDays}.`)
          continue
        }

        parsedData.push({ employeeId, employeeName, presentDays })
      }

      if (invalidRows.length > 0) {
        errors.push("Some rows have invalid present-day values. Fix them in the sheet and re-upload:")
        errors.push(...invalidRows.slice(0, 10))
        if (invalidRows.length > 10) {
          errors.push(`and ${invalidRows.length - 10} more row(s).`)
        }
        return { valid: false, errors }
      }

      if (parsedData.length === 0) {
        errors.push("No valid data rows found in Excel file.")
        return { valid: false, errors }
      }

      // Validate all employees exist and identify extra/missing employees
      const employeeIds = new Set(employees.map((e) => e.id))
      const employeeMap = new Map(employees.map((e) => [e.id, `${e.firstName} ${e.lastName}`]))
      const excelEmployeeIds = new Set(parsedData.map((row) => row.employeeId))
      
      const invalidEmployees: string[] = [] // Employees in Excel but not active
      const missingEmployees: string[] = [] // Active employees not in Excel
      
      // Find employees in Excel that don't exist in active employees
      parsedData.forEach((row) => {
        if (!employeeIds.has(row.employeeId)) {
          invalidEmployees.push(`${row.employeeName} (ID: ${row.employeeId})`)
        }
      })

      // Find active employees that are missing from Excel
      employees.forEach((emp) => {
        if (!excelEmployeeIds.has(emp.id)) {
          missingEmployees.push(`${emp.firstName} ${emp.lastName} (ID: ${emp.id})`)
        }
      })

      // Import the intersection; a changing roster (new joiners, leavers) should warn, not block.
      const matchedRows = parsedData.filter((row) => employeeIds.has(row.employeeId))

      if (matchedRows.length === 0) {
        errors.push(
          `None of the employees in the Excel file are active for this client and month. Please download a fresh template.`,
        )
        return { valid: false, errors }
      }

      if (invalidEmployees.length > 0) {
        const extraList = invalidEmployees.slice(0, 5).join(", ")
        const extraCount = invalidEmployees.length > 5 ? ` and ${invalidEmployees.length - 5} more` : ""
        warnings.push(`Skipped ${invalidEmployees.length} employee(s) in the sheet who are not active: ${extraList}${extraCount}.`)
      }

      if (missingEmployees.length > 0) {
        const missingList = missingEmployees.slice(0, 5).join(", ")
        const missingCount = missingEmployees.length > 5 ? ` and ${missingEmployees.length - 5} more` : ""
        warnings.push(`${missingEmployees.length} active employee(s) are not in the sheet and stay at 0: ${missingList}${missingCount}.`)
      }

      return { valid: true, errors: [], warnings, data: matchedRows }
    } catch (error) {
      console.error("Error validating Excel file:", error)
      errors.push("Failed to read Excel file. Please ensure it's a valid Excel file.")
      return { valid: false, errors }
    }
  }

  // Handle Excel file upload
  const handleExcelFileChange = async (file: File | null) => {
    setExcelFile(file)
    setExcelValidationErrors([])
    setExcelValidationWarnings([])
    setExcelParsed(false)

    if (!file) return

    if (!selectedClient || !selectedClient.id || !selectedMonth) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select client and month first",
      })
      setExcelFile(null)
      return
    }

    // Validate file
    setExcelValidating(true)
    const validation = await validateExcelFile(file)
    setExcelValidating(false)

    if (!validation.valid) {
      setExcelValidationErrors(validation.errors)
      toast({
        variant: "destructive",
        title: "Validation Failed",
        description: validation.errors[0] || "Excel file validation failed",
      })
      return
    }

    setExcelValidationWarnings(validation.warnings || [])

    // Parse and populate form
    if (validation.data) {
      try {
        // Fetch existing attendance to check what's already marked
        const monthString = format(selectedMonth, "yyyy-MM")
        let existingAttendance: Record<string, number> = {}
        const attendanceRecords: Array<{ employeeId: string; employeeName: string; presentCount: number; designation?: string; department?: string }> = []

        try {
          setLoadingExistingAttendance(true)
          const attendanceResponse = await attendanceService.getAttendanceByClientAndMonth({
            clientId: selectedClient.id, // TypeScript now knows this is defined due to the check above
            month: monthString,
          })

          if (attendanceResponse.data && Array.isArray(attendanceResponse.data)) {
            attendanceResponse.data.forEach((record: any) => {
              const empId = record.employeeID || record.employeeId
              if (empId) {
                existingAttendance[empId] = record.presentCount || 0

                // Store full record for display
                attendanceRecords.push({
                  employeeId: empId,
                  employeeName: record.employeeName || record.employee?.firstName + " " + record.employee?.lastName || "Unknown",
                  presentCount: record.presentCount || 0,
                  designation: record.designationName || record.designation?.name,
                  department: record.departmentName || record.department?.name,
                })
              }
            })
          }
          
          setExistingAttendanceRecords(attendanceRecords)
        } catch (e) {
          // Ignore errors when fetching existing attendance
          console.warn("Could not fetch existing attendance:", e)
          setExistingAttendanceRecords([])
        } finally {
          setLoadingExistingAttendance(false)
        }

        // Populate form with Excel data - prioritize Excel values over existing attendance
        // Ensure we match the employees array structure (all employees, not just Excel ones)
        const employeesData = employees.map((emp) => {
          // Find matching row from Excel
          const excelRow = validation.data?.find((row) => row.employeeId === emp.id)
          
          if (excelRow) {
            // Use Excel presentDays value, fallback to existing attendance if Excel has 0
            const excelPresentDays = excelRow.presentDays || 0
            const existingCount = existingAttendance[emp.id] || 0
            // Prioritize Excel value, but if Excel is 0 and we have existing, use existing
            const presentCount = excelPresentDays > 0 ? excelPresentDays : existingCount
            
            return {
              employeeId: emp.id,
              selected: true,
              presentCount: presentCount,
            }
          } else {
            // Employee not in Excel, use existing attendance if any
            const existingCount = existingAttendance[emp.id] || 0
            return {
              employeeId: emp.id,
              selected: existingCount > 0, // Auto-select if has existing attendance
              presentCount: existingCount,
            }
          }
        })

        form.setValue("employees", employeesData)
        
        // Update selected employees set
        const selectedSet = new Set(employeesData.map((e) => e.employeeId))
        setSelectedEmployees(selectedSet)

        setExcelParsed(true)
        
        // Auto-upload Excel file to backend
        try {
          setExcelUploading(true)
          const monthString = format(selectedMonth, "yyyy-MM")
          
          const result = await attendanceService.uploadAttendanceExcel(
            {
              clientId: selectedClient.id!, // Already validated above
              month: monthString,
            },
            file,
          )

          setExistingExcelFile(result.data.attendanceExcelUrl)
          
          toast({
            title: "Excel File Processed & Uploaded",
            description: `Successfully loaded ${validation.data.length} employees from Excel file and uploaded to server.`,
          })
        } catch (uploadError: any) {
          // Don't fail the whole process if upload fails, just warn
          const errorMsg = getErrorMessage(uploadError)
          console.warn("Excel upload failed:", errorMsg)
          toast({
            variant: "destructive",
            title: "Excel Processed but Upload Failed",
            description: `Data loaded successfully, but file upload failed: ${errorMsg}. You can try uploading manually.`,
          })
        } finally {
          setExcelUploading(false)
        }
      } catch (error) {
        console.error("Error processing Excel data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to process Excel data. Please try again.",
        })
      }
    }
  }

  // Upload Excel file
  const handleUploadExcel = async () => {
    if (!excelFile || !selectedClient || !selectedClient.id || !selectedMonth) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a valid Excel file",
      })
      return
    }

    // Re-validate before upload
    setExcelValidating(true)
    const validation = await validateExcelFile(excelFile)
    setExcelValidating(false)

    if (!validation.valid) {
      setExcelValidationErrors(validation.errors)
      toast({
        variant: "destructive",
        title: "Validation Failed",
        description: validation.errors[0] || "Excel file validation failed",
      })
      return
    }

    try {
      setExcelUploading(true)
      const monthString = format(selectedMonth, "yyyy-MM")
      
      const result = await attendanceService.uploadAttendanceExcel(
        {
          clientId: selectedClient.id, // TypeScript now knows this is defined due to the check above
          month: monthString,
        },
        excelFile,
      )

      setExistingExcelFile(result.data.attendanceExcelUrl)
      
      toast({
        title: "Excel File Uploaded",
        description: "Pre-finalized Excel file has been uploaded successfully.",
      })
    } catch (error: any) {
      const errorMsg = getErrorMessage(error)
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: errorMsg,
      })
    } finally {
      setExcelUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <PageHeader
        no="02"
        eyebrow="Attendance register"
        title="Mark Attendance by Site"
        description="Mark attendance for employees at a client site, step by step."
      />

      {/* Submission Status Alert */}
      {isSubmitted && submissionResult && (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Attendance Successfully Submitted</AlertTitle>
          <AlertDescription>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {submissionResult.created} employees attendance marked
              </div>
              {submissionResult.fileUploaded && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Attendance file uploaded successfully
                </div>
              )}
              <div className="text-xs mt-2">Submitted at: {formatDate(submissionResult.timestamp)}</div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Attachment Status */}
      {selectedClient && selectedMonth && (
        <Card>
          <CardContent className="pt-6 flex items-center justify-between gap-4">
            <div className="text-sm">
              {sheetLoading ? (
                <span className="text-muted-foreground">Checking attachment...</span>
              ) : sheetUrl ? (
                <span className="inline-flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Sheet attached for <strong>{selectedClient.name}</strong>, {format(selectedMonth, "MMMM yyyy")} ·
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={async () => {
                      if (!sheetUrl) return
                      setPreviewUrl(sheetUrl)
                      setPreviewOpen(true)
                      setPreviewType("loading")
                      
                      // Detect file type by fetching headers - try PDF first, then image
                      try {
                        const response = await fetch(sheetUrl, { method: "HEAD" })
                        const contentType = response.headers.get("Content-Type") || ""
                        const urlLower = sheetUrl.toLowerCase()
                        
                        // Check for PDF first (most common for attendance sheets)
                        if (contentType.includes("pdf") || urlLower.includes(".pdf") || urlLower.endsWith(".pdf")) {
                          setPreviewType("pdf")
                          return
                        }
                        
                        // Check for images
                        if (
                          contentType.includes("image") ||
                          contentType.includes("jpeg") ||
                          contentType.includes("jpg") ||
                          contentType.includes("png") ||
                          contentType.includes("gif") ||
                          contentType.includes("webp") ||
                          contentType.includes("bmp") ||
                          contentType.includes("svg") ||
                          urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)
                        ) {
                          setPreviewType("image")
                          return
                        }
                        
                        // For unknown types, try PDF first (most common), then image
                        // The preview will handle errors gracefully
                        if (urlLower.includes(".pdf") || urlLower.endsWith(".pdf")) {
                          setPreviewType("pdf")
                        } else {
                          // Try as image first, if it fails, the onError will try PDF
                          setPreviewType("image")
                        }
                      } catch (error) {
                        // Fallback: try to detect from URL, default to PDF
                        console.log("HEAD request failed, using URL detection:", error)
                        const urlLower = sheetUrl.toLowerCase()
                        
                        if (urlLower.includes(".pdf") || urlLower.endsWith(".pdf")) {
                          setPreviewType("pdf")
                        } else if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)) {
                          setPreviewType("image")
                        } else {
                          // For completely unknown types, try PDF first (most common)
                          // If PDF fails, user can still download
                          setPreviewType("pdf")
                        }
                      }
                    }}
                  >
                    View
                  </Button>
                </span>
              ) : (
                <span className="text-muted-foreground">
                  No sheet attached for this month. <a href="/attendance/upload" className="text-info underline-offset-4 hover:underline">Upload now</a>
                </span>
              )}
            </div>
            <Button variant="outline" onClick={() => router.push("/attendance/records")}>View Records</Button>
          </CardContent>
        </Card>
      )}

      {/* Progress Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Progress Tracker
            </CardTitle>
            <Badge variant="outline" className="w-fit">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
      </Card>

      {/* Steps Navigation - Responsive Design */}
      <Card>
        <CardContent className="pt-6">
          {/* Desktop Stepper */}
          <div className="hidden lg:grid grid-cols-7 gap-3">
            {steps.map((step) => (
              <div
                key={step.step}
                className={cn(
                  "border-t-2 pt-3 text-center transition-colors duration-150",
                  step.status === "completed"
                    ? "border-t-success"
                    : step.status === "current"
                      ? "border-t-brand"
                      : "border-t-border",
                )}
              >
                <p
                  className={cn(
                    "mb-1 flex items-center justify-center gap-1 font-mono text-[11px] font-semibold tracking-[0.14em]",
                    step.status === "completed"
                      ? "text-success"
                      : step.status === "current"
                        ? "text-brand"
                        : "text-muted-foreground",
                  )}
                >
                  {step.status === "completed" && <Check className="h-3 w-3" />}
                  {String(step.step + 1).padStart(2, "0")}
                </p>
                <p
                  className={cn(
                    "text-xs font-medium mb-1",
                    step.status === "pending" ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Mobile/Tablet Stepper */}
          <div className="lg:hidden">
            <div className="flex items-center justify-center mb-4">
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

      {/* Error Display */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {errors.map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <Form {...form}>
        <form noValidate 
          onSubmit={(e) => {
            e.preventDefault()
            // Only allow form submission on step 5 (Review & Submit)
            if (currentStep === 5) {
              form.handleSubmit(onSubmit)(e)
            } else {
              // If not on step 5, navigate to it
              setCurrentStep(5)
              setProgress((5 / (steps.length - 1)) * 100)
              toast({
                title: "Please Review",
                description: "Please review your attendance data before submitting.",
              })
            }
          }} 
          className="space-y-6"
        >
          {/* Step 0: Select Client */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Select Client
                </CardTitle>
                <CardDescription>Choose the client or site where you want to mark attendance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select onValueChange={handleClientChange} value={field.value} disabled={loading || isSubmitted}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id ?? ""}>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                {client.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Select the client where employees work</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {loading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading clients...
                  </div>
                )}

                {selectedClient && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Client Selected</AlertTitle>
                    <AlertDescription>
                      <strong>{selectedClient.name}</strong> has been selected for attendance marking.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 1: Select Month */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Select Month
                </CardTitle>
                <CardDescription>Choose the month for which you want to mark attendance</CardDescription>
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
                        onChange={field.onChange}
                        yearRange={{ from: 1900, to: new Date().getFullYear() }}
                        disabled={isSubmitted}
                      />
                      <FormDescription>Select the month for attendance marking</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedClient && selectedMonth && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Selection Summary</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-1">
                        <div>
                          <strong>Client:</strong> {selectedClient.name}
                        </div>
                        <div>
                          <strong>Month:</strong> {format(selectedMonth, "MMMM yyyy")}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Upload Excel File */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Upload Pre-Finalized Excel File
                </CardTitle>
                <CardDescription>
                  Upload an Excel file with attendance data. Download the template below to get started.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Download Section */}
                <div className="border rounded-md p-4 bg-surface">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-medium flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download Excel Template
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Download a template with Employee ID, Employee Name, and Present Days Count columns
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

                {/* Existing Excel File Alert */}
                {checkingExcelFile ? (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertTitle>Checking for existing Excel file...</AlertTitle>
                  </Alert>
                ) : existingExcelFile ? (
                  <Alert variant="info">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Excel File Already Uploaded</AlertTitle>
                    <AlertDescription>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span>
                          An Excel file has already been uploaded for this client and month. Uploading a new file will
                          replace the existing one.
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setExcelPreviewOpen(true)}
                          className="w-full sm:w-auto"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View/Download Excel
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : null}

                {/* File Upload Section */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="attendanceFile"
                    render={() => (
                      <FormItem>
                        <FormLabel>Excel File (XLSX/XLS)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              void handleExcelFileChange(file)
                            }}
                            disabled={isSubmitted || excelValidating || excelUploading}
                          />
                        </FormControl>
                        <FormDescription>
                          Only XLSX and XLS files are allowed. Maximum file size: 10MB
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Validation Status */}
                  {excelValidating && (
                    <Alert>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <AlertTitle>Validating Excel file...</AlertTitle>
                      <AlertDescription>Please wait while we validate your Excel file.</AlertDescription>
                    </Alert>
                  )}

                  {excelValidationErrors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Validation Errors</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                          {excelValidationErrors.map((error, index) => (
                            <li key={index} className="text-sm">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {excelValidationWarnings.length > 0 && (
                    <Alert variant="warning">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Some rows were skipped</AlertTitle>
                      <AlertDescription>
                        <p className="text-sm">The matched employees were loaded. Please review these before continuing:</p>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                          {excelValidationWarnings.map((warning, index) => (
                            <li key={index} className="text-sm">
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {excelParsed && excelFile && (
                    <Alert variant="success">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Excel File Processed Successfully</AlertTitle>
                      <AlertDescription>
                        {excelUploading ? (
                          "Uploading Excel file to server..."
                        ) : existingExcelFile ? (
                          "The Excel file has been validated, data has been loaded, and uploaded to server. You can proceed to the next step to review and mark attendance."
                        ) : (
                          "The Excel file has been validated and data has been loaded. You can proceed to the next step to review and mark attendance."
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Instructions */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Instructions</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Download the Excel template using the button above</li>
                      <li>Fill in the "Present Days Count" column for each employee</li>
                      <li>Ensure all three columns are present: Employee ID, Employee Name, Present Days Count</li>
                      <li>Upload the completed Excel file</li>
                      <li>The system will validate and populate the attendance form automatically</li>
                    </ol>
                    <p className="text-xs mt-2 text-muted-foreground">
                      Note: This step is optional. You can skip it and mark attendance manually in the next step.
                    </p>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Mark Attendance */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Mark Attendance
                </CardTitle>
                <CardDescription>
                  Select employees and enter their attendance count for{" "}
                  {selectedMonth && format(selectedMonth, "MMMM yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Previously Marked Attendance Section */}
                {existingAttendanceRecords.length > 0 && (
                  <Collapsible defaultOpen={true}>
                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <History className="h-4 w-4" />
                          <span className="font-medium">
                            Previously Marked Attendance ({existingAttendanceRecords.length} employee{existingAttendanceRecords.length !== 1 ? "s" : ""})
                          </span>
                        </div>
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">
                            Attendance Already Marked
                          </CardTitle>
                          <CardDescription className="text-xs">
                            The following employees already have attendance marked for this month. You can update their attendance below.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="rounded-md border overflow-x-auto scrollbar-sleek">
                            <Table className="min-w-[500px]">
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="min-w-[200px]">Employee</TableHead>
                                  <TableHead className="min-w-[120px]">Department</TableHead>
                                  <TableHead className="min-w-[120px]">Designation</TableHead>
                                  <TableHead className="w-32 text-center">Present Days</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {existingAttendanceRecords.map((record) => {
                                  return (
                                    <TableRow key={record.employeeId} className="bg-info/5">
                                      <TableCell>
                                        <div>
                                          <p className="font-medium">{record.employeeName}</p>
                                          <p className="font-mono text-xs text-muted-foreground">{record.employeeId}</p>
                                        </div>
                                      </TableCell>
                                      <TableCell>{record.department || "N/A"}</TableCell>
                                      <TableCell>{record.designation || "N/A"}</TableCell>
                                      <TableCell className="text-center">
                                        <Badge variant="info">
                                          {record.presentCount} day{record.presentCount !== 1 ? "s" : ""}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {loading ? (
                  <InlineLoader text="Loading employees..." />
                ) : employees.length > 0 ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={selectAllEmployees}
                          disabled={isSubmitted || !selectedMonth}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          {selectedEmployees.size === employees.length && employees.length > 0
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                        <Badge variant="secondary">
                          {selectedEmployees.size} of {employees.length} selected
                        </Badge>
                      </div>
                      {selectedMonth && (
                        <p className="text-xs text-muted-foreground">
                          Max {maxDays} days for {format(selectedMonth, "MMMM yyyy")}
                        </p>
                      )}
                    </div>

                    {/* Mobile: stacked cards */}
                    <div className="space-y-3 md:hidden">
                      {employees.map((employee) => {
                        const employeeData = formEmployees.find((emp) => emp.employeeId === employee.id)
                        const selectedClientId = form.watch("clientId")
                        const displayInfo = getEmployeeDisplayInfo(employee, selectedClientId)
                        const hasExistingAttendance = employeeData?.presentCount && employeeData.presentCount > 0 && employeeData.selected

                        return (
                          <div
                            key={employee.id}
                            className={cn(
                              "border rounded-md p-4 space-y-3",
                              employeeData?.selected && "bg-muted/50",
                              hasExistingAttendance && "bg-info/5 border-l-2 border-l-info",
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={employeeData?.selected || false}
                                  onCheckedChange={(checked) => handleEmployeeSelection(employee.id, checked as boolean)}
                                  disabled={isSubmitted}
                                  className="mt-1"
                                />
                                <div>
                                  <p className="font-medium">
                                    {employee.firstName} {employee.lastName}
                                  </p>
                                  <p className="font-mono text-xs text-muted-foreground">{employee.id}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {displayInfo.designation} · {displayInfo.department}
                                  </p>
                                </div>
                              </div>
                              {hasExistingAttendance && (
                                <Badge variant="info">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Marked
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <label className="text-sm text-muted-foreground">Present days</label>
                              <Input
                                type="number"
                                min="0"
                                max={maxDays}
                                value={employeeData?.presentCount || 0}
                                onChange={(e) => {
                                  const value = Number.parseInt(e.target.value) || 0
                                  handlePresentCountChange(employee.id, value)
                                }}
                                onBlur={(e) => {
                                  const value = Math.max(0, Number.parseInt(e.target.value) || 0)
                                  if (value !== (employeeData?.presentCount || 0)) {
                                    handlePresentCountChange(employee.id, value)
                                  }
                                }}
                                disabled={isSubmitted}
                                className="w-24 font-mono text-[13px] tabular-nums"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Desktop: table */}
                    <div className="hidden md:block rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Select</TableHead>
                            <TableHead className="min-w-[200px]">Employee</TableHead>
                            <TableHead className="min-w-[120px]">Department</TableHead>
                            <TableHead className="min-w-[120px]">Designation</TableHead>
                            <TableHead className="w-32">Present Days</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {employees.map((employee) => {
                            const employeeData = formEmployees.find((emp) => emp.employeeId === employee.id)
                            const selectedClientId = form.watch("clientId")
                            const displayInfo = getEmployeeDisplayInfo(employee, selectedClientId)

                            // Check if employee has existing attendance (was pre-filled from API or Excel)
                            const hasExistingAttendance = employeeData?.presentCount && employeeData.presentCount > 0 && employeeData.selected

                            return (
                              <TableRow
                                key={employee.id}
                                className={cn(
                                  employeeData?.selected && "bg-muted/50",
                                  hasExistingAttendance && "bg-info/5 border-l-2 border-l-info"
                                )}
                              >
                                <TableCell>
                                  <Checkbox
                                    checked={employeeData?.selected || false}
                                    onCheckedChange={(checked) => handleEmployeeSelection(employee.id, checked as boolean)}
                                    disabled={isSubmitted}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div>
                                      <p className="font-medium">
                                        {employee.firstName} {employee.lastName}
                                      </p>
                                      <p className="font-mono text-[13px] text-muted-foreground">{employee.id}</p>
                                    </div>
                                    {hasExistingAttendance && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Badge variant="info">
                                              <CheckCircle2 className="h-3 w-3 mr-1" />
                                              Marked
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Attendance already marked for this employee</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{displayInfo.department}</TableCell>
                                <TableCell>{displayInfo.designation}</TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="0"
                                    max={maxDays}
                                    value={employeeData?.presentCount || 0}
                                    onChange={(e) => {
                                      const value = Number.parseInt(e.target.value) || 0
                                      handlePresentCountChange(employee.id, value)
                                    }}
                                    onBlur={(e) => {
                                      // Ensure value is >= 0 on blur
                                      const value = Math.max(0, Number.parseInt(e.target.value) || 0)
                                      if (value !== (employeeData?.presentCount || 0)) {
                                        handlePresentCountChange(employee.id, value)
                                      }
                                    }}
                                    disabled={isSubmitted}
                                    className="w-20 font-mono text-[13px] tabular-nums"
                                    placeholder="0"
                                  />
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {selectedEmployees.size === 0 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>No employees selected</AlertTitle>
                        <AlertDescription>
                          {!selectedMonth
                            ? "Please select a month first, then employees will be loaded."
                            : employees.length === 0
                              ? "No active employees found for the selected client and month."
                              : "Please select at least one employee to mark attendance."}
                        </AlertDescription>
                      </Alert>
                    )}
                    {!selectedMonth && form.watch("clientId") && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Select Month to Load Employees</AlertTitle>
                        <AlertDescription>
                          Please select a month to load employees who were active during that month.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>No employees found</AlertTitle>
                    <AlertDescription>No active employees found for the selected client.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Upload File */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Attendance File (Optional)
                </CardTitle>
                <CardDescription>Upload an attendance sheet if you have one. This step is optional.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="attendanceFile"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Attendance File</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) {
                              onChange(undefined)
                              return
                            }
                            const ext = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
                            const typeOk = SHEET_ACCEPTED_TYPES.includes(file.type)
                            const extOk = SHEET_ACCEPTED_EXTENSIONS.includes(ext)
                            if (!typeOk && !extOk) {
                              toast({
                                variant: "destructive",
                                title: "Unsupported File Type",
                                description: "Please upload a PDF, JPG, JPEG, or PNG file.",
                              })
                              e.target.value = ""
                              onChange(undefined)
                              return
                            }
                            onChange(file)
                          }}
                          disabled={isSubmitted}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Upload attendance proof as a PDF or image (PDF, JPG, JPEG, PNG).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>Optional Step</AlertTitle>
                  <AlertDescription>
                    You can skip this step if you don't have an attendance file to upload. The attendance has already
                    been marked in the previous step.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Review and Submit */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Review & Submit
                </CardTitle>
                <CardDescription>Review your attendance data before submitting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Client</h4>
                    <p className="text-sm text-muted-foreground">{selectedClient?.name}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Month</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedMonth && format(selectedMonth, "MMMM yyyy")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Selected Employees</h4>
                    <p className="text-sm text-muted-foreground">{selectedEmployees.size} employees</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Attendance File</h4>
                    <p className="text-sm text-muted-foreground">
                      {form.watch("attendanceFile")?.name || "No file uploaded"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Selected Employees Summary</h4>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead className="text-right">Present Days</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formEmployees
                          .filter((emp) => emp.selected)
                          .map((emp) => {
                            const employee = employees.find((e) => e.id === emp.employeeId)
                            return (
                              <TableRow key={emp.employeeId}>
                                <TableCell className="font-medium">
                                  {employee?.firstName} {employee?.lastName}
                                </TableCell>
                                <TableCell className="text-right font-mono text-[13px]">{emp.presentCount}</TableCell>
                              </TableRow>
                            )
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Ready to Submit</AlertTitle>
                  <AlertDescription>
                    Please review the information above. Once submitted, the attendance will be recorded and you cannot
                    modify it.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons - Fixed positioning to avoid toast overlap */}
          {currentStep < 6 && (
            <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4 -mx-4">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
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

                    <div className="flex gap-2">
                      {currentStep < 4 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={loading || isSubmitted}
                          className="w-full sm:w-auto"
                        >
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Next
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : currentStep === 4 ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={nextStep}
                            disabled={loading || isSubmitted}
                            className="w-full sm:w-auto"
                          >
                            Skip & Review
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            onClick={nextStep}
                            disabled={loading || isSubmitted}
                            className="w-full sm:w-auto"
                          >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Next: Review
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </>
                      ) : currentStep === 5 ? (
                        <Button
                          type="submit"
                          variant="brand"
                          disabled={submitting || selectedEmployees.size === 0 || isSubmitted}
                          className="w-full sm:w-auto"
                        >
                          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isSubmitted ? "Already Submitted" : "Submit Attendance"}
                          <CheckCircle2 className="ml-2 h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Success State */}
          {currentStep === 6 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-success/10 border border-success/40 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-display text-2xl font-semibold tracking-[-0.02em]">Attendance Marked Successfully!</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      The attendance has been recorded for {selectedEmployees.size} employees at {selectedClient?.name}{" "}
                      for {selectedMonth && format(selectedMonth, "MMMM yyyy")}.
                    </p>
                    {submissionResult && (
                      <div className="bg-surface rounded-md border p-4 text-sm space-y-2">
                        <div className="font-medium">Submission Details:</div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          {submissionResult.created} employees processed successfully
                        </div>
                        {submissionResult.fileUploaded && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-success" />
                            Attendance file uploaded
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Completed at: {formatDate(submissionResult.timestamp)}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button onClick={resetForm} size="lg" className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Start New Attendance Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>

      {/* Bottom spacing to ensure content is not hidden behind sticky navigation */}
      <div className="h-20" />

      {/* Excel File Preview Dialog */}
      <Dialog open={excelPreviewOpen} onOpenChange={setExcelPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Excel File Preview
            </DialogTitle>
            <DialogDescription>
              Attendance Excel file for {selectedClient?.name} - {selectedMonth && format(selectedMonth, "MMMM yyyy")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border rounded-md p-4 bg-surface">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-card border rounded-md">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Pre-finalized Attendance Excel File</p>
                  <p className="text-sm text-muted-foreground">
                    This is the Excel file that was previously uploaded for this client and month.
                  </p>
                </div>
              </div>
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>
                Excel files cannot be previewed directly in the browser. You can download the file to view it in Excel
                or another spreadsheet application.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExcelPreviewOpen(false)}>
              Close
            </Button>
            <Button
              onClick={async () => {
                if (!existingExcelFile) return
                try {
                  const response = await fetch(existingExcelFile)
                  if (!response.ok) throw new Error("Failed to download")
                  
                  const blob = await response.blob()
                  const contentType = response.headers.get("Content-Type") || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  
                  // Detect extension from content type or URL
                  let extension = ".xlsx"
                  if (contentType.includes("application/vnd.ms-excel")) {
                    extension = ".xls"
                  } else {
                    const urlLower = existingExcelFile.toLowerCase()
                    if (urlLower.endsWith(".xls")) extension = ".xls"
                    else if (urlLower.endsWith(".xlsx")) extension = ".xlsx"
                  }
                  
                  const filename = `Attendance_${selectedClient?.name || "Client"}_${selectedMonth ? format(selectedMonth, "yyyy-MM") : ""}${extension}`
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = filename
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                  
                  toast({
                    title: "Download Started",
                    description: "Excel file download started successfully",
                  })
                } catch (error) {
                  console.error("Error downloading Excel file:", error)
                  toast({
                    variant: "destructive",
                    title: "Download Failed",
                    description: "Failed to download the Excel file. Please try again.",
                  })
                }
              }}
              disabled={!existingExcelFile}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Excel File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span>
                Attendance Sheet - {selectedClient?.name} - {selectedMonth ? format(selectedMonth, "MMMM yyyy") : ""}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!previewUrl) return
                    try {
                      const response = await fetch(previewUrl)
                      if (!response.ok) throw new Error("Failed to download")
                      
                      const blob = await response.blob()
                      const contentType = response.headers.get("Content-Type") || "application/octet-stream"
                      
                      // Detect extension from content type or URL
                      let extension = ""
                      if (contentType.includes("pdf")) extension = ".pdf"
                      else if (contentType.includes("jpeg") || contentType.includes("jpg")) extension = ".jpg"
                      else if (contentType.includes("png")) extension = ".png"
                      else if (contentType.includes("gif")) extension = ".gif"
                      else if (contentType.includes("webp")) extension = ".webp"
                      else {
                        // Try to get extension from URL
                        const urlLower = previewUrl.toLowerCase()
                        const match = urlLower.match(/\.([a-z0-9]+)(?:\?|$)/)
                        if (match) extension = `.${match[1]}`
                        else extension = ".jpg" // Default for images from S3
                      }
                      
                      const filename = `attendance-sheet-${selectedClient?.name || "sheet"}-${selectedMonth ? format(selectedMonth, "yyyy-MM") : ""}${extension}`
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = filename
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      URL.revokeObjectURL(url)
                      
                      toast({
                        title: "Download Started",
                        description: "File download started successfully",
                      })
                    } catch (error) {
                      toast({
                        variant: "destructive",
                        title: "Download Failed",
                        description: "Failed to download the file. Please try again.",
                      })
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
              </div>
            </DialogTitle>
          <DialogDescription>Attendance sheet document preview</DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <div className="border rounded-md overflow-hidden bg-card">
            {previewType === "loading" ? (
              <div className="flex items-center justify-center h-[70vh]">
                <div className="text-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading preview...</p>
                </div>
              </div>
            ) : previewType === "pdf" ? (
              <iframe 
                src={previewUrl || ""} 
                className="w-full h-[70vh] border-0"
                onError={() => {
                  // If PDF iframe fails, try as image
                  console.log("PDF iframe failed, trying as image")
                  setPreviewType("image")
                }}
              />
            ) : previewType === "image" ? (
              <div className="flex items-center justify-center min-h-[70vh] bg-surface p-4">
                <img
                  src={previewUrl || ""}
                  alt="Attendance Sheet"
                  className="max-w-full max-h-[70vh] object-contain"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error("Image load error, trying PDF:", e, "URL:", previewUrl)
                    // If image fails, try as PDF (common case for attendance sheets)
                    const urlLower = (previewUrl || "").toLowerCase()
                    if (urlLower.includes(".pdf") || urlLower.endsWith(".pdf") || !urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)) {
                      setPreviewType("pdf")
                    }
                  }}
                  onLoad={() => {
                    console.log("Image loaded successfully:", previewUrl)
                  }}
                />
              </div>
              ) : (
                // Fallback: Try to show as PDF if image failed, or show download option
                <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center space-y-4">
                  <iframe 
                    src={previewUrl || ""} 
                    className="w-full h-full border-0"
                    style={{ minHeight: "500px" }}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 border-t">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

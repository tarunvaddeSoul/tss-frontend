"use client"

import type React from "react"
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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
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

import { attendanceService } from "@/services/attendanceService"
import { companyService } from "@/services/companyService"
import type { Company, CompanyEmployee } from "@/types/company"
import type { BulkMarkAttendanceDto, ActiveEmployee } from "@/types/attendance"
import { MonthPicker } from "../ui/month-picker"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { attendanceSheetService } from "@/services/attendanceSheetService"
import { useRouter } from "next/navigation"
// Updated schema with proper validation for each step
const formSchema = z.object({
  companyId: z.string().min(1, "Please select a company"),
  month: z.date({
    required_error: "Please select a month",
  }),
  employees: z
    .array(
      z.object({
        employeeId: z.string(),
        selected: z.boolean(),
        presentCount: z.number().min(0, "Present count cannot be negative").max(31, "Present count cannot exceed 31"),
      }),
    )
    .optional(),
  attendanceFile: z.any().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface StepStatus {
  step: number
  title: string
  description: string
  status: "pending" | "current" | "completed" | "error"
  icon: React.ReactNode
  validation?: string[]
}

interface SubmissionResult {
  success: boolean
  created: number
  failed: number
  fileUploaded: boolean
  timestamp: Date
}

// Note: Frontend validation is simplified since backend now validates eligibility
// This helper is kept for display purposes only
const getEmployeeDisplayInfo = (employee: ActiveEmployee, companyId?: string) => {
  // Try to find the employment history that matches the company, or use the first one
  let employmentHistory = employee.employmentHistories?.[0]
  
  if (companyId && employee.employmentHistories) {
    const matchingHistory = employee.employmentHistories.find(
      (hist) => hist.companyId === companyId
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
  const [companies, setCompanies] = useState<Company[]>([])
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

  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: "",
      month: undefined,
      employees: [],
      attendanceFile: undefined,
    },
    mode: "onChange",
  })

  const steps: StepStatus[] = [
    {
      step: 0,
      title: "Select Company",
      description: "Choose the company/site",
      status: currentStep === 0 ? "current" : currentStep > 0 ? "completed" : "pending",
      icon: <Building2 className="h-4 w-4" />,
      validation: ["companyId"],
    },
    {
      step: 1,
      title: "Select Month",
      description: "Choose attendance month",
      status: currentStep === 1 ? "current" : currentStep > 1 ? "completed" : "pending",
      icon: <Calendar className="h-4 w-4" />,
      validation: ["month"],
    },
    {
      step: 2,
      title: "Mark Attendance",
      description: "Select employees and mark attendance",
      status: currentStep === 2 ? "current" : currentStep > 2 ? "completed" : "pending",
      icon: <Users className="h-4 w-4" />,
    },
    {
      step: 3,
      title: "Upload File (Optional)",
      description: "Upload attendance sheet if available",
      status: currentStep === 3 ? "current" : currentStep > 3 ? "completed" : "pending",
      icon: <Upload className="h-4 w-4" />,
    },
    {
      step: 4,
      title: "Review & Submit",
      description: "Review and submit attendance",
      status: currentStep === 4 ? "current" : currentStep > 4 ? "completed" : "pending",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      step: 5,
      title: "Success",
      description: "Attendance submitted successfully",
      status: currentStep === 5 ? "current" : "pending",
      icon: <Check className="h-4 w-4" />,
    },
  ]

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      setErrors([])

      const response = await companyService.getCompanies()

      if (!response.data?.companies || response.data.companies.length === 0) {
        const errorMsg = "No companies found. Please add companies first."
        setErrors([errorMsg])
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMsg,
        })
        return
      }

      setCompanies(response.data.companies)
      toast({
        title: "Success",
        description: `Loaded ${response.data.companies.length} companies`,
      })
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to fetch companies. Please try again."
      setErrors([errorMsg])
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      })
      console.error("Error fetching companies:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch active employees for company and month using new API
  const fetchActiveEmployees = async (companyId: string, month: Date) => {
    try {
      setLoading(true)
      setErrors([])

      const monthString = format(month, "yyyy-MM")
      console.log("📞 Calling /attendance/active-employees API with:", { companyId, month: monthString })
      
      // Fetch active employees
      const response = await attendanceService.getActiveEmployeesForMonth(companyId, monthString)
      
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
        const errorMsg = `No active employees found for ${response.data?.companyName || "this company"} in ${format(month, "MMMM yyyy")}.`
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

      // Fetch existing attendance data to pre-fill
      let existingAttendance: Record<string, number> = {}
      try {
        const attendanceResponse = await attendanceService.getAttendanceByCompanyAndMonth({
          companyId,
          month: monthString,
        })
        
        if (attendanceResponse.data && Array.isArray(attendanceResponse.data)) {
          attendanceResponse.data.forEach((record: any) => {
            // API returns employeeID (uppercase D), not employeeId
            const empId = record.employeeID || record.employeeId
            if (empId && typeof record.presentCount === "number" && record.presentCount >= 0) {
              existingAttendance[empId] = record.presentCount
            }
          })
          console.log("📊 Found existing attendance for:", Object.keys(existingAttendance).length, "employees")
          console.log("📊 Existing attendance map:", existingAttendance)
        }
      } catch (attendanceError) {
        console.log("ℹ️ No existing attendance found or error fetching:", attendanceError)
        // Not critical - continue without pre-filled data
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
      const errorMsg = error?.response?.data?.message || "Failed to fetch active employees. Please try again."
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

  const handleCompanyChange = (companyId: string) => {
    form.setValue("companyId", companyId)
    setErrors([])
    setEmployees([])
    form.setValue("employees", [])
    setSelectedEmployees(new Set())
    // Don't fetch employees until month is also selected - month change will trigger fetch
  }

  // Fetch active employees when both company and month are selected
  // Use form.watch subscription inside useEffect to properly react to changes
  useEffect(() => {
    let isMounted = true

    const subscription = form.watch((value, { name, type }) => {
      // Only react to month or companyId changes (not on blur or other events)
      if (type === "change" && (name === "month" || name === "companyId")) {
        const companyId = value.companyId
        const month = value.month

        if (companyId && month && isMounted) {
          console.log("🔄 Fetching active employees for:", { companyId, month: format(month, "yyyy-MM") })
          fetchActiveEmployees(companyId, month)
        } else if (!month && companyId && isMounted) {
          // Clear employees when month is cleared
          console.log("🧹 Clearing employees - month cleared")
          setEmployees([])
          form.setValue("employees", [])
          setSelectedEmployees(new Set())
        }
      }
    })

    // Also check initial values on mount
    const initialCompanyId = form.getValues("companyId")
    const initialMonth = form.getValues("month")
    if (initialCompanyId && initialMonth && isMounted) {
      console.log("🚀 Initial fetch for:", { companyId: initialCompanyId, month: format(initialMonth, "yyyy-MM") })
      fetchActiveEmployees(initialCompanyId, initialMonth)
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
    // Ensure presentCount is >= 0
    const validCount = Math.max(0, presentCount)
    
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
          const companyId = form.getValues("companyId")
          if (!companyId) {
            const error = "Please select a company"
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

          // Validate present counts (ensure >= 0 and <= 31)
          const invalidCounts = selectedEmps.filter((emp) => emp.presentCount < 0 || emp.presentCount > 31)

          if (invalidCounts.length > 0) {
            const error = "Present count must be between 0 and 31"
            setErrors([error])
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: error,
            })
            return false
          }

          return true

        case 3:
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
        companyId: data.companyId,
        month: format(data.month, "yyyy-MM"),
        presentCount: emp.presentCount,
      }))

      const bulkData: BulkMarkAttendanceDto = {
        records: attendanceRecords,
      }

      let fileUploaded = false

      // Mark attendance
      try {
        console.log("📤 Sending bulk attendance request:", {
          recordCount: bulkData.records.length,
          records: bulkData.records,
        })
        
        const response = await attendanceService.bulkMarkAttendance(bulkData)
        
        console.log("📥 Bulk attendance response:", response)
        console.log("📥 Response structure:", {
          statusCode: response.statusCode,
          message: response.message,
          data: response.data,
          hasData: !!response.data,
          created: response.data?.created,
          failed: response.data?.failed,
          errors: response.data?.errors,
        })

        // Handle backend validation errors
        if (response.statusCode === 400 && response.data === null) {
          // Backend rejected some or all records
          const errorMessage = response.message || "Some employees are not eligible for attendance in the selected month."
          setErrors([errorMessage])
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: errorMessage,
          })
          setSubmitting(false)
          return
        }

        // Handle successful or partial success response
        // Backend might return success with data, or the created count might be in a different structure
        if (response.statusCode === 200 || response.statusCode === 201 || response.data) {
          // Try multiple ways to get the count
          let createdCount = 0
          let failedCount = 0
          
          if (response.data) {
            // Check if data is an array (legacy format) or object with created/failed
            if (Array.isArray(response.data)) {
              // If data is an array, use array length as created count
              createdCount = response.data.length
              failedCount = selectedEmployeesData.length - createdCount
              console.log("📊 Response data is array, using length:", createdCount)
            } else if (typeof response.data === 'object' && response.data !== null) {
              // Backend should return created and failed counts
              createdCount = response.data.created ?? 0
              failedCount = response.data.failed ?? 0
              
              // Fallback: If created is 0 but status is 200/201 and no errors, assume all succeeded
              if (createdCount === 0 && (response.statusCode === 200 || response.statusCode === 201) && (!response.data.errors || response.data.errors.length === 0)) {
                console.log("⚠️ Backend returned created: 0, but status is", response.statusCode, ". Assuming all records succeeded.")
                createdCount = selectedEmployeesData.length
              }
              
              // If we still have 0 created but have errors, calculate from errors
              if (createdCount === 0 && response.data.errors && response.data.errors.length > 0) {
                createdCount = selectedEmployeesData.length - response.data.errors.length
                failedCount = response.data.errors.length
              }
            }
          } else {
            // If no data object but status 200/201, assume all succeeded
            if (response.statusCode === 200 || response.statusCode === 201) {
              createdCount = selectedEmployeesData.length
              failedCount = 0
              console.log("📊 No data in response, assuming all succeeded based on status code:", response.statusCode)
            }
          }
          
          // Final fallback: If still 0 but we have success status, use submitted count
          if (createdCount === 0 && (response.statusCode === 200 || response.statusCode === 201)) {
            console.log("⚠️ Final fallback: Using submitted count as created count")
            createdCount = selectedEmployeesData.length
          }
          
          console.log("✅ Calculated counts:", { createdCount, failedCount, selectedCount: selectedEmployeesData.length })
          
          const result: SubmissionResult = {
            success: true,
            created: createdCount,
            failed: failedCount,
            fileUploaded,
            timestamp: new Date(),
          }

          // Show errors if any failed
          if (response.data?.errors && response.data.errors.length > 0) {
            const errorMessages = response.data.errors
            setErrors(errorMessages)
            toast({
              variant: "destructive",
              title: "Some Records Failed",
              description: errorMessages.join("\n"),
              duration: 10000, // Show longer for multiple errors
            })
          }
          
          // Also check if there are errors in the message for bulk operations
          if (response.data?.failed && response.data.failed > 0 && response.message) {
            // Message might contain error details
            if (response.message.includes("Validation failed") || response.message.includes("failed")) {
              setErrors([response.message])
            }
          }

          // Upload file if provided
          if (data.attendanceFile) {
            try {
              await attendanceService.uploadAttendanceSheet(
                {
                  companyId: data.companyId,
                  month: format(data.month, "yyyy-MM"),
                },
                data.attendanceFile,
              )
              fileUploaded = true
              result.fileUploaded = true
            } catch (uploadError: any) {
              const uploadErrorMsg = uploadError?.response?.data?.message || "Failed to upload attendance file"
              toast({
                variant: "destructive",
                title: "Upload Error",
                description: uploadErrorMsg,
              })
              setErrors((prev) => [...prev, uploadErrorMsg])
            }
          }

          setSubmissionResult(result)
          setIsSubmitted(true)

          // Show success message
          if (result.failed > 0) {
            toast({
              title: "Partial Success",
              description: `Attendance partially completed: ${result.created} created, ${result.failed} failed. Check errors above.`,
              duration: 8000,
            })
          } else {
            toast({
              title: "Success",
              description: `Attendance marked successfully for ${result.created} employee(s)!`,
            })
          }

          if (result.fileUploaded) {
            toast({
              title: "File Upload Success",
              description: "Attendance file uploaded successfully!",
            })
          }

          // Move to success step
          setCurrentStep(5)
          setProgress(100)
        } else {
          // Unexpected response format
          throw new Error("Invalid response from server")
        }
      } catch (markingError: any) {
        // Handle API errors
        const errorResponse = markingError?.response?.data
        let errorMessage = "Failed to mark attendance"
        
        if (errorResponse) {
          // Backend validation error
          if (errorResponse.statusCode === 400) {
            errorMessage = errorResponse.message || "Some employees are not eligible for attendance in the selected month."
          } else {
            errorMessage = errorResponse.message || errorMessage
          }
        }

        setErrors([errorMessage])
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
          duration: 8000,
        })
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "An unexpected error occurred"
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
    
    // Reset form after state is cleared to prevent subscription triggers
    setTimeout(() => {
      form.reset({
        companyId: "",
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

  const selectedCompany = companies.find((c) => c.id === form.watch("companyId"))
  const selectedMonth = form.watch("month")
  const formEmployees = form.watch("employees") || []

  // Fetch attachment status when company or month changes
  useEffect(() => {
    const fetchSheet = async () => {
      const companyId = selectedCompany?.id || form.getValues("companyId")
      const month = selectedMonth || form.getValues("month")
      
      setSheetUrl(null)
      if (!companyId || !month) return
      
      try {
        setSheetLoading(true)
        const res = await attendanceSheetService.get(companyId, format(month, "yyyy-MM"))
        setSheetUrl(res.data?.attendanceSheetUrl || null)
      } catch (e) {
        setSheetUrl(null)
      } finally {
        setSheetLoading(false)
      }
    }
    fetchSheet()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany?.id, selectedMonth])

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mark Attendance by Site</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Mark attendance for employees at specific company locations with our streamlined process
        </p>
      </div>

      {/* Submission Status Alert */}
      {isSubmitted && submissionResult && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Attendance Successfully Submitted</AlertTitle>
          <AlertDescription className="text-green-700">
            <div className="space-y-1">
              <div>✅ {submissionResult.created} employees attendance marked</div>
              {submissionResult.failed > 0 && <div>❌ {submissionResult.failed} failed submissions</div>}
              {submissionResult.fileUploaded && <div>📁 Attendance file uploaded successfully</div>}
              <div className="text-xs mt-2">Submitted at: {submissionResult.timestamp.toLocaleString()}</div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Attachment Status */}
      {selectedCompany && selectedMonth && (
        <Card>
          <CardContent className="pt-6 flex items-center justify-between gap-4">
            <div className="text-sm">
              {sheetLoading ? (
                <span className="text-muted-foreground">Checking attachment...</span>
              ) : sheetUrl ? (
                <span>
                  📎 Sheet attached for <strong>{selectedCompany.name}</strong> — {format(selectedMonth, "MMMM yyyy")} ·
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-blue-600 ml-1"
                    onClick={async () => {
                      if (!sheetUrl) return
                      setPreviewUrl(sheetUrl)
                      setPreviewOpen(true)
                      setPreviewType("loading")
                      
                      // Detect file type by fetching headers
                      try {
                        const response = await fetch(sheetUrl, { method: "HEAD" })
                        const contentType = response.headers.get("Content-Type") || ""
                        const urlLower = sheetUrl.toLowerCase()
                        
                        // Check for PDF first
                        if (contentType.includes("pdf") || urlLower.endsWith(".pdf")) {
                          setPreviewType("pdf")
                          return
                        }
                        
                        // Check for images - be more comprehensive
                        if (
                          contentType.includes("image") ||
                          contentType.includes("jpeg") ||
                          contentType.includes("jpg") ||
                          contentType.includes("png") ||
                          contentType.includes("gif") ||
                          contentType.includes("webp") ||
                          urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)
                        ) {
                          setPreviewType("image")
                          return
                        }
                        
                        // If Content-Type is not helpful, default to trying image first
                        // (many servers return application/octet-stream for images)
                        // The img tag's onError will handle if it's not actually an image
                        if (!contentType || contentType === "application/octet-stream") {
                          setPreviewType("image")
                        } else {
                          setPreviewType("unsupported")
                        }
                      } catch (error) {
                        // Fallback: try to detect from URL
                        console.log("HEAD request failed, using URL detection:", error)
                        const urlLower = sheetUrl.toLowerCase()
                        
                        if (urlLower.endsWith(".pdf")) {
                          setPreviewType("pdf")
                        } else if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)) {
                          setPreviewType("image")
                        } else {
                          // For unknown types, try to load as image first (common case)
                          // If image load fails, it will fall back to unsupported
                          setPreviewType("image")
                        }
                      }
                    }}
                  >
                    View
                  </Button>
                </span>
              ) : (
                <span className="text-muted-foreground">
                  No sheet attached for this month. <a href="/attendance/upload" className="text-blue-600">Upload now</a>
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
              <Clock className="h-5 w-5 text-primary" />
              Progress Tracker
            </CardTitle>
            <Badge variant="outline" className="text-sm px-3 py-1 w-fit">
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
          <div className="hidden lg:block">
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, index) => (
                <div key={step.step} className="flex items-center flex-1">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                      step.status === "completed"
                        ? "bg-primary border-primary text-primary-foreground"
                        : step.status === "current"
                          ? "border-primary text-primary bg-primary/10"
                          : "border-muted-foreground/30 text-muted-foreground",
                    )}
                  >
                    {step.status === "completed" ? <Check className="h-4 w-4" /> : step.icon}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-4 transition-all duration-300",
                        step.status === "completed" ? "bg-primary" : "bg-muted",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-6 gap-4">
              {steps.map((step) => (
                <div key={step.step} className="text-center">
                  <p
                    className={cn(
                      "text-sm font-medium mb-1",
                      step.status === "current"
                        ? "text-primary"
                        : step.status === "completed"
                          ? "text-primary"
                          : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile/Tablet Stepper */}
          <div className="lg:hidden">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                {steps.map((step, index) => (
                  <div
                    key={step.step}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                      step.status === "completed"
                        ? "bg-primary text-primary-foreground"
                        : step.status === "current"
                          ? "border-2 border-primary text-primary bg-primary/10"
                          : "border border-muted-foreground/30 text-muted-foreground",
                    )}
                  >
                    {step.status === "completed" ? <Check className="h-3 w-3" /> : index + 1}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-primary">{steps[currentStep]?.title}</p>
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 0: Select Company */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Select Company
                </CardTitle>
                <CardDescription>Choose the company or site where you want to mark attendance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <Select onValueChange={handleCompanyChange} value={field.value} disabled={loading || isSubmitted}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id ?? ""}>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                {company.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Select the company where employees work</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {loading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading companies...
                  </div>
                )}

                {selectedCompany && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Company Selected</AlertTitle>
                    <AlertDescription>
                      <strong>{selectedCompany.name}</strong> has been selected for attendance marking.
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

                {selectedCompany && selectedMonth && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Selection Summary</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-1">
                        <div>
                          <strong>Company:</strong> {selectedCompany.name}
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

          {/* Step 2: Mark Attendance */}
          {currentStep === 2 && (
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
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center space-y-2">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      <p className="text-sm text-muted-foreground">Loading employees...</p>
                    </div>
                  </div>
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
                    </div>

                    <div className="border rounded-lg overflow-x-auto">
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
                            const selectedCompanyId = form.watch("companyId")
                            const displayInfo = getEmployeeDisplayInfo(employee, selectedCompanyId)

                            return (
                              <TableRow
                                key={employee.id}
                                className={cn(employeeData?.selected && "bg-muted/50")}
                              >
                                <TableCell>
                                  <Checkbox
                                    checked={employeeData?.selected || false}
                                    onCheckedChange={(checked) => handleEmployeeSelection(employee.id, checked as boolean)}
                                    disabled={isSubmitted}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">
                                      {employee.firstName} {employee.lastName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{employee.id}</p>
                                  </div>
                                </TableCell>
                                <TableCell>{displayInfo.department}</TableCell>
                                <TableCell>{displayInfo.designation}</TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="31"
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
                                    className="w-20"
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
                              ? "No active employees found for the selected company and month."
                              : "Please select at least one employee to mark attendance."}
                        </AlertDescription>
                      </Alert>
                    )}
                    {!selectedMonth && form.watch("companyId") && (
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
                    <AlertDescription>No active employees found for the selected company.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Upload File */}
          {currentStep === 3 && (
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
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            onChange(file)
                          }}
                          disabled={isSubmitted}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Upload any file type as attendance proof (PDF, images, documents, etc.)</FormDescription>
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

          {/* Step 4: Review and Submit */}
          {currentStep === 4 && (
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
                    <h4 className="font-medium">Company</h4>
                    <p className="text-sm text-muted-foreground">{selectedCompany?.name}</p>
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
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Present Days</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formEmployees
                          .filter((emp) => emp.selected)
                          .map((emp) => {
                            const employee = employees.find((e) => e.id === emp.employeeId)
                            return (
                              <TableRow key={emp.employeeId}>
                                <TableCell>
                                  {employee?.firstName} {employee?.lastName}
                                </TableCell>
                                <TableCell>{emp.presentCount}</TableCell>
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
          {currentStep < 5 && (
            <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4 -mx-4">
              <Card>
                <CardContent className="pt-6">
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
                      ) : (
                        <Button
                          type="submit"
                          disabled={submitting || selectedEmployees.size === 0 || isSubmitted}
                          className="w-full sm:w-auto"
                        >
                          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isSubmitted ? "Already Submitted" : "Submit Attendance"}
                          <CheckCircle2 className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Success State */}
          {currentStep === 5 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold">Attendance Marked Successfully!</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      The attendance has been recorded for {selectedEmployees.size} employees at {selectedCompany?.name}{" "}
                      for {selectedMonth && format(selectedMonth, "MMMM yyyy")}.
                    </p>
                    {submissionResult && (
                      <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                        <div className="font-medium">Submission Details:</div>
                        <div>✅ {submissionResult.created} employees processed successfully</div>
                        {submissionResult.failed > 0 && <div>❌ {submissionResult.failed} submissions failed</div>}
                        {submissionResult.fileUploaded && <div>📁 Attendance file uploaded</div>}
                        <div className="text-xs text-muted-foreground">
                          Completed at: {submissionResult.timestamp.toLocaleString()}
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

      {/* Document Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span>
                Attendance Sheet - {selectedCompany?.name} - {selectedMonth ? format(selectedMonth, "MMMM yyyy") : ""}
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
                      
                      const filename = `attendance-sheet-${selectedCompany?.name || "sheet"}-${selectedMonth ? format(selectedMonth, "yyyy-MM") : ""}${extension}`
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
          <div className="border rounded-md overflow-hidden bg-white">
            {previewType === "loading" ? (
              <div className="flex items-center justify-center h-[70vh]">
                <div className="text-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading preview...</p>
                </div>
              </div>
            ) : previewType === "pdf" ? (
              <iframe src={previewUrl || ""} className="w-full h-[70vh] border-0" />
            ) : previewType === "image" ? (
              <div className="flex items-center justify-center min-h-[70vh] bg-gray-50 p-4">
                <img
                  src={previewUrl || ""}
                  alt="Attendance Sheet"
                  className="max-w-full max-h-[70vh] object-contain"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error("Image load error:", e, "URL:", previewUrl)
                    // Only switch to unsupported if it's definitely not an image
                    const urlLower = (previewUrl || "").toLowerCase()
                    if (!urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)) {
                      setPreviewType("unsupported")
                    }
                  }}
                  onLoad={() => {
                    console.log("Image loaded successfully:", previewUrl)
                  }}
                />
              </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center space-y-4">
                  <FileText className="h-16 w-16 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">File Preview Not Available</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This file type cannot be previewed in the browser.
                    </p>
                    <Button
                      onClick={async () => {
                        if (!previewUrl) return
                        try {
                          const response = await fetch(previewUrl)
                          if (!response.ok) throw new Error("Failed to download")
                          
                          const blob = await response.blob()
                          const contentType = response.headers.get("Content-Type") || "application/octet-stream"
                          
                          // Detect extension from content type
                          let extension = ""
                          if (contentType.includes("pdf")) extension = ".pdf"
                          else if (contentType.includes("jpeg")) extension = ".jpg"
                          else if (contentType.includes("png")) extension = ".png"
                          else if (contentType.includes("gif")) extension = ".gif"
                          else if (contentType.includes("webp")) extension = ".webp"
                          else if (contentType.includes("word") || contentType.includes("msword")) extension = ".doc"
                          else if (contentType.includes("excel") || contentType.includes("spreadsheet")) extension = ".xlsx"
                          else {
                            // Try to get extension from URL
                            const urlLower = previewUrl.toLowerCase()
                            const match = urlLower.match(/\.([a-z0-9]+)(?:\?|$)/)
                            if (match) extension = `.${match[1]}`
                          }
                          
                          const filename = `attendance-sheet${extension}`
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = filename
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          URL.revokeObjectURL(url)
                        } catch (error) {
                          toast({
                            variant: "destructive",
                            title: "Download Failed",
                            description: "Failed to download the file. Please try again.",
                          })
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" /> Download File
                    </Button>
                  </div>
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

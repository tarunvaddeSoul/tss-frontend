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
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import { attendanceService } from "@/services/attendanceService"
import { companyService } from "@/services/companyService"
import type { Company, CompanyEmployee } from "@/types/company"
import type { BulkMarkAttendanceDto } from "@/types/attendance"
import { MonthPicker } from "../ui/month-picker"

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

export function MarkAttendanceBySite() {
  const [currentStep, setCurrentStep] = useState(0)
  const [companies, setCompanies] = useState<Company[]>([])
  const [employees, setEmployees] = useState<CompanyEmployee[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)

  const { toast } = useToast()

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

  const fetchEmployees = async (companyId: string) => {
    try {
      setLoading(true)
      setErrors([])

      const response = await companyService.getCompanyEmployees(companyId)

      if (!response.data || response.data.length === 0) {
        const errorMsg = "No employees found for this company."
        setErrors([errorMsg])
        toast({
          title: "Warning",
          description: errorMsg,
        })
        setEmployees([])
        return
      }

      const activeEmployees = response.data.filter((emp: CompanyEmployee) => emp.status === "ACTIVE")

      if (activeEmployees.length === 0) {
        const errorMsg = "No active employees found for this company."
        setErrors([errorMsg])
        toast({
          title: "Warning",
          description: errorMsg,
        })
        setEmployees([])
        return
      }

      setEmployees(activeEmployees)

      // Initialize employees form data using the employeeId field for attendance API
      const employeesData = activeEmployees.map((emp: CompanyEmployee) => ({
        employeeId: emp.employeeId, // Use the employeeId field for attendance API
        selected: false,
        presentCount: 0,
      }))
      form.setValue("employees", employeesData)

      toast({
        title: "Success",
        description: `Loaded ${activeEmployees.length} active employees`,
      })
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to fetch employees. Please try again."
      setErrors([errorMsg])
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      })
      console.error("Error fetching employees:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompanyChange = (companyId: string) => {
    form.setValue("companyId", companyId)
    setErrors([])
    if (companyId) {
      fetchEmployees(companyId)
    }
  }

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
    const currentEmployees = form.getValues("employees") || []
    const updatedEmployees = currentEmployees.map((emp) =>
      emp.employeeId === employeeId ? { ...emp, presentCount } : emp,
    )
    form.setValue("employees", updatedEmployees)
  }

  const selectAllEmployees = () => {
    const currentEmployees = form.getValues("employees") || []
    const allSelected = currentEmployees.every((emp) => emp.selected)

    const updatedEmployees = currentEmployees.map((emp) => ({
      ...emp,
      selected: !allSelected,
    }))
    form.setValue("employees", updatedEmployees)

    if (allSelected) {
      setSelectedEmployees(new Set())
      toast({
        title: "Info",
        description: "All employees deselected",
      })
    } else {
      setSelectedEmployees(new Set(currentEmployees.map((emp) => emp.employeeId)))
      toast({
        title: "Info",
        description: "All employees selected",
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

          // Validate present counts
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
        const response = await attendanceService.bulkMarkAttendance(bulkData)

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

        // Set submission result
        const result: SubmissionResult = {
          success: true,
          created: response.data.created,
          failed: response.data.failed,
          fileUploaded,
          timestamp: new Date(),
        }
        setSubmissionResult(result)

        // Mark as submitted to prevent further actions
        setIsSubmitted(true)

        // Show success message
        if (response.data.failed > 0) {
          toast({
            title: "Partial Success",
            description: `Attendance partially completed: ${response.data.created} created, ${response.data.failed} failed`,
          })
        } else {
          toast({
            title: "Success",
            description: `Attendance marked successfully for ${response.data.created} employees!`,
          })
        }

        if (fileUploaded) {
          toast({
            title: "File Upload Success",
            description: "Attendance file uploaded successfully!",
          })
        }

        // Move to success step
        setCurrentStep(5)
        setProgress(100)
      } catch (markingError: any) {
        const markingErrorMsg = markingError?.response?.data?.message || "Failed to mark attendance"
        setErrors([markingErrorMsg])
        toast({
          variant: "destructive",
          title: "Error",
          description: markingErrorMsg,
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
    // Reset all state
    form.reset()
    setCurrentStep(0)
    setProgress(0)
    setEmployees([])
    setSelectedEmployees(new Set())
    setErrors([])
    setIsSubmitted(false)
    setSubmissionResult(null)

    toast({
      title: "New Session Started",
      description: "Form reset successfully. You can now mark new attendance.",
    })
  }

  const selectedCompany = companies.find((c) => c.id === form.watch("companyId"))
  const selectedMonth = form.watch("month")
  const formEmployees = form.watch("employees") || []

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
                          disabled={isSubmitted}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          {selectedEmployees.size === employees.length ? "Deselect All" : "Select All"}
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
                            const employeeData = formEmployees.find((emp) => emp.employeeId === employee.employeeId)
                            return (
                              <TableRow key={employee.id} className={cn(employeeData?.selected && "bg-muted/50")}>
                                <TableCell>
                                  <Checkbox
                                    checked={employeeData?.selected || false}
                                    onCheckedChange={(checked) =>
                                      handleEmployeeSelection(employee.employeeId, checked as boolean)
                                    }
                                    disabled={isSubmitted}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">
                                      {employee.firstName} {employee.lastName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{employee.employeeId}</p>
                                  </div>
                                </TableCell>
                                <TableCell>{employee.department || "N/A"}</TableCell>
                                <TableCell>{employee.designation || "N/A"}</TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="31"
                                    value={employeeData?.presentCount || 0}
                                    onChange={(e) =>
                                      handlePresentCountChange(
                                        employee.employeeId,
                                        Number.parseInt(e.target.value) || 0,
                                      )
                                    }
                                    disabled={!employeeData?.selected || isSubmitted}
                                    className="w-20"
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
                        <AlertDescription>Please select at least one employee to mark attendance.</AlertDescription>
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
                          accept=".xlsx,.xls,.csv,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            onChange(file)
                          }}
                          disabled={isSubmitted}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Supported formats: Excel (.xlsx, .xls), CSV (.csv), PDF (.pdf)</FormDescription>
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
                            const employee = employees.find((e) => e.employeeId === emp.employeeId)
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
    </div>
  )
}

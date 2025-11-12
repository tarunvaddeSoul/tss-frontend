"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Upload, User, Phone, Briefcase, CreditCard, FileText, Building2, CheckCircle2, ChevronLeft, ChevronRight, X, AlertCircle, DollarSign, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { SalaryCategory, SalarySubCategory } from "@/types/salary"
import { salaryRateScheduleService } from "@/services/salaryRateScheduleService"
import { Switch } from "@/components/ui/switch"
import { InlineLoader } from "@/components/ui/loader"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import type { EmployeeFormValues } from "@/types/employee"

interface EmployeeFormProps {
  initialValues?: Partial<EmployeeFormValues>
  onSubmit: (values: EmployeeFormValues) => void
  designations: { value: string; label: string }[]
  employeeDepartments: { value: string; label: string }[]
  companies: { value: string; label: string }[]
  isLoading?: boolean
  onChange?: () => void
}

// Create a schema for form validation - Employment Details are now optional
const employeeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  // Employment Details - all optional
  currentCompanyDesignationId: z.string().optional(),
  currentCompanyDepartmentId: z.string().optional(),
  currentCompanyJoiningDate: z.date().optional(),
  currentCompanyId: z.string().optional(),
  mobileNumber: z.string().regex(/^\d{10}$/, "Invalid mobile number"),
  recruitedBy: z.string().min(1, "Recruiter name is required"),
  gender: z.string().min(1, "Gender is required"),
  status: z.string().default("ACTIVE"),
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  husbandName: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  dateOfBirth: z.date(),
  employeeOnboardingDate: z.date(),
  highestEducationQualification: z.string().min(1, "Education qualification is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  permanentAddress: z.string().min(1, "Permanent address is required"),
  presentAddress: z.string().min(1, "Present address is required"),
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.number().min(1, "Pincode is required"),
  referenceName: z.string().min(1, "Reference name is required"),
  referenceAddress: z.string().min(1, "Reference address is required"),
  referenceNumber: z.string().min(1, "Reference number is required"),
  bankAccountNumber: z.string().min(1, "Bank account number is required"),
  ifscCode: z.string().min(1, "IFSC code is required"),
  bankCity: z.string().min(1, "Bank city is required"),
  bankName: z.string().min(1, "Bank name is required"),
  pfUanNumber: z.string().min(1, "PF UAN number is required"),
  esicNumber: z.string().min(1, "ESIC number is required"),
  policeVerificationNumber: z.string().min(1, "Police verification number is required"),
  policeVerificationDate: z.date(),
  trainingCertificateNumber: z.string().min(1, "Training certificate number is required"),
  trainingCertificateDate: z.date(),
  medicalCertificateNumber: z.string().min(1, "Medical certificate number is required"),
  medicalCertificateDate: z.date(),
  photo: z.any().optional(),
  aadhaar: z.any().optional(),
  panCard: z.any().optional(),
  bankPassbook: z.any().optional(),
  markSheet: z.any().optional(),
  otherDocument: z.any().optional(),
  otherDocumentRemarks: z.string().optional(),
  aadhaarNumber: z.string().regex(/^\d{12}$/, "Invalid Aadhaar number"),
  // NEW: Salary fields
  salaryCategory: z.nativeEnum(SalaryCategory).optional().nullable(),
  salarySubCategory: z.nativeEnum(SalarySubCategory).optional().nullable(),
  salaryPerDay: z.number().min(0.01, "Rate per day must be greater than 0").optional().nullable(),
  monthlySalary: z.number().min(0.01, "Monthly salary must be greater than 0").optional().nullable(),
  pfEnabled: z.boolean().default(false),
  esicEnabled: z.boolean().default(false),
}).refine(
  (data) => {
    // If salaryCategory is CENTRAL or STATE, salarySubCategory is required
    if (data.salaryCategory === SalaryCategory.CENTRAL || data.salaryCategory === SalaryCategory.STATE) {
      return !!data.salarySubCategory
    }
    return true
  },
  {
    message: "Subcategory is required for CENTRAL and STATE categories",
    path: ["salarySubCategory"],
  }
).refine(
  (data) => {
    // If salaryCategory is CENTRAL or STATE, salaryPerDay is required
    if (data.salaryCategory === SalaryCategory.CENTRAL || data.salaryCategory === SalaryCategory.STATE) {
      return data.salaryPerDay !== null && data.salaryPerDay !== undefined && data.salaryPerDay > 0
    }
    return true
  },
  {
    message: "Rate per day is required for CENTRAL and STATE categories",
    path: ["salaryPerDay"],
  }
).refine(
  (data) => {
    // If salaryCategory is SPECIALIZED, monthlySalary is required
    if (data.salaryCategory === SalaryCategory.SPECIALIZED) {
      return data.monthlySalary !== null && data.monthlySalary !== undefined && data.monthlySalary > 0
    }
    return true
  },
  {
    message: "Monthly salary is required for SPECIALIZED category",
    path: ["monthlySalary"],
  }
)

// Add date formatting utility
const formatDateToDDMMYYYY = (date: Date) => {
  return format(date, "dd-MM-yyyy")
}

const parseDateFromDDMMYYYY = (dateString: string) => {
  const [day, month, year] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function EmployeeForm({
  initialValues,
  onSubmit,
  designations,
  employeeDepartments,
  companies,
  isLoading = false,
  onChange,
}: EmployeeFormProps) {
  const { toast } = useToast()
  const [gender, setGender] = useState(initialValues?.gender || "")
  const [sameAsPermanent, setSameAsPermanent] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [stepsWithErrors, setStepsWithErrors] = useState<Set<number>>(new Set())
  const [isExplicitSubmit, setIsExplicitSubmit] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Define form steps
  const steps = [
    { id: "basic", title: "Basic Information", icon: User, description: "Personal details and contact information" },
    { id: "salary", title: "Salary", icon: DollarSign, description: "Salary configuration" },
    { id: "employment", title: "Employment", icon: Briefcase, description: "Employment details (optional)", optional: true },
    { id: "bank", title: "Bank Details", icon: CreditCard, description: "Banking information" },
    { id: "additional", title: "Additional Details", icon: FileText, description: "PF, ESIC, and certificates" },
    { id: "reference", title: "Reference", icon: Building2, description: "Reference information" },
    { id: "documents", title: "Documents", icon: FileText, description: "Upload documents" },
  ]

  // Initialize the form with default values
  const form = useForm<z.infer<typeof employeeFormSchema>>({
    resolver: zodResolver(employeeFormSchema),
    mode: "onChange", // Validate on change for immediate feedback
    defaultValues: {
      title: initialValues?.title || "",
      firstName: initialValues?.firstName || "",
      lastName: initialValues?.lastName || "",
      currentCompanyDesignationId: initialValues?.currentCompanyDesignationId || "",
      currentCompanyDepartmentId: initialValues?.currentCompanyDepartmentId || "",
      currentCompanyJoiningDate: initialValues?.currentCompanyJoiningDate
        ? new Date(initialValues.currentCompanyJoiningDate)
        : new Date(),
      mobileNumber: initialValues?.mobileNumber || "",
      currentCompanyId: initialValues?.currentCompanyId || "",
      recruitedBy: initialValues?.recruitedBy || "",
      gender: initialValues?.gender || "",
      status: initialValues?.status || "ACTIVE",
      fatherName: initialValues?.fatherName || "",
      motherName: initialValues?.motherName || "",
      husbandName: initialValues?.husbandName || "",
      category: initialValues?.category || "",
      dateOfBirth: initialValues?.dateOfBirth ? new Date(initialValues.dateOfBirth) : new Date(),
      employeeOnboardingDate: initialValues?.employeeOnboardingDate
        ? new Date(initialValues.employeeOnboardingDate)
        : new Date(),
      highestEducationQualification: initialValues?.highestEducationQualification || "",
      bloodGroup: initialValues?.bloodGroup || "",
      permanentAddress: initialValues?.permanentAddress || "",
      presentAddress: initialValues?.presentAddress || "",
      city: initialValues?.city || "",
      district: initialValues?.district || "",
      state: initialValues?.state || "",
      pincode: initialValues?.pincode || 0,
      referenceName: initialValues?.referenceName || "",
      referenceAddress: initialValues?.referenceAddress || "",
      referenceNumber: initialValues?.referenceNumber || "",
      bankAccountNumber: initialValues?.bankAccountNumber || "",
      ifscCode: initialValues?.ifscCode || "",
      bankCity: initialValues?.bankCity || "",
      bankName: initialValues?.bankName || "",
      pfUanNumber: initialValues?.pfUanNumber || "",
      esicNumber: initialValues?.esicNumber || "",
      policeVerificationNumber: initialValues?.policeVerificationNumber || "",
      policeVerificationDate: initialValues?.policeVerificationDate
        ? new Date(initialValues.policeVerificationDate)
        : new Date(),
      trainingCertificateNumber: initialValues?.trainingCertificateNumber || "",
      trainingCertificateDate: initialValues?.trainingCertificateDate
        ? new Date(initialValues.trainingCertificateDate)
        : new Date(),
      medicalCertificateNumber: initialValues?.medicalCertificateNumber || "",
      medicalCertificateDate: initialValues?.medicalCertificateDate
        ? new Date(initialValues.medicalCertificateDate)
        : new Date(),
      photo: initialValues?.photo || null,
      aadhaar: initialValues?.aadhaar || null,
      panCard: initialValues?.panCard || null,
      bankPassbook: initialValues?.bankPassbook || null,
      markSheet: initialValues?.markSheet || null,
      otherDocument: initialValues?.otherDocument || null,
      otherDocumentRemarks: initialValues?.otherDocumentRemarks || "",
      aadhaarNumber: initialValues?.aadhaarNumber || "",
      // NEW: Salary fields
      salaryCategory: initialValues?.salaryCategory || null,
      salarySubCategory: initialValues?.salarySubCategory || null,
      salaryPerDay: initialValues?.salaryPerDay || null,
      monthlySalary: initialValues?.monthlySalary || null,
      pfEnabled: initialValues?.pfEnabled ?? false,
      esicEnabled: initialValues?.esicEnabled ?? false,
    },
  })

  // State for active rate loading
  const [loadingActiveRate, setLoadingActiveRate] = useState(false)
  const [activeRate, setActiveRate] = useState<number | null>(null)
  const [rateError, setRateError] = useState<string | null>(null)

  // Watch salary category and subcategory to fetch active rate
  const salaryCategory = form.watch("salaryCategory")
  const salarySubCategory = form.watch("salarySubCategory")
  const employeeOnboardingDate = form.watch("employeeOnboardingDate")

  // Fetch active rate when category/subcategory changes
  useEffect(() => {
    const fetchActiveRate = async () => {
      if (
        (salaryCategory === SalaryCategory.CENTRAL || salaryCategory === SalaryCategory.STATE) &&
        salarySubCategory &&
        employeeOnboardingDate
      ) {
        setLoadingActiveRate(true)
        setRateError(null)
        try {
          const dateString = format(employeeOnboardingDate, "yyyy-MM-dd")
          const response = await salaryRateScheduleService.getActiveRate({
            category: salaryCategory,
            subCategory: salarySubCategory,
            date: dateString,
          })
          
          // API returns an array of active rate schedules
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            // Get the first active rate (or find the one with effectiveTo === null for current active)
            const activeRateSchedule = response.data.find((rate) => rate.effectiveTo === null) || response.data[0]
            setActiveRate(activeRateSchedule.ratePerDay)
            // Auto-populate salaryPerDay if not manually set
            const currentSalaryPerDay = form.getValues("salaryPerDay")
            if (!currentSalaryPerDay || currentSalaryPerDay === 0) {
              form.setValue("salaryPerDay", activeRateSchedule.ratePerDay)
            }
          } else {
            setActiveRate(null)
            setRateError("No active rate schedule found for this category and date")
          }
        } catch (error: any) {
          setActiveRate(null)
          setRateError(error.message || "Failed to fetch active rate")
        } finally {
          setLoadingActiveRate(false)
        }
      } else {
        setActiveRate(null)
        setRateError(null)
      }
    }

    fetchActiveRate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salaryCategory, salarySubCategory, employeeOnboardingDate])

  useEffect(() => {
    const subscription = form.watch(() => {
      onChange?.()
    })
    return () => subscription.unsubscribe()
  }, [form, onChange])

  // Validate all steps and identify which steps have errors
  const validateAllSteps = () => {
    const errors = form.formState.errors
    const errorSteps = new Set<number>()
    
    // Define which fields belong to which step
    const stepFields: Record<number, (keyof z.infer<typeof employeeFormSchema>)[]> = {
      0: ['title', 'firstName', 'lastName', 'gender', 'dateOfBirth', 'mobileNumber', 'fatherName', 'motherName', 'category', 'bloodGroup', 'highestEducationQualification', 'permanentAddress', 'presentAddress', 'city', 'district', 'state', 'pincode', 'recruitedBy', 'employeeOnboardingDate', 'aadhaarNumber'], // Basic Information
      1: ['salaryCategory', 'salarySubCategory', 'salaryPerDay', 'monthlySalary', 'pfEnabled', 'esicEnabled'], // Salary Configuration
      2: [], // Employment (optional)
      3: ['bankAccountNumber', 'ifscCode', 'bankName', 'bankCity'], // Bank Details
      4: ['pfUanNumber', 'esicNumber', 'policeVerificationNumber', 'policeVerificationDate', 'trainingCertificateNumber', 'trainingCertificateDate', 'medicalCertificateNumber', 'medicalCertificateDate'], // Additional Details
      5: ['referenceName', 'referenceAddress', 'referenceNumber'], // Reference
      6: [], // Documents (optional)
    }
    
    // Check each step for errors
    Object.keys(stepFields).forEach((stepIndex) => {
      const stepNum = parseInt(stepIndex)
      const fields = stepFields[stepNum]
      
      // Skip optional steps (employment, documents)
      if (stepNum === 2 || stepNum === 6) return
      
      const hasError = fields.some((field) => errors[field])
      if (hasError) {
        errorSteps.add(stepNum)
      }
    })
    
    setStepsWithErrors(errorSteps)
    return errorSteps.size === 0
  }

  // Find first error field and scroll to it
  const scrollToFirstError = () => {
    const errors = form.formState.errors
    const fieldNames = Object.keys(errors) as (keyof typeof errors)[]
    
    if (fieldNames.length > 0) {
      const firstErrorField = fieldNames[0]
      
      // Find which step contains this field
      const stepFields: Record<number, string[]> = {
        0: ['title', 'firstName', 'lastName', 'gender', 'dateOfBirth', 'mobileNumber', 'fatherName', 'motherName', 'category', 'bloodGroup', 'highestEducationQualification', 'permanentAddress', 'presentAddress', 'city', 'district', 'state', 'pincode', 'recruitedBy', 'employeeOnboardingDate', 'aadhaarNumber'],
        1: ['salaryCategory', 'salarySubCategory', 'salaryPerDay', 'monthlySalary', 'pfEnabled', 'esicEnabled'],
        3: ['bankAccountNumber', 'ifscCode', 'bankName', 'bankCity'],
        4: ['pfUanNumber', 'esicNumber', 'policeVerificationNumber', 'policeVerificationDate', 'trainingCertificateNumber', 'trainingCertificateDate', 'medicalCertificateNumber', 'medicalCertificateDate'],
        5: ['referenceName', 'referenceAddress', 'referenceNumber'],
      }
      
      let targetStep = 0
      for (const [stepIndex, fields] of Object.entries(stepFields)) {
        if (fields.includes(firstErrorField)) {
          targetStep = parseInt(stepIndex)
          break
        }
      }
      
      // Navigate to step with error
      setCurrentStep(targetStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      // Try to scroll to the actual field
      setTimeout(() => {
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`)
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          ;(errorElement as HTMLElement).focus()
        }
      }, 300)
    }
  }

  // Handle form submission
  const handleFormSubmit = async (values: z.infer<typeof employeeFormSchema>) => {
    // Trigger validation
    const isValid = await form.trigger()
    
    if (!isValid) {
      // Validate all steps to show error indicators
      validateAllSteps()
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields. Check the highlighted steps for errors.",
      })
      
      // Scroll to first error
      scrollToFirstError()
      
      return
    }
    
    try {
      // Format dates to DD-MM-YYYY
      // Remove salaryPerDay - it's auto-calculated by backend from SalaryRateSchedule
      // Remove monthlySalary if not SPECIALIZED category
      const { salaryPerDay, monthlySalary, ...restValues } = values
      
      const formattedValues = {
        ...restValues,
        dateOfBirth: formatDateToDDMMYYYY(values.dateOfBirth),
        employeeOnboardingDate: formatDateToDDMMYYYY(values.employeeOnboardingDate),
        policeVerificationDate: formatDateToDDMMYYYY(values.policeVerificationDate),
        trainingCertificateDate: formatDateToDDMMYYYY(values.trainingCertificateDate),
        medicalCertificateDate: formatDateToDDMMYYYY(values.medicalCertificateDate),
        currentCompanyJoiningDate: values.currentCompanyJoiningDate 
          ? formatDateToDDMMYYYY(values.currentCompanyJoiningDate)
          : undefined,
        // Only include monthlySalary if category is SPECIALIZED
        ...(values.salaryCategory === SalaryCategory.SPECIALIZED && monthlySalary ? { monthlySalary } : {}),
      }

      await onSubmit(formattedValues as unknown as EmployeeFormValues)
      
      // Clear error indicators
      setStepsWithErrors(new Set())
    } catch (error) {
      console.error("Form submission error:", error)
      
      // Handle different types of errors
      let errorMessage = "Failed to save employee details. Please try again."
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message)
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    }
  }
  
  // Watch for form errors and update step indicators
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    const subscription = form.watch(() => {
      // Debounce validation updates
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        validateAllSteps()
      }, 500)
    })
    
    // Initial validation
    validateAllSteps()
    
    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formState.errors])

  // Handle same as permanent address checkbox
  const handleSameAsPermanentChange = (checked: boolean) => {
    setSameAsPermanent(checked)
    if (checked) {
      form.setValue("presentAddress", form.getValues("permanentAddress"))
    }
  }

  // Handle gender change
  const handleGenderChange = (value: string) => {
    setGender(value || "")
    form.setValue("gender", value || "")
  }

  // Navigation handlers
  const handleNext = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrevious = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Helper to make Select clearable - wraps with FormControl for use in FormField
  const ClearableSelect = ({ field, placeholder, children }: any) => {
    const handleValueChange = (value: string) => {
      if (value === "__clear__") {
        // Set to undefined to properly clear
        field.onChange(undefined)
      } else {
        field.onChange(value)
      }
    }
    
    // Check if field has a value (not empty string or undefined)
    const hasValue = field.value && field.value !== ""
    
    return (
      <FormControl>
        <Select
          value={hasValue ? String(field.value) : undefined}
          onValueChange={handleValueChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {hasValue && (
              <>
                <SelectItem 
                  value="__clear__" 
                  className="text-muted-foreground focus:text-muted-foreground hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    <span>Clear selection</span>
                  </div>
                </SelectItem>
                <SelectSeparator />
              </>
            )}
            {children}
          </SelectContent>
        </Select>
      </FormControl>
    )
  }

  // Helper to make DatePicker clearable (DatePicker already has built-in clear button)
  const ClearableDatePicker = ({ field, label, required }: any) => {
    const handleDateSelect = (date: Date | null) => {
      // DatePicker passes null when cleared, we convert to undefined for form
      field.onChange(date || undefined)
    }
    
    // Use nullish coalescing to properly handle undefined/null conversion
    const dateValue = field.value ?? null
    
    return (
      <FormItem className="flex flex-col">
        <FormLabel>
          {typeof label === 'string' ? label : label}
          {required && <span className="text-red-500">*</span>}
        </FormLabel>
        <DatePicker 
          key={`date-${dateValue ? dateValue.getTime() : 'null'}`}
          date={dateValue} 
          onSelect={handleDateSelect} 
        />
        <FormMessage />
      </FormItem>
    )
  }

  const titleOptions = [
    { value: "MR", label: "MR" },
    { value: "MS", label: "MS" },
  ]

  const statusOptions = [
    { value: "ACTIVE", label: "ACTIVE" },
    { value: "INACTIVE", label: "INACTIVE" },
  ]

  const genderOptions = [
    { value: "MALE", label: "MALE" },
    { value: "FEMALE", label: "FEMALE" },
  ]

  const categoryOptions = [
    { value: "SC", label: "SC" },
    { value: "ST", label: "ST" },
    { value: "OBC", label: "OBC" },
    { value: "GENERAL", label: "GENERAL" },
  ]

  const educationQualificationOptions = [
    { value: "UNDER_8", label: "UNDER 8" },
    { value: "EIGHT", label: "8TH" },
    { value: "TEN", label: "10TH" },
    { value: "TWELVE", label: "12TH" },
    { value: "GRADUATE", label: "GRADUATE" },
    { value: "POST_GRADUATE", label: "POST GRADUATE" },
  ]

  // Calculate form completion progress
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const calculateProgress = () => {
      const formValues = form.getValues()
      const totalFields = 40 // Approximate total required fields
      let completedFields = 0

      // Basic Details
      if (formValues.firstName && formValues.lastName && formValues.title) completedFields += 3
      if (formValues.dateOfBirth) completedFields++
      if (formValues.gender) completedFields++
      if (formValues.fatherName) completedFields++
      if (formValues.motherName) completedFields++
      if (formValues.bloodGroup) completedFields++
      if (formValues.employeeOnboardingDate) completedFields++
      if (formValues.status) completedFields++
      if (formValues.recruitedBy) completedFields++
      if (formValues.highestEducationQualification) completedFields++
      if (formValues.category) completedFields++

      // Contact Details
      if (formValues.mobileNumber && formValues.mobileNumber.length === 10) completedFields++
      if (formValues.aadhaarNumber && formValues.aadhaarNumber.length === 12) completedFields++
      if (formValues.permanentAddress) completedFields++
      if (formValues.presentAddress) completedFields++
      if (formValues.city) completedFields++
      if (formValues.district) completedFields++
      if (formValues.state) completedFields++
      if (formValues.pincode) completedFields++

      // Bank Details
      if (formValues.bankAccountNumber) completedFields++
      if (formValues.ifscCode) completedFields++
      if (formValues.bankName) completedFields++
      if (formValues.bankCity) completedFields++

      // Additional Details
      if (formValues.pfUanNumber) completedFields++
      if (formValues.esicNumber) completedFields++
      if (formValues.policeVerificationNumber) completedFields++
      if (formValues.policeVerificationDate) completedFields++
      if (formValues.trainingCertificateNumber) completedFields++
      if (formValues.trainingCertificateDate) completedFields++
      if (formValues.medicalCertificateNumber) completedFields++
      if (formValues.medicalCertificateDate) completedFields++

      // Reference Details
      if (formValues.referenceName) completedFields++
      if (formValues.referenceAddress) completedFields++
      if (formValues.referenceNumber) completedFields++

      return Math.round((completedFields / totalFields) * 100)
    }

    const subscription = form.watch(() => {
      setProgress(calculateProgress())
    })
    // Initial calculation
    setProgress(calculateProgress())
    return () => subscription.unsubscribe()
  }, [form])

  const CurrentStepIcon = steps[currentStep]?.icon || User

  // Calculate total errors
  const totalErrors = Object.keys(form.formState.errors).length

  return (
    <Form {...form}>
      <form 
        id="employee-form" 
        ref={formRef} 
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          
          // Only submit if:
          // 1. We're on the last step (Documents)
          // 2. The submit was triggered by the Submit button explicitly
          const submitEvent = e.nativeEvent as SubmitEvent
          const submitter = submitEvent.submitter as HTMLButtonElement | null
          
          if (
            currentStep === steps.length - 1 && 
            (isExplicitSubmit || (submitter && submitter.type === 'submit'))
          ) {
            setIsExplicitSubmit(false) // Reset flag
            form.handleSubmit(handleFormSubmit)(e)
          }
        }}
        onKeyDown={(e) => {
          // Prevent form submission on Enter key unless explicitly on Submit button
          if (e.key === 'Enter') {
            const target = e.target as HTMLElement
            const isSubmitButton = target.closest('button[type="submit"]')
            const isTextarea = target.tagName === 'TEXTAREA'
            const isInput = target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'submit'
            
            // Only allow Enter on Submit button or textarea
            if (!isSubmitButton && !isTextarea && isInput) {
              e.preventDefault()
              e.stopPropagation()
            }
          }
        }}
        className="space-y-6"
      >
        {/* Validation Error Alert */}
        {totalErrors > 0 && (
          <Alert variant="destructive" className="border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Errors</AlertTitle>
            <AlertDescription>
              Please fix {totalErrors} error{totalErrors > 1 ? 's' : ''} in the form before submitting. 
              {stepsWithErrors.size > 0 && (
                <span> Check step{stepsWithErrors.size > 1 ? 's' : ''}: {Array.from(stepsWithErrors).map(i => steps[i].title).join(', ')}</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Indicator */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Form Completion</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              
              {/* Step Indicator */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <CurrentStepIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.title}
                  </span>
                  {steps[currentStep]?.optional && (
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  )}
                </div>
              </div>
              
              {/* Visual Stepper */}
              <div className="flex items-center justify-between pt-2">
                {steps.map((step, index) => {
                  const StepIcon = step.icon
                  const isActive = index === currentStep
                  const isCompleted = index < currentStep
                  // All steps are always clickable to allow free navigation
                  const isClickable = true
                  
                  return (
                    <div key={step.id} className="flex items-center flex-1">
                      <div
                        onClick={() => handleStepClick(index)}
                        className={cn(
                          "flex flex-col items-center cursor-pointer transition-all relative w-full",
                          "hover:opacity-80"
                        )}
                      >
                        {/* Icon Container with Optional Badge Overlay */}
                        <div className="relative mb-2">
                          <div
                            className={cn(
                              "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all relative",
                              isActive && "border-primary bg-primary text-primary-foreground",
                              isCompleted && !stepsWithErrors.has(index) && "border-green-500 bg-green-500 text-white",
                              stepsWithErrors.has(index) && "border-destructive bg-destructive/10 text-destructive border-2",
                              !isActive && !isCompleted && !stepsWithErrors.has(index) && "border-muted bg-background"
                            )}
                          >
                            {stepsWithErrors.has(index) ? (
                              <AlertCircle className="h-5 w-5" />
                            ) : (
                              <StepIcon className="h-5 w-5" />
                            )}
                          </div>
                          {/* Optional Badge as Overlay on Icon */}
                          {step.optional && (
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                              <Badge 
                                variant="outline" 
                                className="text-[10px] px-1.5 py-0 h-4 bg-background/95 backdrop-blur-sm border-primary/30"
                              >
                                Opt
                              </Badge>
                            </div>
                          )}
                          {/* Error Indicator */}
                          {stepsWithErrors.has(index) && (
                            <div className="absolute -top-1 -right-1">
                              <div className="w-3 h-3 bg-destructive rounded-full border-2 border-background" />
                            </div>
                          )}
                        </div>
                        {/* Title with Fixed Height for Alignment */}
                        <div className="text-center min-h-[2.5rem] flex flex-col items-center justify-start">
                          <div className={cn(
                            "text-xs font-medium leading-tight",
                            isActive && "text-primary",
                            isCompleted && !stepsWithErrors.has(index) && "text-green-600",
                            stepsWithErrors.has(index) && "text-destructive font-semibold",
                            !isActive && !isCompleted && !stepsWithErrors.has(index) && "text-muted-foreground"
                          )}>
                            {step.title}
                          </div>
                          {stepsWithErrors.has(index) && (
                            <Badge variant="destructive" className="mt-1 text-[10px] px-1.5 py-0 h-4">Errors</Badge>
                          )}
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={cn(
                            "h-0.5 mx-2 flex-1 transition-all",
                            isCompleted ? "bg-green-500" : "bg-muted"
                          )}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {currentStep === 0 && (
          /* Step 1: Basic Information (merged Basic + Contact) */
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Basic Information</CardTitle>
              </div>
              <CardDescription>Enter personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
                    <ClearableSelect field={field} placeholder="Select title">
                      {titleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </ClearableSelect>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <ClearableDatePicker field={field} label="Date of Birth" required />
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Select
                        value={field.value && field.value !== "" ? field.value : undefined}
                        onValueChange={(value) => {
                          if (value === "__clear__") {
                            field.onChange("")
                            setGender("")
                            // Trigger validation immediately
                            form.trigger("gender")
                          } else {
                            // Update field value directly for immediate validation
                            field.onChange(value)
                            setGender(value)
                            // Trigger validation immediately
                            form.trigger("gender")
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.value && field.value !== "" && (
                            <>
                              <SelectItem 
                                value="__clear__" 
                                className="text-muted-foreground focus:text-muted-foreground hover:bg-muted"
                              >
                                <div className="flex items-center gap-2">
                                  <X className="h-4 w-4" />
                                  <span>Clear selection</span>
                                </div>
                              </SelectItem>
                              <SelectSeparator />
                            </>
                          )}
                          {genderOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fatherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father's Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter father's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="motherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mother's Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mother's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {gender === "FEMALE" && (
                <FormField
                  control={form.control}
                  name="husbandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Husband's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter husband's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter blood group" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employeeOnboardingDate"
                render={({ field }) => (
                  <ClearableDatePicker field={field} label="Employee Onboarding Date" required />
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                    <ClearableSelect field={field} placeholder="Select status">
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </ClearableSelect>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recruitedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recruited By <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter recruiter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="highestEducationQualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Highest Education Qualification <span className="text-red-500">*</span></FormLabel>
                    <ClearableSelect field={field} placeholder="Select qualification">
                      {educationQualificationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </ClearableSelect>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                    <ClearableSelect field={field} placeholder="Select category">
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </ClearableSelect>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
              </div>
              
              {/* Contact Details Section */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-semibold">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="aadhaarNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhaar Number <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Aadhaar number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="permanentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permanent Address <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter permanent address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox id="sameAsPermanent" checked={sameAsPermanent} onCheckedChange={handleSameAsPermanentChange} />
              <label
                htmlFor="sameAsPermanent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Present address same as permanent address
              </label>
            </div>
            <FormField
              control={form.control}
              name="presentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Present Address <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter present address" {...field} disabled={sameAsPermanent} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter district" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter state" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter pincode"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 1 && (
          /* Step 2: Salary Configuration */
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle>Salary Configuration</CardTitle>
              </div>
              <CardDescription>Configure employee salary category and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="salaryCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary Category *</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={(value) => {
                        field.onChange(value === "" ? null : value)
                        // Clear dependent fields when category changes
                        if (value === SalaryCategory.SPECIALIZED) {
                          form.setValue("salarySubCategory", null)
                          form.setValue("salaryPerDay", null)
                        } else {
                          form.setValue("monthlySalary", null)
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select salary category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SalaryCategory.CENTRAL}>CENTRAL</SelectItem>
                        <SelectItem value={SalaryCategory.STATE}>STATE</SelectItem>
                        <SelectItem value={SalaryCategory.SPECIALIZED}>SPECIALIZED</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(salaryCategory === SalaryCategory.CENTRAL || salaryCategory === SalaryCategory.STATE) && (
                <>
                  <FormField
                    control={form.control}
                    name="salarySubCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory *</FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => {
                            field.onChange(value === "" ? null : value)
                            // Clear salaryPerDay when subcategory changes to trigger rate fetch
                            form.setValue("salaryPerDay", null)
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subcategory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={SalarySubCategory.SKILLED}>SKILLED</SelectItem>
                            <SelectItem value={SalarySubCategory.UNSKILLED}>UNSKILLED</SelectItem>
                            <SelectItem value={SalarySubCategory.HIGHSKILLED}>HIGHSKILLED</SelectItem>
                            <SelectItem value={SalarySubCategory.SEMISKILLED}>SEMISKILLED</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {loadingActiveRate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <InlineLoader size="sm" />
                      <span>Fetching active rate...</span>
                    </div>
                  )}

                  {activeRate && !loadingActiveRate && (
                    <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <AlertDescription className="text-blue-800 dark:text-blue-200">
                        Active rate for {salaryCategory} - {salarySubCategory}: ₹{activeRate.toLocaleString()}/day
                        {form.getValues("salaryPerDay") !== activeRate && (
                          <span className="ml-2 text-xs">(You can override this value manually)</span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {rateError && !loadingActiveRate && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{rateError}</AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="salaryPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate Per Day (₹) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="Enter rate per day"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                        {activeRate && !loadingActiveRate && (
                          <p className="text-xs text-muted-foreground">
                            Leave empty to use active rate: ₹{activeRate.toLocaleString()}/day
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </>
              )}

              {salaryCategory === SalaryCategory.SPECIALIZED && (
                <FormField
                  control={form.control}
                  name="monthlySalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Salary (₹) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="Enter monthly salary"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="pfEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">PF Enabled</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable Provident Fund deduction
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="esicEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">ESIC Enabled</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable ESIC deduction
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          /* Step 3: Employment Details - Optional */
          <Card className="border-dashed">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Employment Details</CardTitle>
                  <Badge variant="outline" className="ml-2">Optional</Badge>
                </div>
                <CardDescription>Employment information can be added later if not available now</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="currentCompanyJoiningDate"
                render={({ field }) => (
                  <ClearableDatePicker field={field} label="Company Date of Joining" />
                )}
              />
              <FormField
                control={form.control}
                name="currentCompanyDesignationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <ClearableSelect field={field} placeholder="Select designation">
                      {designations.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </ClearableSelect>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentCompanyDepartmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Department</FormLabel>
                    <ClearableSelect field={field} placeholder="Select department">
                      {employeeDepartments.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </ClearableSelect>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentCompanyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <ClearableSelect field={field} placeholder="Select company">
                      {companies.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </ClearableSelect>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
              </CardContent>
            </Card>
        )}

        {currentStep === 3 && (
          /* Step 4: Bank Details */
          <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <CardTitle>Bank Details</CardTitle>
                </div>
                <CardDescription>Enter banking information for salary processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="bankAccountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Account Number <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter bank account number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ifscCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Code <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter IFSC code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter bank name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank City <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter bank city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
              </CardContent>
            </Card>
        )}

        {currentStep === 4 && (
          /* Step 5: Additional Details */
          <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>Additional Details</CardTitle>
                </div>
                <CardDescription>Provide PF, ESIC, and certificate information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="pfUanNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PF UAN Number <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter PF UAN number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="esicNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ESIC Number <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter ESIC number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="policeVerificationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Police Verification Number <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter police verification number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="policeVerificationDate"
                render={({ field }) => (
                  <ClearableDatePicker field={field} label="Police Verification Date" required />
                )}
              />
              <FormField
                control={form.control}
                name="trainingCertificateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Training Certificate Number <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter training certificate number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trainingCertificateDate"
                render={({ field }) => (
                  <ClearableDatePicker field={field} label="Training Certificate Date" required />
                )}
              />
              <FormField
                control={form.control}
                name="medicalCertificateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Certificate Number <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter medical certificate number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medicalCertificateDate"
                render={({ field }) => (
                  <ClearableDatePicker field={field} label="Medical Certificate Date" required />
                )}
              />
            </div>
              </CardContent>
            </Card>
        )}

        {currentStep === 5 && (
          /* Step 5: Reference Details */
          <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle>Reference Details</CardTitle>
                </div>
                <CardDescription>Provide reference person information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="referenceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter reference name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="referenceAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Address <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter reference address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter reference number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 6 && (
          /* Step 7: Documents */
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Document Uploads</CardTitle>
              </div>
              <CardDescription>Upload required documents and certificates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="photo"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Photo Upload</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            onChange(file || null)
                          }}
                          {...field}
                        />
                        <Upload className="h-4 w-4" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="aadhaar"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Aadhaar Upload</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            onChange(file || null)
                          }}
                          {...field}
                        />
                        <Upload className="h-4 w-4" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="panCard"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>PAN Card Upload</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            onChange(file || null)
                          }}
                          {...field}
                        />
                        <Upload className="h-4 w-4" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankPassbook"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Bank Passbook</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            onChange(file || null)
                          }}
                          {...field}
                        />
                        <Upload className="h-4 w-4" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="markSheet"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Mark Sheet</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            onChange(file || null)
                          }}
                          {...field}
                        />
                        <Upload className="h-4 w-4" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="otherDocument"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Other Document</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            onChange(file || null)
                          }}
                          {...field}
                        />
                        <Upload className="h-4 w-4" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("otherDocument") && (
                <FormField
                  control={form.control}
                  name="otherDocumentRemarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Document Remarks</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter remarks for the other document" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handlePrevious(e)
                }}
                disabled={currentStep === 0 || isLoading}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="text-sm text-muted-foreground text-center">
                {progress === 100 && currentStep === steps.length - 1 ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Ready to submit!</span>
                  </div>
                ) : (
                  <span>Step {currentStep + 1} of {steps.length}</span>
                )}
              </div>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleNext(e)
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  size="lg" 
                  className="min-w-[120px]"
                  onClick={(e) => {
                    // Mark as explicit submit when button is clicked
                    setIsExplicitSubmit(true)
                  }}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}

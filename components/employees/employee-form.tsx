"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

// Create a schema for form validation
const employeeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  currentCompanyDesignationId: z.string().optional(),
  currentCompanyDepartmentId: z.string().optional(),
  currentCompanyJoiningDate: z.date().optional(),
  mobileNumber: z.string().regex(/^\d{10}$/, "Invalid mobile number"),
  currentCompanyId: z.string().optional(),
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
  currentCompanySalary: z.number().optional(),
  aadhaarNumber: z.string().regex(/^\d{12}$/, "Invalid Aadhaar number"),
})

// Add date formatting utility
const formatDateToDDMMYYYY = (date: Date) => {
  return format(date, "dd-MM-yyyy")
}

const parseDateFromDDMMYYYY = (dateString: string) => {
  const [day, month, year] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day)
}

// Add localStorage key constant
const FORM_STORAGE_KEY = "employee_form_data"

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

  // Initialize the form with default values
  const form = useForm<z.infer<typeof employeeFormSchema>>({
    resolver: zodResolver(employeeFormSchema),
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
      currentCompanySalary: initialValues?.currentCompanySalary || 0,
      aadhaarNumber: initialValues?.aadhaarNumber || "",
    },
  })

  // Load saved form data on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem(FORM_STORAGE_KEY)
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData)
        // Convert string dates back to Date objects
        const formDataWithDates = {
          ...parsedData,
          dateOfBirth: parsedData.dateOfBirth ? new Date(parsedData.dateOfBirth) : new Date(),
          employeeOnboardingDate: parsedData.employeeOnboardingDate ? new Date(parsedData.employeeOnboardingDate) : new Date(),
          policeVerificationDate: parsedData.policeVerificationDate ? new Date(parsedData.policeVerificationDate) : new Date(),
          trainingCertificateDate: parsedData.trainingCertificateDate ? new Date(parsedData.trainingCertificateDate) : new Date(),
          medicalCertificateDate: parsedData.medicalCertificateDate ? new Date(parsedData.medicalCertificateDate) : new Date(),
          currentCompanyJoiningDate: parsedData.currentCompanyJoiningDate ? new Date(parsedData.currentCompanyJoiningDate) : new Date(),
        }
        form.reset(formDataWithDates)
        setGender(formDataWithDates.gender)
        setSameAsPermanent(formDataWithDates.presentAddress === formDataWithDates.permanentAddress)
        
        toast({
          title: "Form Data Restored",
          description: "Your previous form data has been restored.",
        })
      } catch (error) {
        console.error("Error restoring form data:", error)
        localStorage.removeItem(FORM_STORAGE_KEY)
      }
    }
  }, [])

  // Save form data as user types
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Don't save file inputs
      const formDataToSave = {
        ...value,
        photo: null,
        aadhaar: null,
        panCard: null,
        bankPassbook: null,
        markSheet: null,
        otherDocument: null,
      }
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formDataToSave))
    })
    return () => subscription.unsubscribe()
  }, [form])

  useEffect(() => {
    const subscription = form.watch(() => {
      onChange?.()
    })
    return () => subscription.unsubscribe()
  }, [form, onChange])

  // Handle form submission
  const handleFormSubmit = async (values: z.infer<typeof employeeFormSchema>) => {
    try {
      // Format dates to DD-MM-YYYY
      const formattedValues = {
        ...values,
        dateOfBirth: formatDateToDDMMYYYY(values.dateOfBirth),
        employeeOnboardingDate: formatDateToDDMMYYYY(values.employeeOnboardingDate),
        policeVerificationDate: formatDateToDDMMYYYY(values.policeVerificationDate),
        trainingCertificateDate: formatDateToDDMMYYYY(values.trainingCertificateDate),
        medicalCertificateDate: formatDateToDDMMYYYY(values.medicalCertificateDate),
        currentCompanyJoiningDate: values.currentCompanyJoiningDate 
          ? formatDateToDDMMYYYY(values.currentCompanyJoiningDate)
          : undefined,
      }

      await onSubmit(formattedValues as unknown as EmployeeFormValues)
      
      // Clear saved form data on successful submission
      localStorage.removeItem(FORM_STORAGE_KEY)
      
      toast({
        title: "Success",
        description: "Employee details saved successfully",
      })
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

  // Handle same as permanent address checkbox
  const handleSameAsPermanentChange = (checked: boolean) => {
    setSameAsPermanent(checked)
    if (checked) {
      form.setValue("presentAddress", form.getValues("permanentAddress"))
    }
  }

  // Handle gender change
  const handleGenderChange = (value: string) => {
    setGender(value)
    form.setValue("gender", value)
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

  return (
    <Form {...form}>
      <form id="employee-form" onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select title" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {titleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
                    <DatePicker date={field.value} onSelect={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={(value) => handleGenderChange(value)} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Employee Onboarding Date <span className="text-red-500">*</span></FormLabel>
                    <DatePicker date={field.value} onSelect={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select qualification" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {educationQualificationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
          </CardContent>
        </Card>

        {/* Commenting out Employment Details section for now
        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="currentCompanyJoiningDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Company Date of Joining</FormLabel>
                    <DatePicker date={field.value} onSelect={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentCompanySalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter salary"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentCompanyDesignationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select designation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {designations.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employeeDepartments.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        */}

        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Police Verification Date <span className="text-red-500">*</span></FormLabel>
                    <DatePicker date={field.value} onSelect={field.onChange} />
                    <FormMessage />
                  </FormItem>
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Training Certificate Date <span className="text-red-500">*</span></FormLabel>
                    <DatePicker date={field.value} onSelect={field.onChange} />
                    <FormMessage />
                  </FormItem>
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Medical Certificate Date <span className="text-red-500">*</span></FormLabel>
                    <DatePicker date={field.value} onSelect={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reference Details</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle>Document Uploads</CardTitle>
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

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

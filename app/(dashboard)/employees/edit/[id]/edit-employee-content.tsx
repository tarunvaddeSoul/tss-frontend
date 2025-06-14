"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Eye, Download, User, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { PDFViewer } from "@react-pdf/renderer"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EmployeeForm } from "@/components/employees/employee-form"
import EmployeeViewPDF from "@/components/employees/employee-view-pdf"
import { ApiErrorAlert } from "@/components/ui/api-error-alert"
import { employeeService } from "@/services/employeeService"
import { companyService } from "@/services/companyService"
import type { Designation, Employee, EmployeeFormValues, EmployeeDepartments, UpdateEmployeeDto } from "@/types/employee"
import type { Company } from "@/types/company"
import { Status } from "@/enums/employee.enum"
import { designationService } from "@/services/designationService"
import { departmentService } from "@/services/departmentService"

interface EditEmployeeContentProps {
  employeeId: string
}


const parseDate = (dateString: string | undefined | null): Date => {
  if (!dateString) return new Date()

  try {
    // Handle different date formats
    let date: Date

    // Check if the date is in dd-mm-yyyy format
    if (typeof dateString === "string" && /^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split("-").map(Number)
      date = new Date(year, month - 1, day)
    } else {
      date = new Date(dateString)
    }

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return new Date()
    }

    return date
  } catch (error) {
    console.warn("Invalid date format:", dateString)
    return new Date()
  }
}

export function EditEmployeeContent({ employeeId }: EditEmployeeContentProps) {
  const router = useRouter()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])
  const [departments, setDepartments] = useState<EmployeeDepartments[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [showPDF, setShowPDF] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load employee data and related data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load employee data and related data in parallel
        const [employeeResponse, companiesResponse, designationsResponse, departmentsResponse] = await Promise.all([
          employeeService.getEmployeeById(employeeId),
          companyService.getCompanies({ page: 1, limit: 100 }),
          designationService.getDesignations(),
          departmentService.getEmployeeDepartments(),
        ])

        setEmployee(employeeResponse.data)
        setCompanies(companiesResponse.data?.companies ?? [])
        setDesignations(designationsResponse)
        setDepartments(departmentsResponse)
      } catch (err) {
        console.error("Error loading employee data:", err)
        setError(err as Error)
        toast.error("Failed to load employee data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [employeeId])

  // Handle form submission
  const handleSubmit = async (formData: EmployeeFormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)

      await employeeService.updateEmployee(employeeId, formData as unknown as UpdateEmployeeDto)

      toast.success("Employee updated successfully!")
      setHasUnsavedChanges(false)

      // Refresh employee data
      const updatedEmployee = await employeeService.getEmployeeById(employeeId)
      setEmployee(updatedEmployee.data)
    } catch (err) {
      console.error("Error updating employee:", err)
      setError(err as Error)
      toast.error("Failed to update employee")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle back navigation with unsaved changes warning
  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        router.push("/employees")
      }
    } else {
      router.push("/employees")
    }
  }

  // Show loading state
  if (isLoading) {
    return <div>Loading...</div> // This will be replaced by the skeleton
  }

  // Show error state
  if (error && !employee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive mb-4">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-semibold">Failed to Load Employee</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              We couldn't load the employee data. This might be because the employee doesn't exist or there was a
              network error.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()}>Try Again</Button>
              <Button variant="outline" onClick={handleBack}>
                Back to Employees
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!employee) {
    return null
  }

  // Prepare form options
  const companyOptions = companies.map((company) => ({
    value: company.id ?? "",
    label: company.name,
  }))

  const designationOptions = designations.map((designation) => ({
    value: designation.id,
    label: designation.name,
  }))

  const departmentOptions = departments.map((department) => ({
    value: department.id,
    label: department.name,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-bold">
                Edit Employee: {employee.firstName} {employee.lastName}
              </h1>
            </div>
            <Badge variant={employee.status === "ACTIVE" ? "default" : "secondary"}>{employee.status}</Badge>
          </div>
          <p className="text-muted-foreground">Update employee information and employment details</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPDF(true)} disabled={isSubmitting}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button type="submit" form="employee-form" disabled={isSubmitting} className="min-w-[100px]">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && <ApiErrorAlert error={error} title="Update Error" onDismiss={() => setError(null)} />}

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Don't forget to save your work before leaving this page.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-3">
          <EmployeeForm
            key={employee.id}
            initialValues={{
              title: employee.title || "",
              firstName: employee.firstName,
              lastName: employee.lastName,
              dateOfBirth: parseDate(employee.dateOfBirth),
              gender: employee.gender || "",
              fatherName: employee.fatherName || "",
              motherName: employee.motherName || "",
              husbandName: employee.husbandName || "",
              bloodGroup: employee.bloodGroup || "",
              employeeOnboardingDate: parseDate(employee.employeeOnboardingDate),
              status: employee.status || Status.ACTIVE,
              recruitedBy: employee.recruitedBy || "",
              highestEducationQualification: employee.highestEducationQualification || "",
              category: employee.category || "",
              mobileNumber: employee.mobileNumber || "",
              aadhaarNumber: employee.aadhaarNumber || "",
              permanentAddress: employee.permanentAddress || "",
              presentAddress: employee.presentAddress || "",
              city: employee.city || "",
              district: employee.district || "",
              state: employee.state || "",
              pincode: employee.pincode || 0,
              currentCompanyJoiningDate: parseDate(employee.dateOfJoining),
              currentCompanySalary: employee.salary || 0,
              currentCompanyDesignationId: employee.employmentHistories?.[0]?.designationId || "",
              currentCompanyDepartmentId: employee.employmentHistories?.[0]?.departmentId || "",
              currentCompanyId: employee.employmentHistories?.[0]?.companyId || "",
              bankAccountNumber: "",
              ifscCode: "",
              bankName: "",
              bankCity: "",
              pfUanNumber: "",
              esicNumber: "",
              policeVerificationNumber: "",
              policeVerificationDate: parseDate(employee.policeVerificationDate),
              trainingCertificateNumber: "",
              trainingCertificateDate: parseDate(employee.trainingCertificateDate),
              medicalCertificateNumber: "",
              medicalCertificateDate: parseDate(employee.medicalCertificateDate),
              referenceName: "",
              referenceAddress: "",
              referenceNumber: "",
              otherDocumentRemarks: "",
            }}
            onSubmit={handleSubmit}
            designations={designationOptions}
            employeeDepartments={departmentOptions}
            companies={companyOptions}
            isLoading={isSubmitting}
            onChange={() => setHasUnsavedChanges(true)}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Employee Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employee Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {employee.firstName} {employee.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{employee.designationName}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee ID:</span>
                  <span className="font-medium">{employee.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company:</span>
                  <span className="font-medium">{employee.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">{employee.employeeDepartmentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joining Date:</span>
                  <span className="font-medium">{employee.dateOfJoining}</span>
                </div>
                {employee.salary && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salary:</span>
                    <span className="font-medium">₹{employee.salary.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => setShowPDF(true)}>
                <Eye className="h-4 w-4 mr-2" />
                View Employee Details
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // TODO: Implement download functionality
                  toast.info("Download functionality coming soon!")
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Employee Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PDF View Dialog */}
      {showPDF && employee && (
        <PDFViewer width="100%" height={600} style={{ minHeight: 600, width: '100%' }}>
        <EmployeeViewPDF employee={employee} />
        </PDFViewer>
      )}
    </div>
  )
}

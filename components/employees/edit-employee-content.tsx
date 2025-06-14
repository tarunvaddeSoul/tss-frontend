"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, Download, User, AlertCircle, Briefcase, Contact, CreditCard, FileText } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiErrorAlert } from "@/components/ui/api-error-alert"
import { EmployeeViewDialog } from "@/components/employees/employee-view-dialog"
import { EmployeeDocumentManager } from "@/components/employees/employee-document-manager"
import { BasicInfoForm } from "@/components/employees/forms/basic-info-form"
import { ContactInfoForm } from "@/components/employees/forms/contact-info-form"
import { BankInfoForm } from "@/components/employees/forms/bank-info-form"
import { AdditionalDetailsForm } from "@/components/employees/forms/additional-details-form"
import { ReferenceDetailsForm } from "@/components/employees/forms/reference-details-form"
import { EmploymentHistoryForm } from "@/components/employees/forms/employment-history-form"
import { employeeService } from "@/services/employeeService"
import { companyService } from "@/services/companyService"
import { designationService } from "@/services/designationService"
import { departmentService } from "@/services/departmentService"
import type { Employee, IEmployeeEmploymentHistory, Designation, EmployeeDepartments } from "@/types/employee"
import type { Company } from "@/types/company"

interface EditEmployeeContentProps {
  employeeId: string
}

export function EditEmployeeContent({ employeeId }: EditEmployeeContentProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])
  const [departments, setDepartments] = useState<EmployeeDepartments[]>([])
  const [employmentHistories, setEmploymentHistories] = useState<IEmployeeEmploymentHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)

  // Load employee data and related data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load employee data and related data in parallel
        const [employeeResponse, companiesResponse, designationsResponse, departmentsResponse, historiesResponse] =
          await Promise.all([
            employeeService.getEmployeeById(employeeId),
            companyService.getCompanies({ page: 1, limit: 100 }),
            designationService.getDesignations(),
            departmentService.getEmployeeDepartments(),
            employeeService.getEmployeeEmploymentHistory(employeeId),
          ])

        setEmployee(employeeResponse.data)
        setCompanies(companiesResponse.data?.companies || [])
        setDesignations(designationsResponse || [])
        setDepartments(departmentsResponse || [])
        setEmploymentHistories(historiesResponse.data || [])
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

  // Handle employee data updates (optimistic updates)
  const handleEmployeeUpdate = (updatedData: Partial<Employee>) => {
    if (employee) {
      setEmployee({ ...employee, ...updatedData })
    }
  }

  // Handle back navigation
  const handleBack = () => {
    router.push("/employees")
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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

        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button variant="outline" onClick={() => setShowViewDialog(true)}>
            <Eye className="h-4 w-4 mr-2" />
            View Employee
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && <ApiErrorAlert error={error} title="Update Error" onDismiss={() => setError(null)} />}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Basic</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Contact className="h-4 w-4" />
                <span className="hidden md:inline">Contact</span>
              </TabsTrigger>
              <TabsTrigger value="employment" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden md:inline">Employment</span>
              </TabsTrigger>
              <TabsTrigger value="bank" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden md:inline">Bank</span>
              </TabsTrigger>
              <TabsTrigger value="additional" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden md:inline">Additional</span>
              </TabsTrigger>
              <TabsTrigger value="reference" className="flex items-center gap-2">
                <Contact className="h-4 w-4" />
                <span className="hidden md:inline">Reference</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden md:inline">Documents</span>
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <BasicInfoForm employee={employee} onUpdate={handleEmployeeUpdate} />
            </TabsContent>

            {/* Contact Info Tab */}
            <TabsContent value="contact" className="space-y-6">
              <ContactInfoForm employee={employee} onUpdate={handleEmployeeUpdate} />
            </TabsContent>

            {/* Employment History Tab */}
            <TabsContent value="employment" className="space-y-6">
              <EmploymentHistoryForm employee={employee} onUpdate={handleEmployeeUpdate} />
            </TabsContent>

            {/* Bank Info Tab */}
            <TabsContent value="bank" className="space-y-6">
              <BankInfoForm employee={employee} onUpdate={handleEmployeeUpdate} />
            </TabsContent>

            {/* Additional Details Tab */}
            <TabsContent value="additional" className="space-y-6">
              <AdditionalDetailsForm employee={employee} onUpdate={handleEmployeeUpdate} />
            </TabsContent>

            {/* Reference Details Tab */}
            <TabsContent value="reference" className="space-y-6">
              <ReferenceDetailsForm employee={employee} onUpdate={handleEmployeeUpdate} />
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <EmployeeDocumentManager
                employeeId={employeeId}
                onDocumentsUpdate={() => {
                  // Refresh employee data when documents are updated
                  employeeService.getEmployeeById(employeeId).then((response) => {
                    setEmployee(response.data)
                  })
                }}
              />
            </TabsContent>
          </Tabs>
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
                  <span className="font-medium">{employee.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company:</span>
                  <span className="font-medium">{employee.companyName || "Not assigned"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">{employee.employeeDepartmentName || "Not assigned"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joining Date:</span>
                  <span className="font-medium">{employee.dateOfJoining || "Not specified"}</span>
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
              <Button variant="outline" className="w-full justify-start" onClick={() => setShowViewDialog(true)}>
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

          {/* Recent Changes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">All sections saved</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Changes are automatically saved when you update each section.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Employee View Dialog */}
      {showViewDialog && employee && (
        <EmployeeViewDialog employee={employee} isOpen={showViewDialog} onClose={() => setShowViewDialog(false)} />
      )}
    </div>
  )
}

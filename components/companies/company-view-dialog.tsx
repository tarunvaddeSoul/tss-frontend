"use client"

import { useState, useEffect } from "react"
import { FileText, Download, Users, Calendar, Phone, Building, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { companyService } from "@/services/companyService"
import type { Company, CompanyEmployee } from "@/types/company"

interface CompanyViewDialogProps {
  company: Company
  isOpen: boolean
  onClose: () => void
}

export function CompanyViewDialog({ company, isOpen, onClose }: CompanyViewDialogProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [employees, setEmployees] = useState<CompanyEmployee[]>([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // Fetch employees when dialog opens
  useEffect(() => {
    if (isOpen && company.id) {
      fetchEmployees(company.id)
    }
  }, [isOpen, company.id])

  const fetchEmployees = async (companyId: string) => {
    try {
      setIsLoadingEmployees(true)
      const response = await companyService.getCompanyEmployees(companyId)
      setEmployees(response.data || [])
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load employees. Please try again.",
      })
    } finally {
      setIsLoadingEmployees(false)
    }
  }

  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true)
      console.log("Generating PDF for company:", company)

      // Dynamically import both pdf and the component
      const [{ pdf }, { default: CompanyViewPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/company-view-pdf"),
      ])

      // Generate PDF
      const blob = await pdf(<CompanyViewPDF company={company} />).toBlob()
      console.log("PDF Blob:", blob)

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `company_${company.name.replace(/\s+/g, "_").toLowerCase()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Cleanup
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleExportEmployeesExcel = async () => {
    if (!employees.length) return

    try {
      const XLSX = await import("xlsx")

      // Convert employees to Excel format
      const worksheet = XLSX.utils.json_to_sheet(
        employees.map((emp) => ({
          Name: `${emp.title || ""} ${emp.firstName} ${emp.lastName}`.trim(),
          Designation: emp.designation || "N/A",
          Department: emp.department || "N/A",
          "Joining Date": emp.joiningDate || "N/A",
          "Leaving Date": emp.leavingDate || "N/A",
          Salary: emp.salary ? `₹${emp.salary.toFixed(2)}` : "N/A",
        })),
      )

      // Create workbook and add worksheet
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, `${company.name} Employees`)

      // Generate Excel file
      XLSX.writeFile(workbook, `${company.name.replace(/\s+/g, "_").toLowerCase()}_employees.xlsx`)

      toast({
        title: "Success",
        description: "Employee list exported to Excel",
      })
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export to Excel. Please try again.",
      })
    }
  }

  // Get all enabled fields from salary template config
  const getEnabledFields = () => {
    // salaryTemplates is an array, so get the first template
    const template = Array.isArray(company.salaryTemplates) ? company.salaryTemplates[0] : company.salaryTemplates
    if (!template) return []

    return [
      ...(template.mandatoryFields || []),
      ...(template.optionalFields || []),
      ...(template.customFields || []),
    ].filter((field) => field.enabled)
  }

  const enabledFields = getEnabledFields()

  // Count fields by purpose
  const countFieldsByPurpose = (purpose: string) => {
    return enabledFields.filter((field) => field.purpose === purpose).length
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{company.name}</DialogTitle>
          <DialogDescription>Company ID: {company.id}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Company Details</TabsTrigger>
            <TabsTrigger value="employees">Employees ({employees.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Company Name</div>
                      <div className="font-medium">{company.name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Address</div>
                      <div>{company.address}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
                      <Badge variant={company.status === "ACTIVE" ? "default" : "secondary"}>
                        {company.status || "ACTIVE"}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Onboarding Date</div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {company.companyOnboardingDate || "Not specified"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Contact Person</div>
                      <div className="font-medium">{company.contactPersonName}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Contact Number</div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        {company.contactPersonNumber}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Salary Template Configuration */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Salary Template Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                {enabledFields.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted rounded-md p-3 text-center">
                        <div className="text-2xl font-bold">{enabledFields.length}</div>
                        <div className="text-xs text-muted-foreground">Total Fields</div>
                      </div>
                      <div className="bg-muted rounded-md p-3 text-center">
                        <div className="text-2xl font-bold">{countFieldsByPurpose("CALCULATION")}</div>
                        <div className="text-xs text-muted-foreground">Calculation Fields</div>
                      </div>
                      <div className="bg-muted rounded-md p-3 text-center">
                        <div className="text-2xl font-bold">{countFieldsByPurpose("ALLOWANCE")}</div>
                        <div className="text-xs text-muted-foreground">Allowance Fields</div>
                      </div>
                      <div className="bg-muted rounded-md p-3 text-center">
                        <div className="text-2xl font-bold">{countFieldsByPurpose("DEDUCTION")}</div>
                        <div className="text-xs text-muted-foreground">Deduction Fields</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Field Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Purpose</TableHead>
                            <TableHead>Default Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {enabledFields.map((field) => (
                            <TableRow key={field.key}>
                              <TableCell className="font-medium">{field.label}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{field.type}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={
                                    field.purpose === "ALLOWANCE"
                                      ? "bg-green-100 text-green-800"
                                      : field.purpose === "DEDUCTION"
                                        ? "bg-red-100 text-red-800"
                                        : field.purpose === "CALCULATION"
                                          ? "bg-blue-100 text-blue-800"
                                          : ""
                                  }
                                >
                                  {field.purpose}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {field.defaultValue || field.rules?.defaultValue || "Not specified"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No salary template configuration found or no fields are enabled.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-4 pt-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportEmployeesExcel}
                disabled={employees.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
            </div>

            {isLoadingEmployees ? (
              <div className="text-center py-8">Loading employees...</div>
            ) : employees.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Joining Date</TableHead>
                      <TableHead>Salary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>{employee.employeeId}</TableCell>
                        <TableCell className="font-medium">
                          {employee.title} {employee.firstName} {employee.lastName}
                        </TableCell>
                        <TableCell>{employee.designation || "N/A"}</TableCell>
                        <TableCell>{employee.department || "N/A"}</TableCell>
                        <TableCell>{employee.joiningDate || "N/A"}</TableCell>
                        <TableCell>₹{employee.salary?.toFixed(2) || "0.00"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <div className="text-lg font-medium">No employees found</div>
                <div className="text-sm text-muted-foreground">This company doesn't have any employees yet.</div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleGeneratePDF} disabled={isGeneratingPDF}>
            <FileText className="mr-2 h-4 w-4" />
            {isGeneratingPDF ? "Generating..." : "Download PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

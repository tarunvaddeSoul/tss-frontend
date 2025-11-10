"use client"

import { useState, useEffect, useMemo } from "react"
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
import { SalaryCategory, SalaryType } from "@/types/salary"
import { PdfPreviewDialog } from "@/components/pdf/pdf-preview-dialog"

interface CompanyViewDialogProps {
  company: Company
  isOpen: boolean
  onClose: () => void
}

export function CompanyViewDialog({ company, isOpen, onClose }: CompanyViewDialogProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
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

  // Filter to show only ACTIVE employees
  const activeEmployees = useMemo(() => {
    return employees.filter((emp) => emp.status === "ACTIVE")
  }, [employees])

  // Helper function to format salary display
  // Uses salaryType and salaryPerDay from the updated API response
  const formatSalary = (employee: CompanyEmployee): string => {
    // Primary: Use salaryType and salaryPerDay from response
    if (employee.salaryType === SalaryType.PER_DAY && employee.salaryPerDay) {
      return `₹${employee.salaryPerDay.toLocaleString()}/day`
    }
    if (employee.salaryType === SalaryType.PER_MONTH && employee.salary) {
      return `₹${employee.salary.toLocaleString()}/month`
    }

    // Fallback: Use salaryCategory if salaryType is not available
    if (employee.salaryCategory === SalaryCategory.SPECIALIZED && employee.monthlySalary) {
      return `₹${employee.monthlySalary.toLocaleString()}/month`
    }
    if (
      (employee.salaryCategory === SalaryCategory.CENTRAL || employee.salaryCategory === SalaryCategory.STATE) &&
      employee.salaryPerDay
    ) {
      return `₹${employee.salaryPerDay.toLocaleString()}/day`
    }

    // Final fallback: Use salary field
    if (employee.salary) {
      // If we have salaryType but no salaryPerDay, show salary with type
      if (employee.salaryType === SalaryType.PER_DAY) {
        return `₹${employee.salary.toFixed(2)}/day`
      }
      if (employee.salaryType === SalaryType.PER_MONTH) {
        return `₹${employee.salary.toFixed(2)}/month`
      }
      return `₹${employee.salary.toFixed(2)}`
    }

    return "N/A"
  }

  const renderCompanyPDF = async () => {
    const { default: CompanyViewPDF } = await import("@/components/pdf/company-view-pdf")
    return <CompanyViewPDF company={company} />
  }

  const handleExportEmployeesExcel = async () => {
    if (!activeEmployees.length) return

    try {
      const XLSX = await import("xlsx")

      // Convert active employees to Excel format
      const worksheet = XLSX.utils.json_to_sheet(
        activeEmployees.map((emp) => ({
          "Employee ID": emp.employeeId || "N/A",
          Name: `${emp.title || ""} ${emp.firstName} ${emp.lastName}`.trim(),
          Designation: emp.designation || "N/A",
          Department: emp.department || "N/A",
          "Joining Date": emp.joiningDate || "N/A",
          "Salary Type": emp.salaryType ? (emp.salaryType === SalaryType.PER_DAY ? "Per Day" : "Per Month") : "N/A",
          "Salary Category": emp.salaryCategory || "N/A",
          "Salary Sub Category": emp.salarySubCategory || "N/A",
          Salary: formatSalary(emp),
        })),
      )

      // Create workbook and add worksheet
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, `${company.name} Employees`)

      // Generate Excel file
      XLSX.writeFile(workbook, `${company.name.replace(/\s+/g, "_").toLowerCase()}_employees.xlsx`)

      toast({
        title: "Success",
        description: "Active employee list exported to Excel",
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
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{company.name}</DialogTitle>
          <DialogDescription>Company ID: {company.id}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1 min-h-0">
          <TabsList className="grid w-full grid-cols-2 shrink-0">
            <TabsTrigger value="details">Company Details</TabsTrigger>
            <TabsTrigger value="employees">Employees ({activeEmployees.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 pt-4 overflow-y-auto flex-1 min-h-0">
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

          <TabsContent value="employees" className="space-y-4 pt-4 flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex justify-end shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportEmployeesExcel}
                disabled={activeEmployees.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
            </div>

            {isLoadingEmployees ? (
              <div className="text-center py-8">Loading employees...</div>
            ) : activeEmployees.length > 0 ? (
              <div className="rounded-md border overflow-x-auto scrollbar-sleek flex-1 min-h-0">
                <table className="w-full min-w-[1200px] caption-bottom text-sm border-collapse">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Designation</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Department</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Joining Date</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Salary Type</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Salary Category</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Salary Sub Category</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Salary</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {activeEmployees.map((employee) => (
                      <tr key={employee.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">{employee.employeeId}</td>
                        <td className="p-4 align-middle font-medium">
                          {employee.title} {employee.firstName} {employee.lastName}
                        </td>
                        <td className="p-4 align-middle">{employee.designation || "N/A"}</td>
                        <td className="p-4 align-middle">{employee.department || "N/A"}</td>
                        <td className="p-4 align-middle">{employee.joiningDate || "N/A"}</td>
                        <td className="p-4 align-middle">
                          {employee.salaryType ? (
                            <Badge variant="outline" className="text-xs">
                              {employee.salaryType === SalaryType.PER_DAY ? "Per Day" : "Per Month"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </td>
                        <td className="p-4 align-middle">
                          {employee.salaryCategory ? (
                            <Badge variant="outline" className="text-xs">
                              {employee.salaryCategory}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </td>
                        <td className="p-4 align-middle">
                          {employee.salarySubCategory ? (
                            <Badge variant="outline" className="text-xs">
                              {employee.salarySubCategory}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </td>
                        <td className="p-4 align-middle">
                          <span className="font-medium">{formatSalary(employee)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <div className="text-lg font-medium">No active employees found</div>
                <div className="text-sm text-muted-foreground">
                  This company doesn't have any active employees at the moment.
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => setIsPreviewOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            View/Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>

      <PdfPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        title={`${company.name} - Company Profile`}
        description="Company details and salary slip template preview"
        fileName={`company_${company.name.replace(/\s+/g, "_").toLowerCase()}.pdf`}
        renderDocument={renderCompanyPDF}
      />
    </Dialog>
  )
}

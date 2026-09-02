"use client"

import { useState, useEffect, useMemo } from "react"
import { FileText, Download, Calendar, Phone } from "lucide-react"

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
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Pagination } from "@/components/ui/pagination"
import { displayValue, employeeName, formatDate, humanize, label } from "@/lib/labels"
import { downloadFileName } from "@/lib/filenames"
import { clientService } from "@/services/clientService"
import type { Client, ClientEmployee } from "@/types/client"
import { SalaryCategory, SalaryType } from "@/types/salary"
import { PdfPreviewDialog } from "@/components/pdf/pdf-preview-dialog"

interface ClientViewDialogProps {
  client: Client
  isOpen: boolean
  onClose: () => void
}

export function ClientViewDialog({ client, isOpen, onClose }: ClientViewDialogProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [employees, setEmployees] = useState<ClientEmployee[]>([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [employeePage, setEmployeePage] = useState(1)
  const EMPLOYEES_PER_PAGE = 20

  // Fetch employees when dialog opens
  useEffect(() => {
    if (isOpen && client.id) {
      fetchEmployees(client.id)
      setEmployeePage(1)
    }
  }, [isOpen, client.id])

  const fetchEmployees = async (clientId: string) => {
    try {
      setIsLoadingEmployees(true)
      const response = await clientService.getClientEmployees(clientId)
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

  const employeeTotalPages = Math.ceil(activeEmployees.length / EMPLOYEES_PER_PAGE)
  const paginatedEmployees = useMemo(() => {
    const start = (employeePage - 1) * EMPLOYEES_PER_PAGE
    return activeEmployees.slice(start, start + EMPLOYEES_PER_PAGE)
  }, [activeEmployees, employeePage])

  // Helper function to format salary display
  // Uses salaryType and salaryPerDay from the updated API response
  const formatSalary = (employee: ClientEmployee): string => {
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

  const renderClientPDF = async () => {
    const { default: ClientViewPDF } = await import("@/components/pdf/client-view-pdf")
    return <ClientViewPDF client={client} />
  }

  const handleExportEmployeesExcel = async () => {
    if (!activeEmployees.length) return

    try {
      const XLSX = await import("xlsx")

      // Convert active employees to Excel format
      const worksheet = XLSX.utils.json_to_sheet(
        activeEmployees.map((emp) => ({
          "Employee ID": emp.employeeId || "N/A",
          Name: employeeName(emp),
          Designation: humanize(emp.designation),
          Department: humanize(emp.department),
          "Joining Date": formatDate(emp.joiningDate),
          "Salary Type": emp.salaryType ? label.salaryType(emp.salaryType) : "N/A",
          "Salary Category": emp.salaryCategory ? label.salaryCategory(emp.salaryCategory) : "N/A",
          "Salary Sub Category": emp.salarySubCategory ? label.salarySubCategory(emp.salarySubCategory) : "N/A",
          Salary: formatSalary(emp),
        })),
      )

      // Excel caps sheet names at 31 characters, so the client goes in the file name instead
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Employees")

      const fileName = downloadFileName("employees", client.name, null, "xlsx")
      XLSX.writeFile(workbook, fileName)

      toast({
        variant: "success",
        title: `Exported ${activeEmployees.length} active employees`,
        description: fileName,
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
    const template = Array.isArray(client.salaryTemplates) ? client.salaryTemplates[0] : client.salaryTemplates
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
          <DialogTitle className="font-display text-xl font-bold tracking-[-0.02em]">{client.name}</DialogTitle>
          <DialogDescription className="font-mono text-xs uppercase tracking-[0.08em]">
            Client ID: {client.id}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1 min-h-0">
          <TabsList className="w-full shrink-0">
            <TabsTrigger value="details">Client Details</TabsTrigger>
            <TabsTrigger value="employees">Employees ({activeEmployees.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 pt-4 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="registry-line">
                    <span className="registry-eyebrow">Basic Information</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Client Name</div>
                      <div className="font-medium">{client.name}</div>
                    </div>
                    <div>
                      <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Address</div>
                      <div>{displayValue(client.address)}</div>
                    </div>
                    <div>
                      <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Status</div>
                      <Badge variant={client.status === "ACTIVE" ? "success" : "destructive"}>
                        {label.status(client.status)}
                      </Badge>
                    </div>
                    <div>
                      <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Onboarding Date</div>
                      <div className="flex items-center font-mono text-[13px]">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatDate(client.clientOnboardingDate)}
                      </div>
                    </div>
                    {client.clientTerminationDate && (
                      <div>
                        <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Termination Date</div>
                        <div className="flex items-center font-mono text-[13px]">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {formatDate(client.clientTerminationDate)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="registry-line">
                    <span className="registry-eyebrow">Contact Information</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Contact Person</div>
                      <div className="font-medium">{displayValue(client.contactPersonName)}</div>
                    </div>
                    <div>
                      <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Contact Number</div>
                      <div className="flex items-center font-mono text-[13px]">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        {displayValue(client.contactPersonNumber)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <div className="registry-line">
                  <span className="registry-eyebrow">Salary Template Configuration</span>
                </div>
              </CardHeader>
              <CardContent>
                {enabledFields.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="rounded-md border bg-surface p-3 text-center">
                        <div className="font-display text-2xl font-bold tabular-nums">{enabledFields.length}</div>
                        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Total Fields</div>
                      </div>
                      <div className="rounded-md border bg-surface p-3 text-center">
                        <div className="font-display text-2xl font-bold tabular-nums">{countFieldsByPurpose("CALCULATION")}</div>
                        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Calculation Fields</div>
                      </div>
                      <div className="rounded-md border bg-surface p-3 text-center">
                        <div className="font-display text-2xl font-bold tabular-nums">{countFieldsByPurpose("ALLOWANCE")}</div>
                        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Allowance Fields</div>
                      </div>
                      <div className="rounded-md border bg-surface p-3 text-center">
                        <div className="font-display text-2xl font-bold tabular-nums">{countFieldsByPurpose("DEDUCTION")}</div>
                        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Deduction Fields</div>
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
                                  variant={
                                    field.purpose === "ALLOWANCE"
                                      ? "success"
                                      : field.purpose === "DEDUCTION"
                                        ? "destructive"
                                        : field.purpose === "CALCULATION"
                                          ? "info"
                                          : "default"
                                  }
                                >
                                  {field.purpose}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-[13px]">
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
              <div className="flex flex-col flex-1 min-h-0 gap-3">
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
                    {paginatedEmployees.map((employee) => (
                      <tr key={employee.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle font-mono text-[13px]">{employee.employeeId}</td>
                        <td className="p-4 align-middle font-medium">{employeeName(employee)}</td>
                        <td className="p-4 align-middle">{humanize(employee.designation)}</td>
                        <td className="p-4 align-middle">{humanize(employee.department)}</td>
                        <td className="p-4 align-middle font-mono text-[13px]">{formatDate(employee.joiningDate)}</td>
                        <td className="p-4 align-middle">
                          {employee.salaryType ? (
                            <Badge variant="outline" className="text-xs">
                              {label.salaryType(employee.salaryType)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </td>
                        <td className="p-4 align-middle">
                          {employee.salaryCategory ? (
                            <Badge variant="outline" className="text-xs">
                              {label.salaryCategory(employee.salaryCategory)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </td>
                        <td className="p-4 align-middle">
                          {employee.salarySubCategory ? (
                            <Badge variant="outline" className="text-xs">
                              {label.salarySubCategory(employee.salarySubCategory)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </td>
                        <td className="p-4 align-middle">
                          <span className="font-mono text-[13px] font-semibold">{formatSalary(employee)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {employeeTotalPages > 1 && (
                <div className="flex items-center justify-between shrink-0">
                  <span className="text-sm text-muted-foreground">
                    {activeEmployees.length} active employees
                  </span>
                  <Pagination
                    currentPage={employeePage}
                    totalPages={employeeTotalPages}
                    onPageChange={setEmployeePage}
                  />
                </div>
              )}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <div className="registry-eyebrow">No records on file</div>
                <div className="text-sm text-muted-foreground">
                  This client doesn't have any active employees at the moment.
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
        title={`${client.name} - Client Profile`}
        description="Client details and salary slip template preview"
        fileName={`client_${client.name.replace(/\s+/g, "_").toLowerCase()}.pdf`}
        renderDocument={renderClientPDF}
      />
    </Dialog>
  )
}

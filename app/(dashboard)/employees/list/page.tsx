"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Plus,
  XCircle,
  Loader2,
  Download,
  Edit,
  Eye,
  AlertCircle,
} from "lucide-react"
import { SalaryCategory, SalaryType } from "@/types/salary"
import { employeeService } from "@/services/employeeService"
import { designationService } from "@/services/designationService"
import { departmentService } from "@/services/departmentService"
import { clientService } from "@/services/clientService"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Combobox } from "@/components/ui/combobox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { label, employeeName, humanize, displayValue } from "@/lib/labels"
import { Skeleton } from "@/components/ui/skeleton"
import { Employee, EmployeeSearchParams, IEmployeeEmploymentHistory } from "@/types/employee"
import { Client } from "@/types/client"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PageHeader } from "@/components/layout/page-header"
import { TerminateEmployeeDialog } from "@/components/employees/terminate-employee-dialog"
import dynamic from "next/dynamic"

const DynamicPdfPreviewDialog = dynamic(
  () => import("@/components/pdf/pdf-preview-dialog").then((mod) => ({ default: mod.PdfPreviewDialog })),
  { ssr: false }
)

interface Designation {
  id: string
  name: string
}

interface EmployeeDepartment {
  id: string
  name: string
}

function initialsOf(employee: Employee): string {
  return (
    employeeName(employee)
      .split(" ")
      .map((part) => part[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  )
}

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false)
  const [employeeToTerminate, setEmployeeToTerminate] = useState<Employee | null>(null)
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)
  const [pdfPreviewEmployee, setPdfPreviewEmployee] = useState<Employee | null>(null)
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useState<EmployeeSearchParams>({
    page: 1,
    limit: 10,
  })
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [designations, setDesignations] = useState<Designation[]>([])
  const [employeeDepartments, setEmployeeDepartments] = useState<EmployeeDepartment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [searchInput, setSearchInput] = useState("")

  const router = useRouter()

  useEffect(() => {
    fetchDesignations()
    fetchEmployeeDepartments()
    fetchClients()
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [searchParams])

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearchParams((prev) => {
        if ((prev.searchText || "") === searchInput) return prev
        return { ...prev, searchText: searchInput || undefined, page: 1 }
      })
    }, 350)
    return () => clearTimeout(handle)
  }, [searchInput])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(false)
      const response = await employeeService.getEmployees(searchParams)
      setEmployees(response.data || [])
      const total = response.meta?.total || 0
      setTotalCount(total)
      const limit = searchParams.limit || 10
      setTotalPages(Math.ceil(total / limit))
    } catch (error) {
      setError(true)
      setEmployees([])
      toast.error("Could not load employees. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchDesignations = async () => {
    try {
      const response = await designationService.getDesignations()
      setDesignations(response)
    } catch (error) {
      setDesignations([])
    }
  }

  const fetchEmployeeDepartments = async () => {
    try {
      const response = await departmentService.getEmployeeDepartments()
      setEmployeeDepartments(response)
    } catch (error) {
      setEmployeeDepartments([])
    }
  }

  const fetchClients = async () => {
    try {
      setClients(await clientService.getAllClients())
    } catch (error) {
      setClients([])
    }
  }

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee)
    setViewModalOpen(true)
  }

  // The list row lacks contact, bank and reference data, so the PDF always renders from the full record
  const openEmployeePdf = async (employee: Employee) => {
    try {
      setPdfLoadingId(employee.id)
      const response = await employeeService.getEmployeeById(employee.id)
      setPdfPreviewEmployee(response.data)
      setPdfPreviewOpen(true)
    } catch (error) {
      toast.error("Could not load the employee details for the PDF. Please try again.")
    } finally {
      setPdfLoadingId(null)
    }
  }

  const handleEdit = (employee: Employee) => {
    router.push(`/employees/edit/${employee.id}`)
  }

  const handleIdClick = (id: string) => {
    router.push(`/employees/view/${id}`)
  }

  const handleTerminate = (employee: Employee) => {
    if (employee.status === "INACTIVE") {
      toast.error("Employee is already terminated from TSS")
      return
    }
    setEmployeeToTerminate(employee)
    setTerminateDialogOpen(true)
  }

  const handleTerminationSuccess = () => {
    fetchEmployees()
  }

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSearchParams({ ...searchParams, searchText: searchInput || undefined, page: 1 })
  }

  const updateFilters = (patch: Partial<EmployeeSearchParams>) => {
    setSearchParams({ ...searchParams, ...patch, page: 1 })
  }

  const handlePageChange = (newPage: number | string | undefined) => {
    const pageNum = Number(newPage)
    if (!pageNum || isNaN(pageNum)) return
    setSearchParams({ ...searchParams, page: pageNum })
  }

  const designationOptions = [
    { value: "all", label: "All designations" },
    ...designations.map((d) => ({ value: d.id, label: humanize(d.name) })),
  ]

  const departmentOptions = [
    { value: "all", label: "All departments" },
    ...employeeDepartments.map((d) => ({ value: d.id, label: humanize(d.name) })),
  ]

  const clientOptions = [
    { value: "all", label: "All clients" },
    ...clients.map((c) => ({ value: c.id ?? "", label: c.name })),
  ]

  const selectedActiveHistory = selectedEmployee?.employmentHistories?.find(
    (h: IEmployeeEmploymentHistory) => h.status === "ACTIVE",
  )

  return (
    <div className="space-y-6">
      <PageHeader
        no="04"
        eyebrow="Employee register"
        title="Employees"
        description="View and manage all employees."
        actions={
          <Link href="/employees/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </Link>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Search Employees</CardTitle>
          <CardDescription>Results update as you type or change a filter.</CardDescription>
        </CardHeader>
        <CardContent>
          <form noValidate onSubmit={handleSearch} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="employee-search">Search</Label>
              <Input
                id="employee-search"
                placeholder="Name or employee ID"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation-filter">Designation</Label>
              <Combobox
                id="designation-filter"
                options={designationOptions}
                value={searchParams.designationId ?? "all"}
                onChange={(value) => updateFilters({ designationId: value === "all" ? undefined : value })}
                placeholder="All designations"
                searchPlaceholder="Search designations..."
                emptyText="No designations found."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department-filter">Department</Label>
              <Combobox
                id="department-filter"
                options={departmentOptions}
                value={searchParams.employeeDepartmentId ?? "all"}
                onChange={(value) => updateFilters({ employeeDepartmentId: value === "all" ? undefined : value })}
                placeholder="All departments"
                searchPlaceholder="Search departments..."
                emptyText="No departments found."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-filter">Client</Label>
              <Combobox
                id="client-filter"
                options={clientOptions}
                value={searchParams.clientId ?? "all"}
                onChange={(value) => updateFilters({ clientId: value === "all" ? undefined : value })}
                placeholder="All clients"
                searchPlaceholder="Search clients..."
                emptyText="No clients found."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={searchParams.status || "all"}
                onValueChange={(value) => updateFilters({ status: value === "all" ? undefined : value })}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
      </Card>
      <ScrollArea className="flex-1">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Employee List</CardTitle>
                {totalCount > 0 && (
                  <CardDescription>Showing {employees.length} of {totalCount} employees</CardDescription>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Items per page:</span>
                <Select
                  value={String(searchParams.limit)}
                  onValueChange={(value) => updateFilters({ limit: Number(value) })}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md border overflow-x-auto scrollbar-sleek w-full">
              <div className="min-w-[900px]">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10">
                        <div className="flex flex-col items-center justify-center gap-3 text-center">
                          <AlertCircle className="h-8 w-8 text-destructive" />
                          <p className="text-sm text-muted-foreground">
                            Could not load employees. Check your connection and try again.
                          </p>
                          <Button variant="outline" size="sm" onClick={() => fetchEmployees()}>
                            Retry
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : employees.length > 0 ? (
                    employees.map((employee) => {
                      const activeHistory = employee.employmentHistories?.find((h: IEmployeeEmploymentHistory) => h.status === "ACTIVE")
                      const designation = humanize(activeHistory?.designationName)
                      const department = humanize(activeHistory?.departmentName)
                      const client = displayValue(activeHistory?.clientName)

                      return (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={employee.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{initialsOf(employee)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{employeeName(employee)}</p>
                              <button
                                onClick={() => handleIdClick(employee.id)}
                                className="font-mono text-xs text-info hover:underline"
                              >
                                ID: {employee.id}
                              </button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={designation === "-" ? "text-sm text-muted-foreground" : "text-sm"}>{designation}</span>
                        </TableCell>
                        <TableCell>
                          <span className={department === "-" ? "text-sm text-muted-foreground" : "text-sm"}>{department}</span>
                        </TableCell>
                        <TableCell>
                          <span className={client === "-" ? "text-sm text-muted-foreground" : "text-sm"}>{client}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {(() => {
                              if (activeHistory?.salaryType === SalaryType.PER_DAY && activeHistory.salaryPerDay) {
                                return <span className="font-mono text-[13px] font-semibold">₹{activeHistory.salaryPerDay.toLocaleString("en-IN")}/day</span>
                              }
                              if (activeHistory?.salaryType === SalaryType.PER_MONTH && activeHistory.salary) {
                                return <span className="font-mono text-[13px] font-semibold">₹{activeHistory.salary.toLocaleString("en-IN")}/month</span>
                              }
                              if (employee.salaryCategory === SalaryCategory.SPECIALIZED && employee.monthlySalary) {
                                return <span className="font-mono text-[13px] font-semibold">₹{employee.monthlySalary.toLocaleString("en-IN")}/month</span>
                              }
                              if (employee.salaryPerDay) {
                                return <span className="font-mono text-[13px] font-semibold">₹{employee.salaryPerDay.toLocaleString("en-IN")}/day</span>
                              }
                              return <span className="text-xs text-muted-foreground">Not configured</span>
                            })()}
                            <span className="text-xs text-muted-foreground">
                              {[
                                employee.salaryCategory ? label.salaryCategory(employee.salaryCategory) : null,
                                employee.salarySubCategory ? label.salarySubCategory(employee.salarySubCategory) : null,
                              ]
                                .filter(Boolean)
                                .join(" · ") || "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={employee.status === "ACTIVE" ? "success" : "destructive"}>
                            {label.status(employee.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleView(employee)} title="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(employee)} title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEmployeePdf(employee)}
                              disabled={pdfLoadingId === employee.id}
                              title="Preview and download PDF"
                            >
                              {pdfLoadingId === employee.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                            {employee.status !== "INACTIVE" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleTerminate(employee)}
                                title="Terminate from TSS"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12">
                        <div className="flex flex-col items-center justify-center gap-3 text-center">
                          <span className="registry-eyebrow">No records on file</span>
                          <p className="text-sm text-muted-foreground">
                            No employees match the current filters.
                          </p>
                          <Link href="/employees/add">
                            <Button variant="outline" size="sm">
                              <Plus className="mr-2 h-4 w-4" />
                              Add Employee
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={searchParams.page ?? 1}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </ScrollArea>
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>

          {selectedEmployee && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedEmployee.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">{initialsOf(selectedEmployee)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-display text-xl font-bold">{employeeName(selectedEmployee)}</h3>
                  <p className="font-mono text-[13px] text-muted-foreground">ID: {selectedEmployee.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Designation</p>
                  <p>{humanize(selectedActiveHistory?.designationName)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Department</p>
                  <p>{humanize(selectedActiveHistory?.departmentName)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Client</p>
                  <p>{displayValue(selectedActiveHistory?.clientName)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={selectedEmployee.status === "ACTIVE" ? "success" : "destructive"}>
                    {label.status(selectedEmployee.status)}
                  </Badge>
                </div>
                {selectedEmployee.contactDetails?.mobileNumber && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Mobile</p>
                    <p>{displayValue(selectedEmployee.contactDetails.mobileNumber)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
            {selectedEmployee && (
              <>
                <Button variant="outline" onClick={() => handleIdClick(selectedEmployee.id)}>
                  Full profile
                </Button>
                <Button
                  onClick={() => openEmployeePdf(selectedEmployee)}
                  disabled={pdfLoadingId === selectedEmployee.id}
                >
                  {pdfLoadingId === selectedEmployee.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  View & Download PDF
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {employeeToTerminate && (
        <TerminateEmployeeDialog
          employee={employeeToTerminate}
          open={terminateDialogOpen}
          onOpenChange={(open) => {
            setTerminateDialogOpen(open)
            if (!open) setEmployeeToTerminate(null)
          }}
          onSuccess={handleTerminationSuccess}
        />
      )}

      {pdfPreviewEmployee && (
        <DynamicPdfPreviewDialog
          key={pdfPreviewEmployee.id}
          open={pdfPreviewOpen}
          onOpenChange={setPdfPreviewOpen}
          title={`Employee Profile - ${employeeName(pdfPreviewEmployee)}`}
          description={`Employee ID: ${pdfPreviewEmployee.id}`}
          fileName={`employee-${pdfPreviewEmployee.id}.pdf`}
          renderDocument={async () => {
            const { default: EmployeeViewPDF } = await import("@/components/employees/employee-view-pdf")
            return <EmployeeViewPDF employee={pdfPreviewEmployee} />
          }}
        />
      )}
    </div>
  )
}

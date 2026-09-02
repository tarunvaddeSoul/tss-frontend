"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Plus,
  Search,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Combobox } from "@/components/ui/combobox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { label } from "@/lib/labels"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Employee, EmployeeSearchParams, IEmployeeEmploymentHistory } from "@/types/employee"
import { Client } from "@/types/client"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PageHeader } from "@/components/layout/page-header"
import { TerminateEmployeeDialog } from "@/components/employees/terminate-employee-dialog"
import dynamic from "next/dynamic"
// import { EmployeeViewPDF } from "@/components/employees/employee-view-pdf"
// import { PDFViewer } from "@/components/pdf-viewer"

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

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("details")
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false)
  const [employeeToTerminate, setEmployeeToTerminate] = useState<Employee | null>(null)
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)
  const [pdfPreviewEmployee, setPdfPreviewEmployee] = useState<Employee | null>(null)
  const [pdfLoadingEmployee, setPdfLoadingEmployee] = useState(false)
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

  // Cleanup PDF URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdfUrl])

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
      console.error("Error fetching employees:", error)
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
      console.error("Error fetching designations:", error)
    }
  }

  const fetchEmployeeDepartments = async () => {
    try {
      const response = await departmentService.getEmployeeDepartments()
      setEmployeeDepartments(response)
    } catch (error) {
      console.error("Error fetching employee departments:", error)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await clientService.getClients()

      if (response.data && response.data.clients) {
        setClients(response.data.clients)
      } else {
        setClients([])
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const handleView = async (employee: Employee) => {
    if (employee) {
      setSelectedEmployee(employee)
      setViewModalOpen(true)
      setActiveTab("details")
      // Clear any existing PDF
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
        setPdfUrl(null)
      }
    }
  }

  const handleGeneratePDF = async () => {
    if (!selectedEmployee) return

    try {
      setPdfLoading(true)
      
      // Dynamically import both pdf and the component
      const [{ pdf }, { default: EmployeeViewPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/employees/employee-view-pdf"),
      ])

      // Generate PDF
      const blob = await pdf(<EmployeeViewPDF employee={selectedEmployee} />).toBlob()
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setActiveTab("pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to generate PDF. Please try again.")
    } finally {
      setPdfLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!pdfUrl || !selectedEmployee) return

    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = `employee_${selectedEmployee.id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
    fetchEmployees() // Refresh the list
  }

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSearchParams({ ...searchParams, searchText: searchInput || undefined, page: 1 })
  }

  const handlePageChange = (newPage: number | string | undefined) => {
    const pageNum = Number(newPage)
    if (!pageNum || isNaN(pageNum)) return // Prevent NaN and 0
    setSearchParams({ ...searchParams, page: pageNum })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?"
  }

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
        </CardHeader>
        <CardContent>
          <form noValidate onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <Input
                  placeholder="Search employees"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <div>
                <Select
                  value={searchParams.designationId}
                  onValueChange={(value) =>
                    setSearchParams({
                      ...searchParams,
                      designationId: value === "all" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Designations</SelectItem>
                    {designations.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select
                  value={searchParams.employeeDepartmentId}
                  onValueChange={(value) =>
                    setSearchParams({
                      ...searchParams,
                      employeeDepartmentId: value === "all" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {employeeDepartments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Combobox
                  options={[
                    { value: "all", label: "All Clients" },
                    ...clients.map((c) => ({ value: c.id ?? "", label: c.name })),
                  ]}
                  value={searchParams.clientId}
                  onChange={(value) =>
                    setSearchParams({
                      ...searchParams,
                      clientId: value === "all" ? undefined : value,
                    })
                  }
                  placeholder="Select client"
                  searchPlaceholder="Search clients..."
                  emptyText="No clients found."
                />
              </div>

              <div>
                <Select
                  value={searchParams.status || "all"}
                  onValueChange={(value) =>
                    setSearchParams({
                      ...searchParams,
                      status: value === "all" ? undefined : value,
                      page: 1,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button type="submit" className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
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
                  onValueChange={(value) =>
                    setSearchParams({
                      ...searchParams,
                      limit: Number(value),
                      page: 1, // Reset to first page when changing limit
                    })
                  }
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

                      return (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={employee.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{getInitials(employee.firstName, employee.lastName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{`${employee.firstName} ${employee.lastName}`}</p>
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
                          <span className={activeHistory?.designationName ? "text-sm" : "text-sm text-muted-foreground"}>
                            {activeHistory?.designationName || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={activeHistory?.departmentName ? "text-sm" : "text-sm text-muted-foreground"}>
                            {activeHistory?.departmentName || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={activeHistory?.clientName ? "text-sm" : "text-sm text-muted-foreground"}>
                            {activeHistory?.clientName || "N/A"}
                          </span>
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
                              onClick={async () => {
                                try {
                                  setPdfLoadingEmployee(true)
                                  // Fetch full employee details before opening PDF
                                  const fullEmployeeData = await employeeService.getEmployeeById(employee.id)
                                  setPdfPreviewEmployee(fullEmployeeData.data)
                                  setPdfPreviewOpen(true)
                                } catch (error) {
                                  console.error("Error fetching employee details:", error)
                                  toast.error("Failed to load employee details for PDF")
                                } finally {
                                  setPdfLoadingEmployee(false)
                                }
                              }}
                              disabled={pdfLoadingEmployee}
                              title="View & Download PDF"
                            >
                              {pdfLoadingEmployee ? (
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>

          {selectedEmployee && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="pdf" disabled={!pdfUrl && !pdfLoading}>
                  PDF Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedEmployee.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {getInitials(selectedEmployee.firstName, selectedEmployee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-display text-xl font-bold">{`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}</h3>
                    <p className="font-mono text-[13px] text-muted-foreground">ID: {selectedEmployee.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Designation</p>
                    <p>{selectedEmployee.employmentHistories?.find((h: IEmployeeEmploymentHistory) => h.status === "ACTIVE")?.designationName || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Department</p>
                    <p>{selectedEmployee.employmentHistories?.find((h: IEmployeeEmploymentHistory) => h.status === "ACTIVE")?.departmentName || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Client</p>
                    <p>{selectedEmployee.employmentHistories?.find((h: IEmployeeEmploymentHistory) => h.status === "ACTIVE")?.clientName || "N/A"}</p>
                  </div>
                  {selectedEmployee.contactDetails?.mobileNumber && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Mobile</p>
                      <p>{selectedEmployee.contactDetails?.mobileNumber}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <Button onClick={handleGeneratePDF} disabled={pdfLoading}>
                    {pdfLoading ? "Generating PDF..." : "Generate PDF"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="pdf" className="pt-4">
                {pdfLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <Skeleton className="h-[400px] w-full" />
                    <p className="text-muted-foreground">Generating PDF...</p>
                  </div>
                ) : pdfUrl ? (
                  <div className="space-y-4">
                    <div className="border rounded-md overflow-hidden h-[500px]">
                      <iframe src={pdfUrl} className="w-full h-full" />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleDownloadPDF}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-10">
                    <p className="text-muted-foreground">
                      No PDF generated yet. Go to Details tab and click Generate PDF.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terminate Employee Dialog */}
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

      {/* PDF Preview Dialog */}
      {pdfPreviewEmployee && (
        <DynamicPdfPreviewDialog
          open={pdfPreviewOpen}
          onOpenChange={setPdfPreviewOpen}
          title={`Employee Profile - ${pdfPreviewEmployee.firstName} ${pdfPreviewEmployee.lastName}`}
          description={`Employee ID: ${pdfPreviewEmployee.id}`}
          fileName={`employee-${pdfPreviewEmployee.firstName}-${pdfPreviewEmployee.lastName}.pdf`}
          renderDocument={async () => {
            const { default: EmployeeViewPDF } = await import("@/components/employees/employee-view-pdf")
            return <EmployeeViewPDF employee={pdfPreviewEmployee} />
          }}
        />
      )}
    </div>
  )
}

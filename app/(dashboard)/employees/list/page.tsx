"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  MoreHorizontal,
  Plus,
  Search,
  User,
  Building,
  Briefcase,
  Users,
  Mail,
  Phone,
  Calendar,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  Edit,
  Eye,
  Trash,
} from "lucide-react"
import { employeeService } from "@/services/employeeService"
import { designationService } from "@/services/designationService"
import { departmentService } from "@/services/departmentService"
import { companyService } from "@/services/companyService"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Employee, EmployeeSearchParams, IEmployeeEmploymentHistory } from "@/types/employee"
import { Company } from "@/types/company"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TerminateEmployeeDialog } from "@/components/employees/terminate-employee-dialog"
// import { EmployeeViewPDF } from "@/components/employees/employee-view-pdf"
// import { PDFViewer } from "@/components/pdf-viewer"

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
  const [searchParams, setSearchParams] = useState<EmployeeSearchParams>({
    page: 1,
    limit: 10,
  })
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [designations, setDesignations] = useState<Designation[]>([])
  const [employeeDepartments, setEmployeeDepartments] = useState<EmployeeDepartment[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    fetchEmployees()
    fetchDesignations()
    fetchEmployeeDepartments()
    fetchCompanies()
  }, [searchParams])

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
      const response = await employeeService.getEmployees(searchParams)
      setEmployees(response.data?.data || [])
      const total = response.data?.total || 0
      setTotalCount(total)
      const limit = searchParams.limit || 10
      setTotalPages(Math.ceil(total / limit))
    } catch (error) {
      console.error("Error fetching employees:", error)
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

  const fetchCompanies = async () => {
    try {
      const response = await companyService.getCompanies()

      if (response.data && response.data.companies) {
        setCompanies(response.data.companies)
      } else {
        setCompanies([])
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
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
    console.log("Edit employee:", JSON.stringify(employee, null, 2))
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
    setSearchParams({ ...searchParams, page: 1 })
  }

  const handlePageChange = (newPage: number | string | undefined) => {
    const pageNum = Number(newPage)
    if (!pageNum || isNaN(pageNum)) return // Prevent NaN and 0
    setSearchParams({ ...searchParams, page: pageNum })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-sm text-gray-500">View and manage all employees</p>
        </div>
        <Link href="/employees/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Search Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Input
                  placeholder="Search employees"
                  value={searchParams.searchText || ""}
                  onChange={(e) => setSearchParams({ ...searchParams, searchText: e.target.value })}
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
                <Select
                  value={searchParams.companyId}
                  onValueChange={(value) =>
                    setSearchParams({
                      ...searchParams,
                      companyId: value === "all" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id ?? ""}>
                        {c.name}
                      </SelectItem>
                    ))}
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
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        Loading employees...
                      </TableCell>
                    </TableRow>
                  ) : employees.length > 0 ? (
                    employees.map((employee) => (
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
                                className="text-xs text-primary hover:underline"
                              >
                                ID: {employee.id}
                              </button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10">
                              {employee.employmentHistories.find((h: IEmployeeEmploymentHistory) => h.status === "ACTIVE")?.designationName || "N/A"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10">
                              {employee.employmentHistories.find((h: IEmployeeEmploymentHistory) => h.status === "ACTIVE")?.departmentName || "N/A"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10">
                              {employee.employmentHistories.find((h: IEmployeeEmploymentHistory) => h.status === "ACTIVE")?.companyName || "N/A"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleView(employee)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(employee)}>
                              <Edit className="h-4 w-4" />
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        No employees found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={searchParams.page}
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
                    <h3 className="text-xl font-bold">{`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}</h3>
                    <p className="text-sm text-muted-foreground">ID: {selectedEmployee.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Designation</p>
                    <p>{selectedEmployee.employmentHistories.find((h: IEmployeeEmploymentHistory) => h.status === "ACTIVE")?.designationName || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Department</p>
                    <p>{selectedEmployee.employmentHistories.find((h: IEmployeeEmploymentHistory) => h.status === "ACTIVE")?.departmentName || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Company</p>
                    <p>{selectedEmployee.employmentHistories.find((h: IEmployeeEmploymentHistory) => h.status === "ACTIVE")?.companyName || "N/A"}</p>
                  </div>
                  {selectedEmployee.contactDetails?.mobileNumber && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Email</p>
                      <p>{selectedEmployee.contactDetails?.mobileNumber}</p>
                    </div>
                  )}
                  {/* {selectedEmployee.phone && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Phone</p>
                      <p>{selectedEmployee.phone}</p>
                    </div>
                  )} */}
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
    </div>
  )
}

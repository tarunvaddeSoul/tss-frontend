"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, Edit, Search, Trash, Download, Plus } from "lucide-react"
import { employeeService } from "@/services/employeeService"
import { designationService } from "@/services/designationService"
import { departmentService } from "@/services/departmentService"
import { companyService } from "@/services/companyService"
import { pdf } from "@react-pdf/renderer"
import dynamic from "next/dynamic"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Employee, EmployeeSearchParams } from "@/types/employee"
import { Company } from "@/types/company"
import Link from "next/link"

// Dynamically import the PDF component to avoid SSR issues
const EmployeeViewPDF = dynamic(() => import("@/components/employees/employee-view-pdf"), {
  ssr: false,
  loading: () => <p>Loading PDF generator...</p>,
})

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
  const [searchParams, setSearchParams] = useState<EmployeeSearchParams>({
    page: 1,
    limit: 10,
  })
  const [totalPages, setTotalPages] = useState(1)
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
      setEmployees(response.data)
      setTotalPages(Math.ceil(response.data.total / 10))
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
    router.push(`/employees/edit/${employee.id}`)
  }

  const handleIdClick = (id: string) => {
    router.push(`/employees/${id}`)
  }

  const handleDelete = (id: string) => {
    // Handle delete logic
    console.log("Delete employee with ID:", id)
  }

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSearchParams({ ...searchParams, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    setSearchParams({ ...searchParams, page: newPage })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  // Generate pagination items
  const paginationItems = []
  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(
      <PaginationItem key={i}>
        <PaginationLink isActive={searchParams.page === i} onClick={() => handlePageChange(i)}>
          {i}
        </PaginationLink>
      </PaginationItem>,
    )
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

      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
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
                            {employee.employmentHistories[0]?.designationName || "N/A"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/10">
                            {employee.employmentHistories[0]?.departmentName || "N/A"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/10">
                            {employee.employmentHistories[0]?.companyName || "N/A"}
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
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(employee.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
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

          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={searchParams.page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </CardContent>
      </Card>

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
                    <p>{selectedEmployee.employmentHistories[0]?.designationName || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Department</p>
                    <p>{selectedEmployee.employmentHistories[0]?.departmentName || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Company</p>
                    <p>{selectedEmployee.employmentHistories[0]?.companyName || "N/A"}</p>
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
    </div>
  )
}

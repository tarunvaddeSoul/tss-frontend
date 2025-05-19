"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Search } from "lucide-react"
import { format } from "date-fns"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"

// Services
import { employeeService } from "@/services/employeeService"
import { designationService } from "@/services/designationService"
import { departmentService } from "@/services/departmentService"
import { companyService } from "@/services/companyService"

// Types
import type { Employee } from "@/types/employee"
import type { Designation } from "@/services/designationService"
import type { Department } from "@/services/departmentService"
import type { Company } from "@/types/company"

interface AdvancedSearchFormValues {
  searchText: string
  designationId: string
  employeeDepartmentId: string
  companyId: string
  gender: string
  category: string
  highestEducationQualification: string
  ageRange: [number, number]
  sortBy: string
  sortOrder: "asc" | "desc"
  startDate: Date | null
  endDate: Date | null
}

export default function AdvancedEmployeeSearch() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])
  const [employeeDepartments, setEmployeeDepartments] = useState<Department[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()

  // Form setup
  const { register, handleSubmit, setValue, reset, watch } = useForm<AdvancedSearchFormValues>({
    defaultValues: {
      searchText: "",
      designationId: "",
      employeeDepartmentId: "",
      companyId: "",
      gender: "",
      category: "",
      highestEducationQualification: "",
      ageRange: [15, 65],
      sortBy: "lastName",
      sortOrder: "asc",
      startDate: null,
      endDate: null,
    },
  })

  const formValues = watch()

  useEffect(() => {
    fetchDesignations()
    fetchEmployeeDepartments()
    fetchCompanies()
    fetchEmployees(1)
  }, [])

  function formatDateToDDMMYYYY(date: Date): string {
    return format(date, "dd-MM-yyyy")
  }

  const fetchEmployees = async (currentPage = 1) => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: 10,
        searchText: formValues.searchText,
        designationId: formValues.designationId,
        employeeDepartmentId: formValues.employeeDepartmentId,
        companyId: formValues.companyId,
        gender: formValues.gender,
        category: formValues.category,
        highestEducationQualification: formValues.highestEducationQualification,
        minAge: formValues.ageRange[0],
        maxAge: formValues.ageRange[1],
        sortBy: formValues.sortBy || "lastName",
        sortOrder: formValues.sortOrder || "asc",
        startDate: formValues.startDate ? formatDateToDDMMYYYY(formValues.startDate) : undefined,
        endDate: formValues.endDate ? formatDateToDDMMYYYY(formValues.endDate) : undefined,
      }

      const response = await employeeService.getEmployees(params)
      setEmployees(response.data)
      setTotalPages(Math.ceil(response.total / 10))
    } catch (error) {
      console.error("Error fetching employees:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDesignations = async () => {
    try {
      const data = await designationService.getDesignations()
      setDesignations(data)
    } catch (error) {
      console.error("Error fetching designations:", error)
    }
  }

  const fetchEmployeeDepartments = async () => {
    try {
      const data = await departmentService.getEmployeeDepartments()
      setEmployeeDepartments(data)
    } catch (error) {
      console.error("Error fetching employee departments:", error)
    }
  }

  const fetchCompanies = async () => {
    try {
      const data = await companyService.getCompanies()
      setCompanies(data.data?.companies || [])
    } catch (error) {
      console.error("Error fetching companies:", error)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchEmployees()
  }

  const handleClearFilters = () => {
    reset()
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchEmployees(newPage)
  }

  const handleIdClick = (id: string) => {
    router.push(`/employees/${id}`)
  }

  const handleAgeRangeChange = (value: number[]) => {
    setValue("ageRange", [value[0], value[1]] as [number, number])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced Employee Search</h1>
        <p className="text-muted-foreground">Search for employees using multiple criteria</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
          <CardDescription>Use the filters below to find specific employees</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSearch)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="searchText">Search</Label>
                <Input id="searchText" placeholder="Search by name or ID" {...register("searchText")} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="designationId">Designation</Label>
                  <Select onValueChange={(value) => setValue("designationId", value)} value={formValues.designationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {designations.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeDepartmentId">Department</Label>
                  <Select
                    onValueChange={(value) => setValue("employeeDepartmentId", value)}
                    value={formValues.employeeDepartmentId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {employeeDepartments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyId">Company</Label>
                  <Select onValueChange={(value) => setValue("companyId", value)} value={formValues.companyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {companies.map((c) => (
                        <SelectItem key={c.id ?? ""} value={c.id ?? ""}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortBy">Sort By</Label>
                  <Select onValueChange={(value) => setValue("sortBy", value)} value={formValues.sortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field to sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="firstName">First Name</SelectItem>
                      <SelectItem value="lastName">Last Name</SelectItem>
                      <SelectItem value="age">Age</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Select
                    onValueChange={(value) => setValue("sortOrder", value as "asc" | "desc")}
                    value={formValues.sortOrder}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sort order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <DatePicker date={formValues.startDate} onSelect={(date) => setValue("startDate", date)} />
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <DatePicker date={formValues.endDate} onSelect={(date) => setValue("endDate", date)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Age Range: {formValues.ageRange[0]} - {formValues.ageRange[1]}
                </Label>
                <Slider
                  min={15}
                  max={75}
                  step={1}
                  value={[formValues.ageRange[0], formValues.ageRange[1]]}
                  onValueChange={handleAgeRangeChange}
                  className="py-4"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => setValue("gender", value)} value={formValues.gender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setValue("category", value)} value={formValues.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="ST">ST</SelectItem>
                      <SelectItem value="OBC">OBC</SelectItem>
                      <SelectItem value="GENERAL">GENERAL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="highestEducationQualification">Highest Education Qualification</Label>
                <Select
                  onValueChange={(value) => setValue("highestEducationQualification", value)}
                  value={formValues.highestEducationQualification}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="UNDER_8">Under 8th</SelectItem>
                    <SelectItem value="EIGHT">8th</SelectItem>
                    <SelectItem value="TEN">10th</SelectItem>
                    <SelectItem value="TWELVE">12th</SelectItem>
                    <SelectItem value="GRADUATE">Graduate</SelectItem>
                    <SelectItem value="POST_GRADUATE">Post Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
                <Button type="submit">
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
          <CardTitle>Search Results</CardTitle>
          <CardDescription>Showing {employees.length} results</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : employees.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Age</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <Button
                            variant="link"
                            onClick={() => handleIdClick(employee.id)}
                            className="p-0 h-auto font-normal text-primary"
                          >
                            {employee.id}
                          </Button>
                        </TableCell>
                        <TableCell>{`${employee.firstName} ${employee.lastName}`}</TableCell>
                        <TableCell>{employee.employmentHistories?.[0]?.designation?.name || "N/A"}</TableCell>
                        <TableCell>{employee.employmentHistories?.[0]?.department?.name || "N/A"}</TableCell>
                        <TableCell>{employee.employmentHistories?.[0]?.company?.name || "N/A"}</TableCell>
                        <TableCell>{employee.gender}</TableCell>
                        <TableCell>{employee.age}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-center mt-4">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No results found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

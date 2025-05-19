"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  FileText,
  FileSpreadsheet,
  Eye,
  Edit,
  Trash,
  Download,
  ArrowUpDown,
  Users,
  Calendar,
} from "lucide-react"
import { pdf } from "@react-pdf/renderer"
import * as XLSX from "xlsx"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from "@/components/ui/use-toast"
import { companyService } from "@/services/companyService"
import type { Company, CompanySearchParams, CompanyEmployee } from "@/types/company"

// Dynamically import the PDF component to avoid SSR issues
const CompanyViewPDF = dynamic(() => import("@/components/companies/company-view-pdf"), {
  ssr: false,
  loading: () => <p>Loading PDF generator...</p>,
})

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [companyEmployees, setCompanyEmployees] = useState<CompanyEmployee[]>([])
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("details")
  const [searchParams, setSearchParams] = useState<CompanySearchParams>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  })
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
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

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await companyService.getCompanies(searchParams)
      if (response.data?.companies) {
        setCompanies(response.data.companies)
        setTotalPages(Math.ceil((response.data.total || 0) / (searchParams.limit || 10)))
      } else {
        setCompanies([])
        setTotalPages(1)
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load companies. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanyEmployees = async (companyId: string) => {
    try {
      setEmployeesLoading(true)
      const response = await companyService.getCompanyEmployees(companyId)
      setCompanyEmployees(response.data || [])
    } catch (error) {
      console.error("Error fetching company employees:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load company employees.",
      })
    } finally {
      setEmployeesLoading(false)
    }
  }

  const handleView = async (company: Company) => {
    setSelectedCompany(company)
    setViewModalOpen(true)
    setActiveTab("details")

    // Clear any existing PDF
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
    }

    // Fetch employees for the company
    if (company.id) {
      await fetchCompanyEmployees(company.id)
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/companies/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      await companyService.deleteCompany(id)
      toast({
        title: "Success",
        description: "Company deleted successfully",
      })
      fetchCompanies()
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error(`Error deleting company with ID ${id}:`, error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete company. Please try again.",
      })
    }
  }

  const confirmDelete = (company: Company) => {
    setSelectedCompany(company)
    setDeleteDialogOpen(true)
  }

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSearchParams({ ...searchParams, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    setSearchParams({ ...searchParams, page: newPage })
  }

  const handleGeneratePDF = async () => {
    if (!selectedCompany) return

    try {
      setPdfLoading(true)
      // Generate PDF
      const blob = await pdf(<CompanyViewPDF company={selectedCompany} />).toBlob()
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setActiveTab("pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
      })
    } finally {
      setPdfLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!pdfUrl || !selectedCompany) return

    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = `company_${selectedCompany.name.replace(/\s+/g, "_").toLowerCase()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadExcel = () => {
    if (!selectedCompany) return

    // Create a workbook with company data
    const workbook = XLSX.utils.book_new()

    // Convert company object to a format suitable for Excel
    const companyData: Record<string, string> = {
      "Company Name": selectedCompany.name,
      Address: selectedCompany.address,
      "Contact Person": selectedCompany.contactPersonName,
      "Contact Number": selectedCompany.contactPersonNumber,
      Status: selectedCompany.status || "ACTIVE",
      "Onboarding Date": selectedCompany.companyOnboardingDate || "N/A",
    }

    // Add salary templates data
    Object.entries(selectedCompany.salaryTemplates || {}).forEach(([key, value]) => {
      if (value.enabled) {
        companyData[`Salary Template - ${key}`] = value.value !== undefined && value.value !== null ? String(value.value) : "N/A"
      }
    })

    const worksheet = XLSX.utils.json_to_sheet([companyData])
    XLSX.utils.book_append_sheet(workbook, worksheet, "Company Details")

    // Add employee data if available
    if (companyEmployees.length > 0) {
      const employeeData = companyEmployees.map((emp) => ({
        Name: `${emp.title || ""} ${emp.firstName} ${emp.lastName}`,
        Designation: emp.designation || "N/A",
        Department: emp.department || "N/A",
        Salary: emp.salary || 0,
        "Joining Date": emp.joiningDate || "N/A",
        "Leaving Date": emp.leavingDate || "N/A",
      }))

      const employeeSheet = XLSX.utils.json_to_sheet(employeeData)
      XLSX.utils.book_append_sheet(workbook, employeeSheet, "Company Employees")
    }

    // Generate Excel file
    XLSX.writeFile(workbook, `company_${selectedCompany.name.replace(/\s+/g, "_").toLowerCase()}.xlsx`)
  }

  const handleSortChange = (column: string) => {
    const newSortOrder = searchParams.sortBy === column && searchParams.sortOrder === "asc" ? "desc" : "asc"
    setSearchParams({
      ...searchParams,
      sortBy: column,
      sortOrder: newSortOrder,
    })
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

  // Count enabled salary template fields
  const getEnabledTemplateCount = (company: Company) => {
    return Object.values(company.salaryTemplates || {}).filter((field) => field.enabled).length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">Manage your company records</p>
        </div>
        <Button onClick={() => router.push("/companies/add")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Search Companies</CardTitle>
          <CardDescription>Find companies by name, address, or contact person</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search companies..."
                value={searchParams.searchText || ""}
                onChange={(e) => setSearchParams({ ...searchParams, searchText: e.target.value })}
                className="w-full"
              />
            </div>
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Company List</CardTitle>
          <CardDescription>
            Showing {companies.length} of {totalPages * (searchParams.limit || 10)} companies
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSortChange("name")}
                      className="flex items-center gap-1 font-medium"
                    >
                      Company Name
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Onboarding Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-6 w-[200px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[250px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[100px] ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : companies.length > 0 ? (
                  companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        {company.name}
                        <div className="text-xs text-muted-foreground mt-1">
                          {company.id ? <span>ID: {company.id}</span> : null}
                        </div>
                      </TableCell>
                      <TableCell>{company.address}</TableCell>
                      <TableCell>
                        <div className="font-medium">{company.contactPersonName}</div>
                        <div className="text-sm text-muted-foreground">{company.contactPersonNumber}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={company.status === "ACTIVE" ? "outline" : "secondary"}
                          className={
                            company.status === "ACTIVE"
                              ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }
                        >
                          {company.status || "ACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {company.companyOnboardingDate ? (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {company.companyOnboardingDate}
                          </div>
                        ) : (
                          "Not specified"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleView(company)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => company.id && router.push(`/companies/templates?id=${company.id}`)}
                            title="Salary Templates"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => company.id && handleEdit(company.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(company)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      No companies found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-6">
          <Pagination
            currentPage={searchParams.page ?? 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </CardFooter>
      </Card>

      {/* View Company Dialog */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
            <DialogDescription>View detailed information about the company</DialogDescription>
          </DialogHeader>

          {selectedCompany && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Basic Details</TabsTrigger>
                <TabsTrigger value="salary-templates">Salary Templates</TabsTrigger>
                <TabsTrigger value="employees">Employees</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Company Name</h3>
                    <p className="text-base">{selectedCompany.name}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                    <p className="text-base">{selectedCompany.address}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Contact Person</h3>
                    <p className="text-base">{selectedCompany.contactPersonName}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Contact Number</h3>
                    <p className="text-base">{selectedCompany.contactPersonNumber}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <Badge
                      variant={selectedCompany.status === "ACTIVE" ? "outline" : "secondary"}
                      className={
                        selectedCompany.status === "ACTIVE"
                          ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }
                    >
                      {selectedCompany.status || "ACTIVE"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Onboarding Date</h3>
                    <p className="text-base">{selectedCompany.companyOnboardingDate || "Not specified"}</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => selectedCompany?.id && router.push(`/companies/templates?id=${selectedCompany.id}`)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Edit Salary Templates
                  </Button>
                  <Button variant="outline" onClick={handleDownloadExcel}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export to Excel
                  </Button>
                  <Button onClick={handleGeneratePDF} disabled={pdfLoading}>
                    <FileText className="mr-2 h-4 w-4" />
                    {pdfLoading ? "Generating PDF..." : "Generate PDF"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="salary-templates" className="pt-4">
                {Object.entries(selectedCompany.salaryTemplates || {}).length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field Name</TableHead>
                          <TableHead>Enabled</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(selectedCompany.salaryTemplates).map(([key, field]) => (
                          <TableRow key={key}>
                            <TableCell className="font-medium">{key}</TableCell>
                            <TableCell>
                              <Badge variant={field.enabled ? "default" : "secondary"}>
                                {field.enabled ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell>{field.value || "Not specified"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-10">
                    <p className="text-muted-foreground">No salary template configuration found.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="employees" className="pt-4">
                {employeesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : companyEmployees.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Designation</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Joining Date</TableHead>
                          <TableHead>Salary</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companyEmployees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell className="font-medium">
                              {employee.title} {employee.firstName} {employee.lastName}
                            </TableCell>
                            <TableCell>{employee.designation}</TableCell>
                            <TableCell>{employee.department}</TableCell>
                            <TableCell>{employee.joiningDate}</TableCell>
                            <TableCell>₹{employee.salary.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <Users className="h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No employees found for this company.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {pdfUrl && (
            <Dialog>
              <DialogContent className="max-w-4xl max-h-screen">
                <DialogHeader>
                  <DialogTitle>PDF Preview</DialogTitle>
                </DialogHeader>
                <div className="overflow-hidden h-[70vh]">
                  <iframe src={pdfUrl} className="w-full h-full" />
                </div>
                <DialogFooter>
                  <Button onClick={handleDownloadPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the company "{selectedCompany?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => selectedCompany?.id && handleDelete(selectedCompany.id)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

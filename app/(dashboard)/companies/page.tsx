"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Edit, Trash2, Eye, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { companyService } from "@/services/companyService"
import type { Company, CompanySearchParams } from "@/types/company"
import { CompanyViewDialog } from "@/components/companies/company-view-dialog"

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchParams, setSearchParams] = useState<CompanySearchParams>({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "asc",
  })
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const router = useRouter()

  // Fetch companies
  useEffect(() => {
    fetchCompanies()
  }, [searchParams])

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      const response = await companyService.getCompanies(searchParams)
      setCompanies(response.data?.companies || [])
      const total = response.data?.total || 0
      setTotalCount(total)
      const limit = searchParams.limit || 10
      setTotalPages(Math.ceil(total / limit))
    } catch (error) {
      console.error("Error fetching companies:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch companies. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const searchText = formData.get("searchText") as string

    setSearchParams({
      ...searchParams,
      searchText: searchText || undefined,
      page: 1, // Reset to first page on new search
    })
  }

  // Handle sort
  const handleSort = (column: string) => {
    const isCurrentColumn = searchParams.sortBy === column
    const newSortOrder = isCurrentColumn && searchParams.sortOrder === "asc" ? "desc" : "asc"

    setSearchParams({
      ...searchParams,
      sortBy: column,
      sortOrder: newSortOrder,
    })
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setSearchParams({
      ...searchParams,
      page,
    })
  }

  // Handle view company
  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company)
    setViewDialogOpen(true)
  }

  // Handle delete company
  const handleDeleteCompany = async () => {
    if (!selectedCompany?.id) return

    try {
      await companyService.deleteCompany(selectedCompany.id)
      fetchCompanies() // Refresh the list
      setDeleteDialogOpen(false)

      toast({
        title: "Success",
        description: "Company deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting company:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete company. Please try again.",
      })
    }
  }

  // Confirm delete
  const confirmDelete = (company: Company) => {
    setSelectedCompany(company)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">Manage your companies and their salary templates</p>
        </div>
        <Button  onClick={() => router.push("/companies/add")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Search Companies</CardTitle>
          <CardDescription>Find companies by name, contact person, or other details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                name="searchText"
                placeholder="Search companies..."
                defaultValue={searchParams.searchText || ""}
                className="pl-8"
              />
            </div>
            <Button type="submit">Search</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSearchParams({ ...searchParams, searchText: undefined })}
            >
              Clear
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Companies List</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading companies..."
                  : `Showing ${companies.length} of ${totalCount} companies`}
              </CardDescription>
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 font-medium p-0 h-auto"
                      onClick={() => handleSort("name")}
                    >
                      Company Name
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 font-medium p-0 h-auto"
                      onClick={() => handleSort("status")}
                    >
                      Status
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 font-medium p-0 h-auto"
                      onClick={() => handleSort("companyOnboardingDate")}
                    >
                      Onboarding Date
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-6 w-[200px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[120px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[100px]" />
                      </TableCell>
                      <TableCell className="text-right">
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
                      <TableCell>{company.contactPersonName}</TableCell>
                      <TableCell>{company.contactPersonNumber}</TableCell>
                      <TableCell>
                        <Badge variant={company.status === "ACTIVE" ? "default" : "secondary"}>
                          {company.status || "ACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell>{company.companyOnboardingDate || "Not specified"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewCompany(company)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => company.id && router.push(`/companies/edit/${company.id}`)}
                            title="Edit Company"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(company)}
                            title="Delete Company"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="text-lg font-medium">No companies found</div>
                        <div className="text-sm text-muted-foreground">
                          {searchParams.searchText
                            ? "Try adjusting your search terms"
                            : "Get started by adding your first company"}
                        </div>
                        {!searchParams.searchText && (
                          <Button className="mt-2" onClick={() => router.push("/companies/add")}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Company
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex justify-center pt-6">
            <Pagination currentPage={searchParams.page ?? 1} totalPages={totalPages} onPageChange={handlePageChange} />
          </CardFooter>
        )}
      </Card>

      {/* Company View Dialog */}
      {selectedCompany && (
        <CompanyViewDialog
          company={selectedCompany}
          isOpen={viewDialogOpen}
          onClose={() => {
            setViewDialogOpen(false)
            setSelectedCompany(null)
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the company "{selectedCompany?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCompany} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

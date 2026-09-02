"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Edit, Eye, ArrowUpDown, XCircle, FileText, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { label, formatDate } from "@/lib/labels"
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
import { PageHeader } from "@/components/layout/page-header"
import { clientService } from "@/services/clientService"
import type { Client, ClientSearchParams } from "@/types/client"
import { ClientViewDialog } from "@/components/clients/client-view-dialog"
import { TerminateClientDialog } from "@/components/clients/terminate-client-dialog"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [searchParams, setSearchParams] = useState<ClientSearchParams>({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "asc",
  })
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false)
  const [clientToTerminate, setClientToTerminate] = useState<Client | null>(null)

  const router = useRouter()

  // Fetch clients
  useEffect(() => {
    fetchClients()
  }, [searchParams])

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      setError(false)
      const response = await clientService.getClients(searchParams)
      setClients(response.data?.clients || [])
      const total = response.data?.total || 0
      setTotalCount(total)
      const limit = searchParams.limit || 10
      setTotalPages(Math.ceil(total / limit))
    } catch (error) {
      console.error("Error fetching clients:", error)
      setClients([])
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSearchParams({
      ...searchParams,
      searchText: searchInput.trim() || undefined,
      page: 1, // Reset to first page on new search
    })
  }

  const handleClear = () => {
    setSearchInput("")
    setSearchParams({
      ...searchParams,
      searchText: undefined,
      status: undefined,
      page: 1,
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

  // Handle view client
  const handleViewClient = (client: Client) => {
    setSelectedClient(client)
    setViewDialogOpen(true)
  }

  // Handle terminate client
  const handleTerminate = (client: Client) => {
    if (client.status === "INACTIVE") {
      toast({
        variant: "destructive",
        title: "Already Inactive",
        description: "This client is already marked inactive.",
      })
      return
    }
    setClientToTerminate(client)
    setTerminateDialogOpen(true)
  }

  const handleTerminationSuccess = () => {
    fetchClients() // Refresh the list
  }

  return (
    <div className="space-y-6">
      <PageHeader
        no="05"
        eyebrow="Client register"
        title="Clients"
        description="Manage your clients and their salary templates"
        actions={
          <Button onClick={() => router.push("/clients/add")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        }
      />

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Search Clients</CardTitle>
          <CardDescription>Find clients by name, contact person, status, or other details</CardDescription>
        </CardHeader>
        <CardContent>
          <form noValidate onSubmit={handleSearch} className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="searchText"
                  placeholder="Search clients..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-8"
                />
              </div>
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
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit">Search</Button>
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Clients List</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading clients..."
                  : error
                    ? "Could not load clients."
                    : `Showing ${clients.length} of ${totalCount} clients`}
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
          <div className="rounded-md border overflow-x-auto scrollbar-sleek">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 font-medium p-0 h-auto"
                      onClick={() => handleSort("name")}
                    >
                      Client Name
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
                      onClick={() => handleSort("clientOnboardingDate")}
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
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10">
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                        <p className="text-sm text-muted-foreground">
                          Could not load clients. Check your connection and try again.
                        </p>
                        <Button variant="outline" size="sm" onClick={() => fetchClients()}>
                          Retry
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : clients.length > 0 ? (
                  clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        {client.name}
                        <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                          {client.id ? <span>ID: {client.id}</span> : null}
                        </div>
                      </TableCell>
                      <TableCell>{client.contactPersonName}</TableCell>
                      <TableCell className="font-mono text-[13px]">{client.contactPersonNumber}</TableCell>
                      <TableCell>
                        <Badge variant={client.status === "ACTIVE" ? "success" : "destructive"}>
                          {label.status(client.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-[13px]">{formatDate(client.clientOnboardingDate)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewClient(client)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => client.id && router.push(`/clients/edit/${client.id}`)}
                            title="Edit Client"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => client.id && router.push(`/clients/salary-slips?clientId=${client.id}`)}
                            title="Salary Slip"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          {client.status !== "INACTIVE" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleTerminate(client)}
                              title="Mark inactive"
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
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="registry-eyebrow">No records on file</div>
                        <div className="text-sm text-muted-foreground">
                          {searchParams.searchText
                            ? "No clients match this search. Try adjusting your search terms."
                            : "Get started by adding your first client."}
                        </div>
                        {!searchParams.searchText && (
                          <Button className="mt-2" onClick={() => router.push("/clients/add")}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Client
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

      {/* Client View Dialog */}
      {selectedClient && (
        <ClientViewDialog
          client={selectedClient}
          isOpen={viewDialogOpen}
          onClose={() => {
            setViewDialogOpen(false)
            setSelectedClient(null)
          }}
        />
      )}

      {/* Terminate Client Dialog */}
      {clientToTerminate && (
        <TerminateClientDialog
          client={clientToTerminate}
          open={terminateDialogOpen}
          onOpenChange={(open) => {
            setTerminateDialogOpen(open)
            if (!open) setClientToTerminate(null)
          }}
          onSuccess={handleTerminationSuccess}
        />
      )}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Building2, Calendar as CalendarIcon, Eye, Loader2, Trash2, Download, FileText, Search, ArrowUpDown, X, Filter } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { MonthPicker } from "@/components/ui/month-picker"
import { Badge } from "@/components/ui/badge"
import { useCompany } from "@/hooks/use-company"
import { attendanceSheetService, type AttendanceSheet, type AttendanceSheetListParams } from "@/services/attendanceSheetService"
import type { Company } from "@/types/company"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"

const schema = z.object({
  companyId: z.string().optional(),
  month: z.date().optional(),
  startMonth: z.date().optional(),
  endMonth: z.date().optional(),
}).refine((data) => {
  // Either month OR (startMonth and endMonth), not both
  if (data.month && (data.startMonth || data.endMonth)) {
    return false
  }
  if (data.startMonth && data.endMonth && data.startMonth > data.endMonth) {
    return false
  }
  return true
}, {
  message: "Either select a single month OR a date range, and start month must be before end month",
})

type FormValues = z.infer<typeof schema>

export default function AttendanceRecordsPage() {
  const { data: companiesData, isLoading: companiesLoading, fetchCompanies } = useCompany()
  const companies: Company[] = companiesData?.companies || []
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<AttendanceSheet[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<"pdf" | "image" | "unsupported" | "loading">("loading")
  const [previewSheet, setPreviewSheet] = useState<AttendanceSheet | null>(null)

  // Pagination and sorting
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [sortBy, setSortBy] = useState<"month" | "companyId" | "createdAt">("month")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: undefined,
      month: undefined,
      startMonth: undefined,
      endMonth: undefined,
    },
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  // Fetch records when filters change
  useEffect(() => {
    fetchRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, sortBy, sortOrder, form.watch("companyId"), form.watch("month"), form.watch("startMonth"), form.watch("endMonth")])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const values = form.getValues()
      
      const params: AttendanceSheetListParams = {
        page,
        limit,
        sortBy,
        sortOrder,
      }

      if (values.companyId) {
        params.companyId = values.companyId
      }

      if (values.month) {
        params.month = format(values.month, "yyyy-MM")
      } else if (values.startMonth && values.endMonth) {
        params.startMonth = format(values.startMonth, "yyyy-MM")
        params.endMonth = format(values.endMonth, "yyyy-MM")
      }

      const response = await attendanceSheetService.list(params)
      
      // Handle response - can be list or single record
      if (response.data && Array.isArray((response.data as any).data)) {
        // List response
        const listData = response.data as { data: AttendanceSheet[]; pagination: any }
        setRecords(listData.data || [])
        setTotalCount(listData.pagination?.total || 0)
        setTotalPages(listData.pagination?.totalPages || 1)
      } else if (response.data && !Array.isArray(response.data) && (response.data as any).id) {
        // Single record response (backward compatibility)
        setRecords([response.data as AttendanceSheet])
        setTotalCount(1)
        setTotalPages(1)
      } else {
        setRecords([])
        setTotalCount(0)
        setTotalPages(1)
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to load records",
        variant: "destructive",
      })
      setRecords([])
      setTotalCount(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = (values: FormValues) => {
    setPage(1) // Reset to first page on new search
    fetchRecords()
  }

  const handleClearFilters = () => {
    form.reset({
      companyId: undefined,
      month: undefined,
      startMonth: undefined,
      endMonth: undefined,
    })
    setPage(1)
  }

  const handleSort = (column: "month" | "companyId" | "createdAt") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
    setPage(1)
  }

  const handleDelete = async (record: AttendanceSheet) => {
    if (!confirm(`Are you sure you want to delete the attendance sheet for ${record.companyName || "company"} - ${format(new Date(`${record.month}-01`), "MMMM yyyy")}?`)) {
      return
    }

    try {
      setLoading(true)
      await attendanceSheetService.delete(record.id)
      toast({ title: "Deleted", description: "Attendance sheet deleted successfully" })
      fetchRecords()
    } catch (e: any) {
      toast({
        title: "Delete failed",
        description: e?.message || "Unable to delete",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to add cache-busting query parameter to URL
  const addCacheBuster = (url: string): string => {
    if (!url) return url
    const separator = url.includes("?") ? "&" : "?"
    return `${url}${separator}_t=${Date.now()}`
  }

  const handleViewSheet = async (sheet: AttendanceSheet) => {
    setPreviewSheet(sheet)
    const cacheBustedUrl = addCacheBuster(sheet.attendanceSheetUrl)
    setPreviewUrl(cacheBustedUrl)
    setPreviewOpen(true)
    setPreviewType("loading")

    try {
      const response = await fetch(cacheBustedUrl, {
        method: "HEAD",
        cache: "no-store",
      })
      const contentType = response.headers.get("Content-Type") || ""
      const urlLower = sheet.attendanceSheetUrl.toLowerCase()

      if (contentType.includes("pdf") || urlLower.includes(".pdf") || urlLower.endsWith(".pdf")) {
        setPreviewType("pdf")
        return
      }

      if (
        contentType.includes("image") ||
        contentType.includes("jpeg") ||
        contentType.includes("jpg") ||
        contentType.includes("png") ||
        contentType.includes("gif") ||
        contentType.includes("webp") ||
        urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)
      ) {
        setPreviewType("image")
        return
      }

      if (!contentType || contentType === "application/octet-stream" || contentType.includes("binary")) {
        setPreviewType("image")
      } else {
        setPreviewType("image")
      }
    } catch (error) {
      console.log("HEAD request failed, using URL detection:", error)
      const urlLower = sheet.attendanceSheetUrl.toLowerCase()

      if (urlLower.includes(".pdf") || urlLower.endsWith(".pdf")) {
        setPreviewType("pdf")
      } else if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)) {
        setPreviewType("image")
      } else {
        setPreviewType("image")
      }
    }
  }

  const handleDownload = async (url: string, sheet: AttendanceSheet) => {
    try {
      const response = await fetch(url, { cache: "no-store" })
      if (!response.ok) throw new Error("Failed to download")

      const blob = await response.blob()
      const contentType = response.headers.get("Content-Type") || "application/octet-stream"

      let extension = ""
      if (contentType.includes("pdf")) extension = ".pdf"
      else if (contentType.includes("jpeg") || contentType.includes("jpg")) extension = ".jpg"
      else if (contentType.includes("png")) extension = ".png"
      else if (contentType.includes("gif")) extension = ".gif"
      else if (contentType.includes("webp")) extension = ".webp"
      else {
        const urlLower = url.toLowerCase()
        const match = urlLower.match(/\.([a-z0-9]+)(?:\?|$)/)
        if (match) extension = `.${match[1]}`
        else extension = ".jpg"
      }

      const filename = `attendance-sheet-${sheet.companyName || "sheet"}-${sheet.month}${extension}`
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)

      toast({
        title: "Download Started",
        description: "File download started successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
      })
    }
  }

  const hasActiveFilters = form.watch("companyId") || form.watch("month") || form.watch("startMonth") || form.watch("endMonth")

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Records</h1>
          <p className="text-muted-foreground">View and manage all uploaded attendance sheets</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
          <CardDescription>Filter attendance sheets by company and month</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Company
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "all" ? undefined : value)}
                        value={field.value || "all"}
                        disabled={companiesLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="All Companies" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Companies</SelectItem>
                          {companies.map((c) => (
                            <SelectItem key={c.id} value={c.id ?? ""}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Month (Single)
                      </FormLabel>
                      <FormControl>
                        <MonthPicker
                          value={field.value}
                          onChange={(date) => {
                            field.onChange(date)
                            // Clear range if single month is selected
                            if (date) {
                              form.setValue("startMonth", undefined)
                              form.setValue("endMonth", undefined)
                            }
                          }}
                          placeholder="Select month"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Start Month
                      </FormLabel>
                      <FormControl>
                        <MonthPicker
                          value={field.value}
                          onChange={(date) => {
                            field.onChange(date)
                            // Clear single month if range is selected
                            if (date) {
                              form.setValue("month", undefined)
                            }
                          }}
                          placeholder="From month"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        End Month
                      </FormLabel>
                      <FormControl>
                        <MonthPicker
                          value={field.value}
                          onChange={(date) => {
                            field.onChange(date)
                            // Clear single month if range is selected
                            if (date) {
                              form.setValue("month", undefined)
                            }
                          }}
                          placeholder="To month"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearFilters}
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attendance Sheets</CardTitle>
              <CardDescription>
                {loading
                  ? "Loading records..."
                  : totalCount > 0
                    ? `Showing ${records.length} of ${totalCount} record${totalCount !== 1 ? "s" : ""}`
                    : "No records found"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
              <Select
                value={String(limit)}
                onValueChange={(value) => {
                  setLimit(Number(value))
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Attendance Sheets Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {hasActiveFilters
                  ? "Try adjusting your filters to see more results."
                  : "Upload attendance sheets to see them here."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-2"
                          onClick={() => handleSort("companyId")}
                        >
                          Company
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-2"
                          onClick={() => handleSort("month")}
                        >
                          Month
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>File Type</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-2"
                          onClick={() => handleSort("createdAt")}
                        >
                          Upload Date
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => {
                      const monthDate = new Date(`${record.month}-01`)
                      const isPDF = record.attendanceSheetUrl.toLowerCase().includes(".pdf") ||
                        record.attendanceSheetUrl.toLowerCase().endsWith(".pdf")

                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.companyName || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {format(monthDate, "MMM yyyy")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isPDF ? "destructive" : "secondary"}>
                              {isPDF ? "PDF" : "Image"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.createdAt
                              ? format(new Date(record.createdAt), "MMM dd, yyyy")
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewSheet(record)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(addCacheBuster(record.attendanceSheetUrl), record)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(record)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(p) => setPage(typeof p === "number" ? p : 1)}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Document Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span>
                Attendance Sheet - {previewSheet?.companyName || "Sheet"} -{" "}
                {previewSheet?.month
                  ? format(new Date(`${previewSheet.month}-01`), "MMMM yyyy")
                  : ""}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previewUrl && previewSheet && handleDownload(previewUrl, previewSheet)}
                >
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>Attendance sheet document preview</DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
            <div className="border rounded-md overflow-hidden bg-white">
              {previewType === "loading" ? (
                <div className="flex items-center justify-center h-[70vh]">
                  <div className="text-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading preview...</p>
                  </div>
                </div>
              ) : previewType === "pdf" ? (
                <iframe
                  src={previewUrl || ""}
                  className="w-full h-[70vh] border-0"
                  key={previewUrl}
                />
              ) : previewType === "image" ? (
                <div className="flex items-center justify-center min-h-[70vh] bg-gray-50 p-4">
                  <img
                    src={previewUrl || ""}
                    alt="Attendance Sheet"
                    className="max-w-full max-h-[70vh] object-contain"
                    crossOrigin="anonymous"
                    key={previewUrl}
                    onError={(e) => {
                      console.error("❌ Image load error:", e, "URL:", previewUrl)
                      const urlLower = (previewUrl || "").toLowerCase()

                      if (urlLower.includes(".pdf") || urlLower.endsWith(".pdf")) {
                        setPreviewType("pdf")
                      } else if (!urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico|pdf)$/i)) {
                        setPreviewType("pdf")
                      } else {
                        setPreviewType("unsupported")
                      }
                    }}
                    onLoad={() => {
                      console.log("✅ Image loaded successfully:", previewUrl)
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center space-y-4">
                  <FileText className="h-16 w-16 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">File Preview Not Available</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This file type cannot be previewed in the browser.
                    </p>
                    <Button
                      onClick={() => previewUrl && previewSheet && handleDownload(previewUrl, previewSheet)}
                    >
                      <Download className="h-4 w-4 mr-2" /> Download File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 border-t">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

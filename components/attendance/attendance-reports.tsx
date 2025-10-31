"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, parse } from "date-fns"
import {
  Building2,
  Download,
  FileText,
  Users,
  Loader2,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Eye,
  Minus,
  Maximize2,
  FileSpreadsheet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { useCompany } from "@/hooks/use-company"
import { attendanceService } from "@/services/attendanceService"
import type { Company } from "@/types/company"
import type { AttendanceReportResponse } from "@/types/attendance"
import dynamic from "next/dynamic"
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

// Dynamically import PDF preview dialog to prevent SSR issues
const DynamicPdfPreviewDialog = dynamic(
  () => import("@/components/pdf/pdf-preview-dialog").then((mod) => ({ default: mod.PdfPreviewDialog })),
  {
    ssr: false,
  },
)

// Form validation schema
const reportsSchema = z.object({
  companyId: z.string().min(1, "Please select a company"),
  month: z.string().min(1, "Please select a month"),
})

type ReportsFormValues = z.infer<typeof reportsSchema>

export function AttendanceReportsComponent() {
  const [reportData, setReportData] = useState<AttendanceReportResponse["data"] | null>(null)
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMonths, setLoadingMonths] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)
  const [pdfOpen, setPdfOpen] = useState(false)
  const [sheetPreviewOpen, setSheetPreviewOpen] = useState(false)
  const [sheetPreviewUrl, setSheetPreviewUrl] = useState<string | null>(null)
  const [sheetPreviewType, setSheetPreviewType] = useState<"pdf" | "image" | "unsupported" | "loading">("loading")

  const { toast } = useToast()
  const { data, isLoading: companiesLoading, fetchCompanies } = useCompany()

  useEffect(() => {
    fetchCompanies()
  }, [])

  const form = useForm<ReportsFormValues>({
    resolver: zodResolver(reportsSchema),
    defaultValues: {
      companyId: "",
      month: "",
    },
  })

  const companies: Company[] = data?.companies || []

  // Fetch available months when company is selected
  const handleCompanyChange = async (companyId: string) => {
    form.setValue("companyId", companyId)
    form.setValue("month", "") // Reset month selection
    setReportGenerated(false)
    setReportData(null)

    if (!companyId) {
      setAvailableMonths([])
      return
    }

    try {
      setLoadingMonths(true)
      const response = await attendanceService.getAttendanceByCompanyId(companyId)
      // Extract unique months from the response
      const months = response.data?.map((record) => record.month) || []
      const uniqueMonths = [...new Set(months)].sort().reverse() // Sort in descending order (newest first)
      setAvailableMonths(uniqueMonths)
    } catch (error: any) {
      console.error("Error fetching available months:", error)
      toast({
        title: "Error",
        description: "Failed to fetch available months for this company.",
        variant: "destructive",
      })
      setAvailableMonths([])
    } finally {
      setLoadingMonths(false)
    }
  }

  const onSubmit = async (data: ReportsFormValues) => {
    try {
      setLoading(true)
      const response = await attendanceService.getAttendanceReport(data.companyId, data.month)
      
      if (response.statusCode === 200 && response.data) {
        setReportData(response.data)
        setReportGenerated(true)
        toast({
          title: "Report Generated",
          description: `Found ${response.data.records.length} attendance records for ${response.data.company.name} - ${format(parse(response.data.month, "yyyy-MM", new Date()), "MMMM yyyy")}.`,
        })
      } else {
        throw new Error(response.message || "Failed to generate report")
      }
    } catch (error: any) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate report. Please try again.",
        variant: "destructive",
      })
      setReportData(null)
      setReportGenerated(false)
    } finally {
      setLoading(false)
    }
  }

  // Generate CSV content
  const generateCSV = () => {
    if (!reportData?.records.length) return ""

    const headers = ["Employee ID", "Employee Name", "Department", "Designation", "Present Days"]
    const csvContent = [
      headers.join(","),
      ...reportData.records.map((record) =>
        [
          record.employeeID,
          `"${record.employeeName}"`,
          `"${record.departmentName}"`,
          `"${record.designationName}"`,
          record.presentCount,
        ].join(","),
      ),
    ].join("\n")

    return csvContent
  }

  // Download CSV file
  const downloadCSV = () => {
    const csvContent = generateCSV()
    if (!csvContent) {
      toast({
        title: "No Data",
        description: "No attendance data available to download.",
        variant: "destructive",
      })
      return
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      const monthDisplay = reportData?.month
        ? format(parse(reportData.month, "yyyy-MM", new Date()), "MMMM-yyyy")
        : "report"
      link.setAttribute("download", `attendance-report-${reportData?.company.name || "report"}-${monthDisplay}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    toast({
      title: "CSV Downloaded",
      description: "Attendance report has been downloaded as CSV file.",
    })
  }

  // Open PDF preview
  const openPDFPreview = () => {
    setPdfOpen(true)
  }

  const getSelectedCompanyName = () => {
    return reportData?.company.name || ""
  }

  const getSelectedMonthDisplay = () => {
    if (!reportData?.month) return ""
    try {
      const date = parse(reportData.month, "yyyy-MM", new Date())
      return format(date, "MMMM yyyy")
    } catch {
      return reportData.month
    }
  }

  // Helper function to add cache-busting query parameter to URL
  const addCacheBuster = (url: string): string => {
    if (!url) return url
    const separator = url.includes("?") ? "&" : "?"
    return `${url}${separator}_t=${Date.now()}`
  }

  // Handle viewing attendance sheet
  const handleViewSheet = async () => {
    if (!reportData?.attendanceSheet?.attendanceSheetUrl) return

    const cacheBustedUrl = addCacheBuster(reportData.attendanceSheet.attendanceSheetUrl)
    setSheetPreviewUrl(cacheBustedUrl)
    setSheetPreviewOpen(true)
    setSheetPreviewType("loading")

    try {
      const response = await fetch(cacheBustedUrl, {
        method: "HEAD",
        cache: "no-store",
      })
      const contentType = response.headers.get("Content-Type") || ""
      const urlLower = reportData.attendanceSheet.attendanceSheetUrl.toLowerCase()

      if (contentType.includes("pdf") || urlLower.includes(".pdf") || urlLower.endsWith(".pdf")) {
        setSheetPreviewType("pdf")
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
        setSheetPreviewType("image")
        return
      }

      if (!contentType || contentType === "application/octet-stream" || contentType.includes("binary")) {
        setSheetPreviewType("image")
      } else {
        setSheetPreviewType("image")
      }
    } catch (error) {
      console.log("HEAD request failed, using URL detection:", error)
      const urlLower = reportData.attendanceSheet.attendanceSheetUrl.toLowerCase()

      if (urlLower.includes(".pdf") || urlLower.endsWith(".pdf")) {
        setSheetPreviewType("pdf")
      } else if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)) {
        setSheetPreviewType("image")
      } else {
        setSheetPreviewType("image")
      }
    }
  }

  const handleDownloadSheet = async () => {
    if (!reportData?.attendanceSheet?.attendanceSheetUrl) return

    try {
      const url = addCacheBuster(reportData.attendanceSheet.attendanceSheetUrl)
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

      const monthDisplay = reportData.month
        ? format(parse(reportData.month, "yyyy-MM", new Date()), "MMMM-yyyy")
        : "sheet"
      const filename = `attendance-sheet-${reportData.company.name}-${monthDisplay}${extension}`
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Reports</h1>
          <p className="text-muted-foreground">Generate and download comprehensive attendance reports</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Generate Report
          </CardTitle>
          <CardDescription>Select a company and month to generate attendance report</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company *</FormLabel>
                      <Select onValueChange={handleCompanyChange} value={field.value} disabled={companiesLoading}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id ?? ""}>
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-gray-500" />
                                {company.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {companiesLoading && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading companies...
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!form.watch("companyId") || loadingMonths}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue
                              placeholder={
                                !form.watch("companyId")
                                  ? "Select company first"
                                  : loadingMonths
                                    ? "Loading months..."
                                    : "Select month"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableMonths.map((month) => (
                            <SelectItem key={month} value={month}>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                {format(parse(month, "yyyy-MM", new Date()), "MMMM yyyy")}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {loadingMonths && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading available months...
                        </div>
                      )}
                      {form.watch("companyId") && !loadingMonths && availableMonths.length === 0 && (
                        <p className="text-sm text-gray-500">No attendance data found for this company</p>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={loading || !form.watch("companyId") || !form.watch("month")}
                  size="lg"
                  className="min-w-48"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportGenerated && reportData && (
        <div className="space-y-6">
          {/* Report Header with Sheet Info */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Report Generated Successfully</h3>
                  <p className="text-green-700">
                    {reportData.company.name} - {getSelectedMonthDisplay()}
                  </p>
                  {reportData.company.address && (
                    <p className="text-sm text-green-600 mt-1">{reportData.company.address}</p>
                  )}
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                {reportData.attendanceSheet ? (
                  <>
                    <Badge variant="outline" className="bg-white">
                      📎 Sheet attached
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleViewSheet}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Sheet
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadSheet}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Sheet
                    </Button>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">No attendance sheet attached for this month.</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Employees</p>
                      <p className="text-2xl font-bold text-blue-600">{reportData.totals.totalEmployees}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Minimum Present</p>
                      <p className="text-2xl font-bold text-orange-600">{reportData.totals.minPresent}</p>
                    </div>
                    <Minus className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Maximum Present</p>
                      <p className="text-2xl font-bold text-indigo-600">{reportData.totals.maxPresent}</p>
                    </div>
                    <Maximize2 className="w-8 h-8 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Download Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Export Report</CardTitle>
              <CardDescription>Download the attendance report in your preferred format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={openPDFPreview} variant="outline" size="lg">
                  <FileText className="w-5 h-5 mr-2" />
                  Preview & Download PDF
                </Button>
                <Button onClick={downloadCSV} variant="outline" size="lg">
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Download CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Data Table */}
          {reportData.records.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>Detailed attendance data for {getSelectedMonthDisplay()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead className="text-right">Present Days</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.records.map((record, index) => (
                        <TableRow key={`${record.employeeID}-${index}`}>
                          <TableCell>
                            <Badge variant="outline">{record.employeeID}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{record.employeeName}</TableCell>
                          <TableCell>{record.departmentName}</TableCell>
                          <TableCell>{record.designationName}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary" className="font-semibold">
                              {record.presentCount}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {reportData.records.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No attendance records found for the selected company and month.</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* PDF Preview Dialog */}
      {reportData && (
        <DynamicPdfPreviewDialog
          open={pdfOpen}
          onOpenChange={setPdfOpen}
          title={`${reportData.company.name} - Attendance Report`}
          description={getSelectedMonthDisplay()}
          fileName={`attendance-report-${reportData.company.name}-${reportData.month}`}
          renderDocument={async () => {
            // Dynamically import the component to ensure it's loaded
            const { default: AttendanceReportPDF } = await import("@/components/pdf/attendance-report-pdf")
            const records = reportData.records.map((r) => ({
              employeeID: r.employeeID,
              employeeName: r.employeeName,
              companyName: reportData.company.name,
              designationName: r.designationName,
              departmentName: r.departmentName,
              presentCount: r.presentCount,
              attendanceSheetUrl: reportData.attendanceSheet?.attendanceSheetUrl || "",
            }))
            return (
              <AttendanceReportPDF
                title={`${reportData.company.name} Attendance`}
                month={getSelectedMonthDisplay()}
                records={records}
              />
            )
          }}
        />
      )}

      {/* Attendance Sheet Preview Dialog */}
      <Dialog open={sheetPreviewOpen} onOpenChange={setSheetPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span>
                Attendance Sheet - {getSelectedCompanyName()} - {getSelectedMonthDisplay()}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSheet}
                >
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>Attendance sheet document preview</DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
            <div className="border rounded-md overflow-hidden bg-white">
              {sheetPreviewType === "loading" ? (
                <div className="flex items-center justify-center h-[70vh]">
                  <div className="text-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading preview...</p>
                  </div>
                </div>
              ) : sheetPreviewType === "pdf" ? (
                <iframe
                  src={sheetPreviewUrl || ""}
                  className="w-full h-[70vh] border-0"
                  key={sheetPreviewUrl}
                />
              ) : sheetPreviewType === "image" ? (
                <div className="flex items-center justify-center min-h-[70vh] bg-gray-50 p-4">
                  <img
                    src={sheetPreviewUrl || ""}
                    alt="Attendance Sheet"
                    className="max-w-full max-h-[70vh] object-contain"
                    crossOrigin="anonymous"
                    key={sheetPreviewUrl}
                    onError={(e) => {
                      console.error("❌ Image load error:", e, "URL:", sheetPreviewUrl)
                      const urlLower = (sheetPreviewUrl || "").toLowerCase()

                      if (urlLower.includes(".pdf") || urlLower.endsWith(".pdf")) {
                        setSheetPreviewType("pdf")
                      } else if (!urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico|pdf)$/i)) {
                        setSheetPreviewType("pdf")
                      } else {
                        setSheetPreviewType("unsupported")
                      }
                    }}
                    onLoad={() => {
                      console.log("✅ Image loaded successfully:", sheetPreviewUrl)
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
                    <Button onClick={handleDownloadSheet}>
                      <Download className="h-4 w-4 mr-2" /> Download File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 border-t">
            <Button variant="outline" onClick={() => setSheetPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

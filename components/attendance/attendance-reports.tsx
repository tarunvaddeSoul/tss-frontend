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

import { PageHeader } from "@/components/layout/page-header"
import { useClient } from "@/hooks/use-client"
import { attendanceService } from "@/services/attendanceService"
import { getErrorMessage } from "@/services/api"
import type { Client } from "@/types/client"
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
  clientId: z.string().min(1, "Please select a client"),
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
  const [excelFile, setExcelFile] = useState<{ id: string; attendanceExcelUrl: string } | null>(null)
  const [loadingExcel, setLoadingExcel] = useState(false)

  const { toast } = useToast()
  const { data, isLoading: clientsLoading, fetchClients } = useClient()

  useEffect(() => {
    fetchClients()
  }, [])

  const form = useForm<ReportsFormValues>({
    resolver: zodResolver(reportsSchema),
    defaultValues: {
      clientId: "",
      month: "",
    },
  })

  const clients: Client[] = data?.clients || []

  // Fetch available months when client is selected
  const handleClientChange = async (clientId: string) => {
    form.setValue("clientId", clientId)
    form.setValue("month", "") // Reset month selection
    setReportGenerated(false)
    setReportData(null)

    if (!clientId) {
      setAvailableMonths([])
      return
    }

    try {
      setLoadingMonths(true)
      const response = await attendanceService.getAttendanceByClientId(clientId)
      // Extract unique months from the response
      const months = response.data?.map((record) => record.month) || []
      const uniqueMonths = [...new Set(months)].sort().reverse() // Sort in descending order (newest first)
      setAvailableMonths(uniqueMonths)
    } catch (error: any) {
      console.error("Error fetching available months:", error)
      toast({
        title: "Error",
        description: "Failed to fetch available months for this client.",
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
      const response = await attendanceService.getAttendanceReport(data.clientId, data.month)

      if (!response.data) {
        throw new Error("Failed to generate report")
      }

      setReportData(response.data)
      setReportGenerated(true)

      // Fetch Excel file for this client and month
      try {
        setLoadingExcel(true)
        const excelResponse = await attendanceService.getAttendanceExcelFiles({
          clientId: data.clientId,
          month: data.month,
        })
        if (
          excelResponse.data &&
          !Array.isArray(excelResponse.data) &&
          "attendanceExcelUrl" in excelResponse.data
        ) {
          setExcelFile({
            id: excelResponse.data.id,
            attendanceExcelUrl: excelResponse.data.attendanceExcelUrl,
          })
        } else {
          setExcelFile(null)
        }
      } catch (error) {
        console.error("Error fetching Excel file:", error)
        setExcelFile(null)
      } finally {
        setLoadingExcel(false)
      }

      toast({
        title: "Report Generated",
        description: `Found ${response.data.records.length} attendance records for ${response.data.client.name} - ${format(parse(response.data.month, "yyyy-MM", new Date()), "MMMM yyyy")}.`,
      })
    } catch (error: any) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      })
      setReportData(null)
      setReportGenerated(false)
      setExcelFile(null)
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
      link.setAttribute("download", `attendance-report-${reportData?.client.name || "report"}-${monthDisplay}.csv`)
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

  const getSelectedClientName = () => {
    return reportData?.client.name || ""
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
      const filename = `attendance-sheet-${reportData.client.name}-${monthDisplay}${extension}`
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

  // Handle downloading Excel file
  const handleDownloadExcel = async () => {
    if (!excelFile?.attendanceExcelUrl) return

    try {
      const url = addCacheBuster(excelFile.attendanceExcelUrl)
      const response = await fetch(url, { cache: "no-store" })
      if (!response.ok) throw new Error("Failed to download")

      const blob = await response.blob()
      const monthDisplay = reportData?.month
        ? format(parse(reportData.month, "yyyy-MM", new Date()), "MMMM-yyyy")
        : "excel"
      const filename = `attendance-excel-${reportData?.client.name || "file"}-${monthDisplay}.xlsx`
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
        description: "Excel file download started successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download the Excel file. Please try again.",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <PageHeader
        no="02"
        eyebrow="Attendance register"
        title="Attendance Reports"
        description="Generate and download comprehensive attendance reports."
      />

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Generate Report
          </CardTitle>
          <CardDescription>Select a client and month to generate attendance report</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client *</FormLabel>
                      <Select onValueChange={handleClientChange} value={field.value} disabled={clientsLoading}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id ?? ""}>
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                {client.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {clientsLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading clients...
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
                        disabled={!form.watch("clientId") || loadingMonths}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue
                              placeholder={
                                !form.watch("clientId")
                                  ? "Select client first"
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
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                {format(parse(month, "yyyy-MM", new Date()), "MMMM yyyy")}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {loadingMonths && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading available months...
                        </div>
                      )}
                      {form.watch("clientId") && !loadingMonths && availableMonths.length === 0 && (
                        <p className="text-sm text-muted-foreground">No attendance data found for this client</p>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={loading || !form.watch("clientId") || !form.watch("month")}
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
          <Card className="border-success/30 bg-success/[0.04]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-success">Report Generated Successfully</h3>
                  <p className="text-foreground">
                    {reportData.client.name} - {getSelectedMonthDisplay()}
                  </p>
                  {reportData.client.address && (
                    <p className="text-sm text-muted-foreground mt-1">{reportData.client.address}</p>
                  )}
                </div>
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <div className="mt-4 space-y-3">
                {/* Attendance Sheet Section */}
                <div className="flex items-center gap-2">
                  {reportData.attendanceSheet ? (
                    <>
                      <Badge variant="outline" className="bg-card">
                        <FileText className="h-3 w-3 mr-1" />
                        Sheet attached
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
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      No attendance sheet attached for this month.
                    </span>
                  )}
                </div>

                {/* Attendance Excel Section */}
                <div className="flex items-center gap-2">
                  {loadingExcel ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking for Excel file...
                    </div>
                  ) : excelFile ? (
                    <>
                      <Badge variant="outline" className="bg-card">
                        <FileSpreadsheet className="h-3 w-3 mr-1" />
                        Excel attached
                      </Badge>
                      <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Excel
                      </Button>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      No Excel file attached for this month.
                    </span>
                  )}
                </div>
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
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Total Employees</p>
                      <p className="font-display text-2xl font-bold tabular-nums text-brand">{reportData.totals.totalEmployees}</p>
                    </div>
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Minimum Present</p>
                      <p className="font-display text-2xl font-bold tabular-nums">{reportData.totals.minPresent}</p>
                    </div>
                    <Minus className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Maximum Present</p>
                      <p className="font-display text-2xl font-bold tabular-nums">{reportData.totals.maxPresent}</p>
                    </div>
                    <Maximize2 className="w-8 h-8 text-muted-foreground" />
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
                <div className="rounded-md border overflow-x-auto scrollbar-sleek">
                  <Table className="min-w-[800px]">
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
              <AlertDescription>No attendance records found for the selected client and month.</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* PDF Preview Dialog */}
      {reportData && (
        <DynamicPdfPreviewDialog
          open={pdfOpen}
          onOpenChange={setPdfOpen}
          title={`${reportData.client.name} - Attendance Report`}
          description={getSelectedMonthDisplay()}
          fileName={`attendance-report-${reportData.client.name}-${reportData.month}`}
          renderDocument={async () => {
            // Dynamically import the component to ensure it's loaded
            const { default: AttendanceReportPDF } = await import("@/components/pdf/attendance-report-pdf")
            const records = reportData.records.map((r) => ({
              employeeID: r.employeeID,
              employeeName: r.employeeName,
              clientName: reportData.client.name,
              designationName: r.designationName,
              departmentName: r.departmentName,
              presentCount: r.presentCount,
              attendanceSheetUrl: reportData.attendanceSheet?.attendanceSheetUrl || "",
            }))
            return (
              <AttendanceReportPDF
                title={`${reportData.client.name} Attendance`}
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
                Attendance Sheet - {getSelectedClientName()} - {getSelectedMonthDisplay()}
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
            <div className="border rounded-md overflow-hidden bg-card">
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
                <div className="flex items-center justify-center min-h-[70vh] bg-surface p-4">
                  <img
                    src={sheetPreviewUrl || ""}
                    alt="Attendance Sheet"
                    className="max-w-full max-h-[70vh] object-contain"
                    crossOrigin="anonymous"
                    key={sheetPreviewUrl}
                    onError={(e) => {
                      console.error("Image load error, trying PDF:", e, "URL:", sheetPreviewUrl)
                      // If image fails, try as PDF (common case for attendance sheets)
                      const urlLower = (sheetPreviewUrl || "").toLowerCase()
                      if (urlLower.includes(".pdf") || urlLower.endsWith(".pdf") || !urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)) {
                        setSheetPreviewType("pdf")
                      }
                    }}
                    onLoad={() => {
                      console.log("✅ Image loaded successfully:", sheetPreviewUrl)
                    }}
                  />
                </div>
              ) : (
                // Fallback: Try to show as PDF if image failed
                <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center space-y-4">
                  <iframe 
                    src={sheetPreviewUrl || ""} 
                    className="w-full h-full border-0"
                    style={{ minHeight: "500px" }}
                  />
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

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import {
  Upload,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2,
  UploadCloud,
  Users,
  Eye,
  Trash2,
  Download,
  X,
  FileSpreadsheet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { MonthPicker } from "@/components/ui/month-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

import { useCompany } from "@/hooks/use-company"
import { attendanceSheetService } from "@/services/attendanceSheetService"
import { attendanceService } from "@/services/attendanceService"
import type { Company } from "@/types/company"

// Form validation schema
const uploadAttendanceSchema = z.object({
  companyId: z.string().min(1, "Please select a company"),
  month: z.date({
    required_error: "Please select a month",
  }),
})

type UploadAttendanceFormValues = z.infer<typeof uploadAttendanceSchema>

export function UploadAttendanceComponent() {
  // Sheet upload state
  const [selectedSheetFile, setSelectedSheetFile] = useState<File | null>(null)
  const [sheetDragActive, setSheetDragActive] = useState(false)
  const [sheetUploadLoading, setSheetUploadLoading] = useState(false)
  const [existingSheetUrl, setExistingSheetUrl] = useState<string | null>(null)
  const [existingSheetId, setExistingSheetId] = useState<string | null>(null)
  const [checkingSheet, setCheckingSheet] = useState(false)
  const [previewIsPDF, setPreviewIsPDF] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<"pdf" | "image" | "unsupported" | "loading">("loading")

  // Excel upload state
  const [selectedExcelFile, setSelectedExcelFile] = useState<File | null>(null)
  const [excelDragActive, setExcelDragActive] = useState(false)
  const [excelUploadLoading, setExcelUploadLoading] = useState(false)
  const [existingExcelUrl, setExistingExcelUrl] = useState<string | null>(null)
  const [existingExcelId, setExistingExcelId] = useState<string | null>(null)
  const [checkingExcel, setCheckingExcel] = useState(false)

  const { toast } = useToast()
  const { data, isLoading: companiesLoading, fetchCompanies } = useCompany()

  useEffect(() => {
    fetchCompanies()
  }, [])

  const form = useForm<UploadAttendanceFormValues>({
    resolver: zodResolver(uploadAttendanceSchema),
    defaultValues: {
      companyId: "",
      month: undefined,
    },
  })

  const companies: Company[] = data?.companies || []
  const selectedCompany = companies.find((c) => c.id === form.watch("companyId"))
  const selectedMonth = form.watch("month")

  // Helper function to add cache-busting query parameter to URL
  const addCacheBuster = (url: string): string => {
    if (!url) return url
    const separator = url.includes("?") ? "&" : "?"
    return `${url}${separator}_t=${Date.now()}`
  }

  // Function to load existing sheet
  const loadExistingSheet = async (companyId: string, monthDate: Date) => {
    setExistingSheetUrl(null)
    setExistingSheetId(null)
    if (!companyId || !monthDate) return
    try {
      setCheckingSheet(true)
      const res = await attendanceSheetService.get(companyId, format(monthDate, "yyyy-MM"))
      if (res.data?.attendanceSheetUrl) {
        setExistingSheetUrl(res.data.attendanceSheetUrl)
        setExistingSheetId(res.data.id)
        const lower = res.data.attendanceSheetUrl.toLowerCase()
        setPreviewIsPDF(lower.endsWith(".pdf"))
      } else {
        setExistingSheetUrl(null)
        setExistingSheetId(null)
      }
    } catch (e: any) {
      setExistingSheetUrl(null)
      setExistingSheetId(null)
    } finally {
      setCheckingSheet(false)
    }
  }

  // Function to load existing Excel file
  const loadExistingExcel = async (companyId: string, monthDate: Date) => {
    setExistingExcelUrl(null)
    setExistingExcelId(null)
    if (!companyId || !monthDate) return
    try {
      setCheckingExcel(true)
      const res = await attendanceService.getAttendanceExcelFiles({
        companyId,
        month: format(monthDate, "yyyy-MM"),
      })
      if (res.data && typeof res.data === "object" && "attendanceExcelUrl" in res.data) {
        setExistingExcelUrl(res.data.attendanceExcelUrl)
        setExistingExcelId(res.data.id)
      } else {
        setExistingExcelUrl(null)
        setExistingExcelId(null)
      }
    } catch (e: any) {
      setExistingExcelUrl(null)
      setExistingExcelId(null)
    } finally {
      setCheckingExcel(false)
    }
  }

  // Watch company/month to fetch current sheet and Excel
  useEffect(() => {
    const companyId = form.getValues("companyId")
    const monthDate = form.getValues("month")
    if (companyId && monthDate) {
      loadExistingSheet(companyId, monthDate)
      loadExistingExcel(companyId, monthDate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("companyId"), form.watch("month")])

  // Sheet file handlers
  const handleSheetFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type for sheets (PDF, images)
      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
      const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp"]
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a PDF or image file (JPG, PNG, GIF, WEBP) for attendance sheets.",
        })
        return
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "File size must be less than 10MB.",
        })
        return
      }
      
      setSelectedSheetFile(file)
    }
  }

  const handleSheetDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setSheetDragActive(true)
    } else if (e.type === "dragleave") {
      setSheetDragActive(false)
    }
  }

  const handleSheetDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSheetDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleSheetFileChange({ target: { files: [file] } } as any)
    }
  }

  // Excel file handlers
  const handleExcelFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type for Excel (XLSX, XLS)
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ]
      const allowedExtensions = [".xlsx", ".xls"]
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload an Excel file (XLSX or XLS) for attendance Excel files.",
        })
        return
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "File size must be less than 10MB.",
        })
        return
      }
      
      setSelectedExcelFile(file)
    }
  }

  const handleExcelDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setExcelDragActive(true)
    } else if (e.type === "dragleave") {
      setExcelDragActive(false)
    }
  }

  const handleExcelDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExcelDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleExcelFileChange({ target: { files: [file] } } as any)
    }
  }

  // Upload sheet
  const handleUploadSheet = async () => {
    if (!selectedSheetFile || !selectedCompany || !selectedMonth) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select a file to upload.",
      })
      return
    }

    try {
      setSheetUploadLoading(true)
      const formattedMonth = format(selectedMonth, "yyyy-MM")

      await attendanceSheetService.upload(selectedCompany.id!, formattedMonth, selectedSheetFile)

      // Clear selected file and reset input
      setSelectedSheetFile(null)
      const fileInput = document.querySelector('input[type="file"][accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"]') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }

      await loadExistingSheet(selectedCompany.id!, selectedMonth)

      toast({
        title: "Upload Successful",
        description: `Attendance sheet uploaded for ${selectedCompany.name} - ${format(selectedMonth, "MMMM yyyy")}.`,
      })
    } catch (error: any) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload attendance sheet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSheetUploadLoading(false)
    }
  }

  // Upload Excel
  const handleUploadExcel = async () => {
    if (!selectedExcelFile || !selectedCompany || !selectedMonth) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select a file to upload.",
      })
      return
    }

    try {
      setExcelUploadLoading(true)
      const formattedMonth = format(selectedMonth, "yyyy-MM")

      await attendanceService.uploadAttendanceExcel(
        {
          companyId: selectedCompany.id!,
          month: formattedMonth,
        },
        selectedExcelFile,
      )

      // Clear selected file and reset input
      setSelectedExcelFile(null)
      const fileInput = document.querySelector('input[type="file"][accept=".xlsx,.xls"]') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }

      await loadExistingExcel(selectedCompany.id!, selectedMonth)

      toast({
        title: "Upload Successful",
        description: `Attendance Excel file uploaded for ${selectedCompany.name} - ${format(selectedMonth, "MMMM yyyy")}.`,
      })
    } catch (error: any) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload attendance Excel file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setExcelUploadLoading(false)
    }
  }

  // Delete sheet
  const handleDeleteSheet = async () => {
    if (!existingSheetId || !selectedCompany || !selectedMonth) return

    try {
      setCheckingSheet(true)
      await attendanceSheetService.delete(existingSheetId)
      await loadExistingSheet(selectedCompany.id!, selectedMonth)
      toast({ title: "Deleted", description: "Attendance sheet deleted." })
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message || "Unable to delete", variant: "destructive" })
    } finally {
      setCheckingSheet(false)
    }
  }

  // Delete Excel
  const handleDeleteExcel = async () => {
    if (!existingExcelId || !selectedCompany || !selectedMonth) return

    try {
      setCheckingExcel(true)
      await attendanceService.deleteAttendanceExcel(existingExcelId)
      await loadExistingExcel(selectedCompany.id!, selectedMonth)
      toast({ title: "Deleted", description: "Attendance Excel file deleted." })
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message || "Unable to delete", variant: "destructive" })
    } finally {
      setCheckingExcel(false)
    }
  }

  // Preview sheet
  const handlePreviewSheet = async () => {
    if (!existingSheetUrl) return
    const cacheBustedUrl = addCacheBuster(existingSheetUrl)
    setPreviewUrl(cacheBustedUrl)
    setPreviewOpen(true)
    setPreviewType("loading")

    try {
      const response = await fetch(cacheBustedUrl, { method: "HEAD", cache: "no-store" })
      const contentType = response.headers.get("Content-Type") || ""
      const urlLower = existingSheetUrl.toLowerCase()

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

      if (urlLower.includes(".pdf") || urlLower.endsWith(".pdf")) {
        setPreviewType("pdf")
      } else {
        setPreviewType("image")
      }
    } catch (error) {
      const urlLower = existingSheetUrl.toLowerCase()
      if (urlLower.includes(".pdf") || urlLower.endsWith(".pdf")) {
        setPreviewType("pdf")
      } else if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)) {
        setPreviewType("image")
      } else {
        setPreviewType("pdf")
      }
    }
  }

  const getFileIcon = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return "📄"
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "🖼️"
      case "xlsx":
      case "xls":
        return "📊"
      default:
        return "📁"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Upload Attendance Files</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Upload attendance sheets (PDF/images) and Excel files (XLSX/XLS) for a company and month
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          {/* Company and Month Selection */}
            <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Company & Month
                </CardTitle>
              <CardDescription>Choose the company and month for attendance upload</CardDescription>
              </CardHeader>
              <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Company *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={companiesLoading}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id ?? ""}>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                {company.name}
                              </div>
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
                        <Calendar className="h-4 w-4" />
                        Month *
                      </FormLabel>
                      <FormControl>
                        <MonthPicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select month"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              </CardContent>
            </Card>

          {/* Attendance Sheet Section */}
          {selectedCompany && selectedMonth && (
          <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
              <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Attendance Sheet (PDF/Images)
              </CardTitle>
              <CardDescription>
                      Upload finalized attendance sheets as PDF or image files
              </CardDescription>
                  </div>
                  {existingSheetUrl && (
                    <Badge variant="secondary" className="text-sm">
                      Sheet Available
                    </Badge>
                  )}
                </div>
            </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Sheet */}
                {checkingSheet ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : existingSheetUrl ? (
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded-md">
                        {previewIsPDF ? (
                          <FileText className="h-5 w-5 text-red-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Attendance Sheet</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedCompany.name} • {format(selectedMonth, "MMMM yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={handlePreviewSheet}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={handleDeleteSheet} disabled={checkingSheet}>
                        {checkingSheet ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No attendance sheet found for this month</p>
                  </div>
                )}

                <Separator />

                {/* Sheet Upload */}
                <div
                  className={cn(
                    "relative border-2 border-dashed rounded-lg transition-all duration-200",
                    sheetDragActive
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-muted-foreground/25 hover:border-primary/50",
                    selectedSheetFile && "border-primary bg-primary/5",
                  )}
                >
                  {!selectedSheetFile && (
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={handleSheetFileChange}
                      disabled={sheetUploadLoading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  )}

                  {selectedSheetFile ? (
                    <div className="p-8">
                      <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{getFileIcon(selectedSheetFile)}</div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{selectedSheetFile.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {formatFileSize(selectedSheetFile.size)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {selectedSheetFile.type || "Unknown type"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setSelectedSheetFile(null)
                            // Reset file input
                            const fileInput = document.querySelector('input[type="file"][accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"]') as HTMLInputElement
                            if (fileInput) {
                              fileInput.value = ""
                            }
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleUploadSheet()
                          }}
                          disabled={sheetUploadLoading}
                          className="min-w-[160px] relative z-20"
                        >
                          {sheetUploadLoading ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-5 w-5 mr-2" />
                              {existingSheetUrl ? "Replace Sheet" : "Upload Sheet"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="p-12 text-center cursor-pointer"
                      onDragEnter={handleSheetDrag}
                      onDragLeave={handleSheetDrag}
                      onDragOver={handleSheetDrag}
                      onDrop={handleSheetDrop}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-muted rounded-full">
                          <UploadCloud className="h-8 w-8 text-muted-foreground" />
                        </div>
                            <div>
                          <p className="font-medium mb-1">
                            {sheetDragActive ? "Drop your file here" : "Drag & drop your file"}
                          </p>
                          <p className="text-sm text-muted-foreground">or click to browse</p>
                            </div>
                        <div className="flex flex-wrap justify-center gap-2 text-xs">
                              <Badge variant="outline">PDF</Badge>
                          <Badge variant="outline">JPG</Badge>
                          <Badge variant="outline">PNG</Badge>
                          <Badge variant="outline">Max 10MB</Badge>
                        </div>
                            </div>
                          </div>
                        )}
                      </div>

                <Alert>
                <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                  <strong>File Requirements:</strong>
                    <ul className="mt-1.5 ml-4 list-disc space-y-0.5">
                      <li>Accepted formats: PDF, JPG, JPEG, PNG, GIF, WEBP</li>
                    <li>Maximum file size: 10MB</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          )}

          {/* Attendance Excel Section */}
          {selectedCompany && selectedMonth && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5" />
                      Attendance Excel File (XLSX/XLS)
                    </CardTitle>
                    <CardDescription>
                      Upload pre-finalized attendance Excel files for processing
                    </CardDescription>
                  </div>
                  {existingExcelUrl && (
                    <Badge variant="secondary" className="text-sm">
                      Excel Available
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Excel */}
                {checkingExcel ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : existingExcelUrl ? (
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded-md">
                        <FileSpreadsheet className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Attendance Excel File</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedCompany.name} • {format(selectedMonth, "MMMM yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (!existingExcelUrl) return
                          try {
                            const response = await fetch(existingExcelUrl)
                            if (!response.ok) throw new Error("Failed to download")
                            const blob = await response.blob()
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement("a")
                            a.href = url
                            a.download = `attendance-excel-${selectedCompany.name}-${format(selectedMonth, "yyyy-MM")}.xlsx`
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                            URL.revokeObjectURL(url)
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
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={handleDeleteExcel} disabled={checkingExcel}>
                        {checkingExcel ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileSpreadsheet className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No Excel file found for this month</p>
                  </div>
                )}

                <Separator />

                {/* Excel Upload */}
                <div
                  className={cn(
                    "relative border-2 border-dashed rounded-lg transition-all duration-200",
                    excelDragActive
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-muted-foreground/25 hover:border-primary/50",
                    selectedExcelFile && "border-primary bg-primary/5",
                  )}
                >
                  {!selectedExcelFile && (
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelFileChange}
                      disabled={excelUploadLoading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  )}

                  {selectedExcelFile ? (
                    <div className="p-8">
                      <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{getFileIcon(selectedExcelFile)}</div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{selectedExcelFile.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {formatFileSize(selectedExcelFile.size)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {selectedExcelFile.type || "Unknown type"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setSelectedExcelFile(null)
                            // Reset file input
                            const fileInput = document.querySelector('input[type="file"][accept=".xlsx,.xls"]') as HTMLInputElement
                            if (fileInput) {
                              fileInput.value = ""
                            }
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleUploadExcel()
                          }}
                          disabled={excelUploadLoading}
                          className="min-w-[160px] relative z-20"
                        >
                          {excelUploadLoading ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-5 w-5 mr-2" />
                              {existingExcelUrl ? "Replace Excel" : "Upload Excel"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="p-12 text-center cursor-pointer"
                      onDragEnter={handleExcelDrag}
                      onDragLeave={handleExcelDrag}
                      onDragOver={handleExcelDrag}
                      onDrop={handleExcelDrop}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-muted rounded-full">
                          <UploadCloud className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium mb-1">
                            {excelDragActive ? "Drop your file here" : "Drag & drop your file"}
                          </p>
                          <p className="text-sm text-muted-foreground">or click to browse</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 text-xs">
                          <Badge variant="outline">XLSX</Badge>
                          <Badge variant="outline">XLS</Badge>
                          <Badge variant="outline">Max 10MB</Badge>
                        </div>
                      </div>
                  </div>
                  )}
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>File Requirements:</strong>
                    <ul className="mt-1.5 ml-4 list-disc space-y-0.5">
                      <li>Accepted formats: XLSX, XLS</li>
                      <li>Maximum file size: 10MB</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>

      {/* Document Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span>
                Attendance Sheet - {selectedCompany?.name || "Sheet"} -{" "}
                {selectedMonth ? format(selectedMonth, "MMMM yyyy") : ""}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!previewUrl) return
                    try {
                      const response = await fetch(previewUrl, { cache: "no-store" })
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
                        const urlLower = previewUrl.toLowerCase()
                        const match = urlLower.match(/\.([a-z0-9]+)(?:\?|$)/)
                        if (match) extension = `.${match[1]}`
                        else extension = ".jpg"
                      }
                      const filename = `attendance-sheet-${selectedCompany?.name || "sheet"}-${
                        selectedMonth ? format(selectedMonth, "yyyy-MM") : ""
                      }${extension}`
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = filename
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      URL.revokeObjectURL(url)
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
                  }}
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
                  onError={() => {
                    setPreviewType("image")
                  }}
                />
              ) : previewType === "image" ? (
                <div className="flex items-center justify-center min-h-[70vh] bg-gray-50 p-4">
                  <img
                    src={previewUrl || ""}
                    alt="Attendance Sheet"
                    className="max-w-full max-h-[70vh] object-contain"
                    crossOrigin="anonymous"
                    key={previewUrl}
                    onError={() => {
                      const urlLower = (previewUrl || "").toLowerCase()
                      if (urlLower.includes(".pdf") || urlLower.endsWith(".pdf") || !urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)) {
                        setPreviewType("pdf")
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center space-y-4">
                  <iframe src={previewUrl || ""} className="w-full h-full border-0" style={{ minHeight: "500px" }} />
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 border-t">
            <Button type="button" variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

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
  FileCheck,
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
import type { Company } from "@/types/company"

// Form validation schema
const uploadAttendanceSchema = z.object({
  companyId: z.string().min(1, "Please select a company"),
  month: z.date({
    required_error: "Please select a month",
  }),
  file: z
    .instanceof(File, {
      message: "Please select a file to upload",
    })
    .refine((file) => file.size <= 10 * 1024 * 1024, "File size must be less than 10MB"),
})

type UploadAttendanceFormValues = z.infer<typeof uploadAttendanceSchema>

export function UploadAttendanceComponent() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)

  const { toast } = useToast()
  const { data, isLoading: companiesLoading, fetchCompanies } = useCompany()

  const [existingSheetUrl, setExistingSheetUrl] = useState<string | null>(null)
  const [existingSheetId, setExistingSheetId] = useState<string | null>(null)
  const [checkingSheet, setCheckingSheet] = useState(false)
  const [previewIsPDF, setPreviewIsPDF] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<"pdf" | "image" | "unsupported" | "loading">("loading")

  useEffect(() => {
    fetchCompanies()
  }, [])

  const form = useForm<UploadAttendanceFormValues>({
    resolver: zodResolver(uploadAttendanceSchema),
    defaultValues: {
      companyId: "",
      month: undefined,
      file: undefined,
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
        // Store the base URL without cache buster (we'll add it when needed)
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

  // Watch company/month to fetch current sheet
  useEffect(() => {
    const companyId = form.getValues("companyId")
    const monthDate = form.getValues("month")
    if (companyId && monthDate) {
      loadExistingSheet(companyId, monthDate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("companyId"), form.watch("month")])

  // Watch form values to check if form is valid
  const watchedValues = form.watch()
  const isFormValid = watchedValues.companyId && watchedValues.month && selectedFile

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      form.setValue("file", file)
      form.clearErrors("file")
      form.trigger("file")
    }
  }

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      form.setValue("file", file)
      form.clearErrors("file")
      form.trigger("file")
    }
  }

  // Handle form submission
  const onSubmit = async (data: UploadAttendanceFormValues) => {
    if (isSubmitted) {
      toast({
        title: "Already Submitted",
        description: "Attendance has already been uploaded.",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadLoading(true)
      const formattedMonth = format(data.month, "yyyy-MM")

      const result = await attendanceSheetService.upload(data.companyId, formattedMonth, data.file)

      setSubmissionResult(result)
      setIsSubmitted(true)
      setSelectedFile(null) // Clear selected file after successful upload
      form.setValue("file", null as any)

      // Refetch the existing sheet to get the latest data (with updated URL/timestamp)
      // This ensures we always show the most recent file, especially after replace
      await loadExistingSheet(data.companyId, data.month)

      // If preview dialog is open, refresh the preview with new cache buster
      if (previewOpen) {
        // Small delay to ensure state is updated
        setTimeout(async () => {
          try {
            // Refetch to get the latest URL (fresh from server)
            const res = await attendanceSheetService.get(data.companyId, format(data.month, "yyyy-MM"))
            const sheetUrl = res.data?.attendanceSheetUrl
            if (sheetUrl) {
              const newCacheBustedUrl = addCacheBuster(sheetUrl)
              setPreviewUrl(newCacheBustedUrl)
              // Force re-render by updating preview type briefly
              setPreviewType("loading")
              setTimeout(() => {
                // Determine type based on URL
                const lower = sheetUrl.toLowerCase()
                if (lower.endsWith(".pdf")) {
                  setPreviewType("pdf")
                } else {
                  setPreviewType("image")
                }
              }, 100)
            }
          } catch (error) {
            console.error("Failed to refresh preview:", error)
          }
        }, 300)
      }

      toast({
        title: "Upload Successful",
        description: `Attendance sheet uploaded for ${selectedCompany?.name || "company"} - ${format(data.month, "MMMM yyyy")}.`,
      })
    } catch (error: any) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload attendance file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadLoading(false)
    }
  }

  // Reset form for new session
  const startNewSession = () => {
    form.reset()
    setIsSubmitted(false)
    setSubmissionResult(null)
    setSelectedFile(null)
    setExistingSheetUrl(null)
    setExistingSheetId(null)
    toast({
      title: "New Session Started",
      description: "You can now upload a new attendance file.",
    })
  }

  // Delete existing sheet
  const handleDelete = async () => {
    if (!existingSheetId) return
    const companyId = form.getValues("companyId")
    const monthDate = form.getValues("month")
    
    try {
      setCheckingSheet(true)
      await attendanceSheetService.delete(existingSheetId)
      
      // Refetch to ensure UI is updated (should show no sheet now)
      if (companyId && monthDate) {
        await loadExistingSheet(companyId, monthDate)
      } else {
        setExistingSheetUrl(null)
        setExistingSheetId(null)
      }
      
      toast({ title: "Deleted", description: "Attendance sheet deleted." })
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message || "Unable to delete", variant: "destructive" })
    } finally {
      setCheckingSheet(false)
    }
  }

  // Handle replace - clear selected file and allow new selection
  const handleReplace = () => {
    setSelectedFile(null)
    form.setValue("file", null as any) // Fix: set to null to satisfy types
    form.clearErrors("file")
    // Clear the file input by resetting it
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
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
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Upload Attendance Sheet</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Upload attendance proof documents for a company and month
        </p>
      </div>

      {/* Success Alert */}
      {isSubmitted && submissionResult && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <div className="flex items-center justify-between">
              <div>
                <strong>Upload Successful!</strong>
                <p className="text-sm mt-1">
                  Attendance sheet uploaded for {selectedCompany?.name} - {selectedMonth ? format(selectedMonth, "MMMM yyyy") : ""}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={startNewSession}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Upload Another
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitted || companiesLoading}
                      >
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
                          disabled={isSubmitted}
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

          {/* Existing Sheet Info */}
          {selectedCompany && selectedMonth && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Existing Attendance Sheet
                    </CardTitle>
                    <CardDescription>
                      {checkingSheet
                        ? "Checking for existing sheet..."
                        : existingSheetUrl
                          ? "A sheet already exists for this month"
                          : "No sheet uploaded for this month"}
                    </CardDescription>
                  </div>
                  {existingSheetUrl && (
                    <Badge variant="secondary" className="text-sm">
                      Sheet Available
                    </Badge>
                  )}
                </div>
              </CardHeader>
              {checkingSheet ? (
                <CardContent>
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </CardContent>
              ) : existingSheetUrl ? (
                <CardContent className="space-y-4">
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (!existingSheetUrl) return
                          // Add cache buster to force fresh load
                          const cacheBustedUrl = addCacheBuster(existingSheetUrl)
                          setPreviewUrl(cacheBustedUrl)
                          setPreviewOpen(true)
                          setPreviewType("loading")

                          try {
                            // Use cache: 'no-store' to bypass browser cache
                            const response = await fetch(cacheBustedUrl, {
                              method: "HEAD",
                              cache: "no-store",
                            })
                            const contentType = response.headers.get("Content-Type") || ""
                            const urlLower = existingSheetUrl.toLowerCase()
                            
                            console.log("🔍 File type detection:", { contentType, url: existingSheetUrl })

                            // Check for PDF first
                            if (contentType.includes("pdf") || urlLower.includes(".pdf") || urlLower.endsWith(".pdf")) {
                              console.log("✅ Detected as PDF")
                              setPreviewType("pdf")
                              return
                            }

                            // Check for images
                            if (
                              contentType.includes("image") ||
                              contentType.includes("jpeg") ||
                              contentType.includes("jpg") ||
                              contentType.includes("png") ||
                              contentType.includes("gif") ||
                              contentType.includes("webp") ||
                              urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)
                            ) {
                              console.log("✅ Detected as Image")
                              setPreviewType("image")
                              return
                            }

                            // If Content-Type is generic, default to image first (most common for attendance sheets)
                            // The img tag's onError will fallback to PDF if image fails
                            if (!contentType || contentType === "application/octet-stream" || contentType.includes("binary")) {
                              console.log("⚠️ Generic content type, defaulting to image first")
                              setPreviewType("image")
                            } else {
                              // Even for unknown types, try image first before giving up
                              console.log("⚠️ Unknown content type:", contentType, "- trying image first")
                              setPreviewType("image")
                            }
                          } catch (error) {
                            // Fallback: try to detect from URL, default to image if unknown
                            console.log("⚠️ HEAD request failed, using URL detection:", error)
                            const urlLower = existingSheetUrl.toLowerCase()

                            if (urlLower.includes(".pdf") || urlLower.endsWith(".pdf")) {
                              console.log("✅ URL suggests PDF")
                              setPreviewType("pdf")
                            } else if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)) {
                              console.log("✅ URL suggests Image")
                              setPreviewType("image")
                            } else {
                              // No extension - default to image (most attendance sheets are images)
                              // If image fails, it will try PDF in onError handler
                              console.log("⚠️ No extension detected, defaulting to image")
                              setPreviewType("image")
                            }
                          }
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDelete} disabled={checkingSheet}>
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
                </CardContent>
              ) : (
                <CardContent>
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No attendance sheet found for this month</p>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* File Upload Section */}
          {selectedCompany && selectedMonth && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UploadCloud className="h-5 w-5" />
                  Upload File
                </CardTitle>
                <CardDescription>
                  {existingSheetUrl
                    ? "Select a new file to replace the existing sheet"
                    : "Drag and drop your file or click to browse. All file types are supported."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormControl>
                        <div
                          className={cn(
                            "relative border-2 border-dashed rounded-lg transition-all duration-200",
                            dragActive
                              ? "border-primary bg-primary/5 scale-[1.02]"
                              : "border-muted-foreground/25 hover:border-primary/50",
                            selectedFile && "border-primary bg-primary/5",
                          )}
                        >
                          <Input
                            type="file"
                            onChange={handleFileChange}
                            disabled={isSubmitted || uploadLoading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            {...field}
                            value=""
                          />

                          {selectedFile ? (
                            <div className="p-8">
                              <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                                <div className="flex items-center gap-4">
                                  <div className="text-4xl">{getFileIcon(selectedFile)}</div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{selectedFile.name}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <Badge variant="secondary" className="text-xs">
                                        {formatFileSize(selectedFile.size)}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {selectedFile.type || "Unknown type"}
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
                                    handleReplace()
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-center text-muted-foreground mt-4">
                                ✓ File ready for upload
                              </p>
                            </div>
                          ) : (
                            <div
                              className="p-12 text-center cursor-pointer"
                              onDragEnter={handleDrag}
                              onDragLeave={handleDrag}
                              onDragOver={handleDrag}
                              onDrop={handleDrop}
                            >
                              <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-muted rounded-full">
                                  <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium mb-1">
                                    {dragActive ? "Drop your file here" : "Drag & drop your file"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">or click to browse</p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 text-xs">
                                  <Badge variant="outline">PDF</Badge>
                                  <Badge variant="outline">Images</Badge>
                                  <Badge variant="outline">All Formats</Badge>
                                  <Badge variant="outline">Max 10MB</Badge>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Requirements */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>File Requirements:</strong>
                    <ul className="mt-1.5 ml-4 list-disc space-y-0.5">
                      <li>Maximum file size: 10MB</li>
                      <li>All file formats are supported</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          {selectedCompany && selectedMonth && (
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  setSelectedFile(null)
                  setExistingSheetUrl(null)
                  setExistingSheetId(null)
                }}
                disabled={uploadLoading || isSubmitted}
              >
                Reset
              </Button>
              <Button type="submit" disabled={uploadLoading || isSubmitted || !isFormValid} size="lg" className="min-w-[160px]">
                {uploadLoading ? (
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
          )}

          {/* Upload Progress */}
          {uploadLoading && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Uploading file...</span>
                    <span className="text-muted-foreground">Processing</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Please wait while we upload your attendance sheet
                  </p>
                </div>
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
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!previewUrl) return
                    try {
                      // Use cache: 'no-store' to ensure we get the latest file
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
                  key={previewUrl} // Force re-render when URL changes
                  onError={(e) => {
                    console.error("PDF iframe load error:", e)
                    // If PDF fails, try image as last resort
                    setPreviewType("image")
                  }}
                  onLoad={() => {
                    console.log("PDF loaded successfully")
                  }}
                />
              ) : previewType === "image" ? (
                <div className="flex items-center justify-center min-h-[70vh] bg-gray-50 p-4">
                  <img
                    src={previewUrl || ""}
                    alt="Attendance Sheet"
                    className="max-w-full max-h-[70vh] object-contain"
                    crossOrigin="anonymous"
                    key={previewUrl} // Force re-render when URL changes
                    onError={(e) => {
                      console.error("❌ Image load error:", e, "URL:", previewUrl)
                      const urlLower = (previewUrl || "").toLowerCase()
                      
                      // If image fails, try PDF as fallback (unless it clearly has image extension)
                      // Only show unsupported if both image and PDF fail
                      if (urlLower.includes(".pdf") || urlLower.endsWith(".pdf")) {
                        console.log("🔄 Image failed but URL suggests PDF, switching to PDF")
                        setPreviewType("pdf")
                      } else if (!urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico|pdf)$/i)) {
                        // No extension - try PDF before giving up
                        console.log("🔄 Image failed with no extension, trying PDF as fallback")
                        setPreviewType("pdf")
                        // Set a timeout to check if PDF also fails
                        setTimeout(() => {
                          // If we're still having issues, the PDF iframe's onError will handle it
                          // But we'll only show unsupported if PDF also fails
                        }, 2000)
                      } else if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)) {
                        // Has image extension but failed - might be corrupted or wrong type
                        // Try PDF anyway
                        console.log("🔄 Image with extension failed, trying PDF")
                        setPreviewType("pdf")
                      } else {
                        // Last resort - show unsupported only after all attempts
                        console.log("❌ All preview attempts failed, showing unsupported")
                        setPreviewType("unsupported")
                      }
                    }}
                    onLoad={() => {
                      console.log("Image loaded successfully:", previewUrl)
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
                      onClick={async () => {
                        if (!previewUrl) return
                        try {
                          // Use cache: 'no-store' to ensure we get the latest file
                          const response = await fetch(previewUrl, { cache: "no-store" })
                          if (!response.ok) throw new Error("Failed to download")

                          const blob = await response.blob()
                          const contentType = response.headers.get("Content-Type") || "application/octet-stream"

                          let extension = ""
                          if (contentType.includes("pdf")) extension = ".pdf"
                          else if (contentType.includes("jpeg")) extension = ".jpg"
                          else if (contentType.includes("png")) extension = ".png"
                          else if (contentType.includes("gif")) extension = ".gif"
                          else if (contentType.includes("webp")) extension = ".webp"
                          else if (contentType.includes("word") || contentType.includes("msword")) extension = ".doc"
                          else if (contentType.includes("excel") || contentType.includes("spreadsheet"))
                            extension = ".xlsx"
                          else {
                            const urlLower = previewUrl.toLowerCase()
                            const match = urlLower.match(/\.([a-z0-9]+)(?:\?|$)/)
                            if (match) extension = `.${match[1]}`
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
                        } catch (error) {
                          toast({
                            variant: "destructive",
                            title: "Download Failed",
                            description: "Failed to download the file. Please try again.",
                          })
                        }
                      }}
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

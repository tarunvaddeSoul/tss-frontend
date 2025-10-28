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
  FileCheck,
  Users,
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

import { useCompany } from "@/hooks/use-company"
import { useAttendance } from "@/hooks/use-attendance"
import type { Company } from "@/types/company"

// Form validation schema - removed file type restriction to accept all formats
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

  const { toast } = useToast()
  const { data, isLoading: companiesLoading, fetchCompanies } = useCompany()
  const { uploadAttendance, loading: uploadLoading } = useAttendance()

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
      form.trigger("file") // Trigger validation
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
      form.trigger("file") // Trigger validation
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
      const formattedMonth = format(data.month, "yyyy-MM")

      const result = await uploadAttendance({
        companyId: data.companyId,
        month: formattedMonth,
        file: data.file,
      })

      setSubmissionResult(result)
      setIsSubmitted(true)

      toast({
        title: "Upload Successful",
        description: `Attendance file uploaded successfully. ${result.data?.processed || 0} records processed.`,
      })
    } catch (error: any) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload attendance file. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Reset form for new session
  const startNewSession = () => {
    form.reset()
    setIsSubmitted(false)
    setSubmissionResult(null)
    setSelectedFile(null)
    toast({
      title: "New Session Started",
      description: "You can now upload a new attendance file.",
    })
  }

  // Get selected company name
  const getSelectedCompanyName = () => {
    const companyId = form.watch("companyId")
    const company = companies.find((c) => c.id === companyId)
    return company?.name || ""
  }

  // Get selected month display
  const getSelectedMonthDisplay = () => {
    const month = form.watch("month")
    return month ? format(month, "MMMM yyyy") : ""
  }

  const getFileIcon = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "xlsx":
      case "xls":
        return "📊"
      case "csv":
        return "📋"
      case "pdf":
        return "📄"
      case "jpg":
      case "jpeg":
      case "png":
        return "🖼️"
      default:
        return "📁"
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">Upload Successful!</h3>
                <p className="text-green-700">Your attendance file has been uploaded and processed successfully.</p>
              </div>

              {submissionResult && (
                <div className="bg-white border border-green-200 rounded-lg p-6 text-left">
                  <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Upload Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600">Company:</span>
                        <p className="font-medium">{getSelectedCompanyName()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Month:</span>
                        <p className="font-medium">{getSelectedMonthDisplay()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">File:</span>
                        <p className="font-medium">{selectedFile?.name}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600">Records Processed:</span>
                        <p className="font-medium text-blue-600">{submissionResult.data?.processed || 0}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Records Created:</span>
                        <p className="font-medium text-green-600">{submissionResult.data?.created || 0}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Failed Records:</span>
                        <p className="font-medium text-red-600">{submissionResult.data?.failed || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <span className="text-gray-600">Uploaded at:</span>
                    <p className="font-medium">{new Date().toLocaleString()}</p>
                  </div>
                </div>
              )}

              <Button onClick={startNewSession} size="lg" className="mt-6">
                <RotateCcw className="w-4 h-4 mr-2" />
                Upload Another File
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Upload Attendance</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Upload attendance data for employees using Excel, CSV, PDF, or image files
        </p>
      </div>

      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UploadCloud className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold">Upload Attendance Data</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload employee attendance records using Excel, CSV, PDF, or image files. Our system supports multiple formats
          for your convenience.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Company and Month Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Select Company
                </CardTitle>
                <CardDescription>Choose the company for attendance upload</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitted || companiesLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id ?? ""}>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-500" />
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Select Month
                </CardTitle>
                <CardDescription>Choose the month for attendance data</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month *</FormLabel>
                      <FormControl>
                        <MonthPicker
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isSubmitted}
                          placeholder="Select month"
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Upload Attendance File
              </CardTitle>
              <CardDescription>
                Drag and drop your file or click to browse. Supports all file formats including Excel, CSV, PDF, and
                images.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <div
                        className={cn(
                          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
                          selectedFile ? "border-green-500 bg-green-50" : "",
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <Input
                          type="file"
                          onChange={handleFileChange}
                          disabled={isSubmitted}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />

                        {selectedFile ? (
                          <div className="space-y-4">
                            <div className="text-6xl">{getFileIcon(selectedFile)}</div>
                            <div>
                              <p className="font-medium text-green-800">{selectedFile.name}</p>
                              <div className="flex items-center justify-center gap-4 mt-2">
                                <Badge variant="secondary">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Badge>
                                <Badge variant="outline">{selectedFile.type || "Unknown type"}</Badge>
                              </div>
                            </div>
                            <p className="text-sm text-green-600">File ready for upload</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-6xl">📁</div>
                            <div>
                              <p className="text-lg font-medium text-gray-700">Drop your attendance file here</p>
                              <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                              <Badge variant="outline">Excel (.xlsx, .xls)</Badge>
                              <Badge variant="outline">CSV</Badge>
                              <Badge variant="outline">PDF</Badge>
                              <Badge variant="outline">Images (.jpg, .png)</Badge>
                              <Badge variant="outline">All formats supported</Badge>
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
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>File Requirements:</strong>
                  <ul className="mt-2 text-sm space-y-1 list-disc list-inside">
                    <li>Maximum file size: 10MB</li>
                    <li>All file formats are supported</li>
                    <li>For Excel/CSV: First row should contain headers</li>
                    <li>Required columns: Employee ID, Present Days</li>
                    <li>Optional: Employee Name, Department, Designation</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={uploadLoading || isSubmitted || !isFormValid}
              size="lg"
              className="min-w-48"
            >
              {uploadLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Attendance
                </>
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          {uploadLoading && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading file...</span>
                    <span>Processing</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-gray-500 text-center">Please wait while we process your attendance file</p>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  )
}

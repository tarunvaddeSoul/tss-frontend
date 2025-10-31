"use client"

import { useEffect, useState } from "react"
import { Building2, Calendar as CalendarIcon, Eye, Loader2, Trash2, Upload as UploadIcon, Download, FileText } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { MonthPicker } from "@/components/ui/month-picker"
import { Badge } from "@/components/ui/badge"
import { useCompany } from "@/hooks/use-company"
import { attendanceSheetService } from "@/services/attendanceSheetService"
import type { Company } from "@/types/company"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const schema = z.object({
  companyId: z.string().min(1, "Select a company"),
  month: z.date({ required_error: "Select a month" }),
})

type FormValues = z.infer<typeof schema>

export default function AttendanceRecordsPage() {
  const { data: companiesData, isLoading: companiesLoading, fetchCompanies } = useCompany()
  const companies: Company[] = companiesData?.companies || []
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [record, setRecord] = useState<{ id: string; attendanceSheetUrl: string } | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<"pdf" | "image" | "unsupported" | "loading">("loading")

  useEffect(() => {
    fetchCompanies()
  }, [])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { companyId: "", month: undefined },
  })

  const doFetch = async (values: FormValues) => {
    try {
      setLoading(true)
      const month = format(values.month, "yyyy-MM")
      const res = await attendanceSheetService.get(values.companyId, month)
      setRecord(res.data ? { id: res.data.id, attendanceSheetUrl: res.data.attendanceSheetUrl } : null)
      toast({ title: "Loaded", description: res.message })
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to load records", variant: "destructive" })
      setRecord(null)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = (values: FormValues) => doFetch(values)

  const onDelete = async () => {
    const values = form.getValues()
    if (!record) return
    try {
      setLoading(true)
      await attendanceSheetService.delete(record.id)
      setRecord(null)
      toast({ title: "Deleted", description: "Attendance sheet deleted" })
      if (values.companyId && values.month) await doFetch(values)
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message || "Unable to delete", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="mb-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Attendance Records</h1>
        <p className="text-sm text-muted-foreground">View uploaded attendance sheets by company and month.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4"/>Company</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField name="companyId" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Select company</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={companiesLoading}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select company"/></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id ?? ""}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage/>
                </FormItem>
              )}/>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><CalendarIcon className="w-4 h-4"/>Month</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField name="month" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Select month</FormLabel>
                  <FormControl>
                    <MonthPicker value={field.value} onChange={field.onChange} placeholder="Select month"/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}/>
            </CardContent>
          </Card>

          <div className="flex items-end">
            <Button type="submit" className="w-full" disabled={loading || companiesLoading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null} Search
            </Button>
          </div>
        </form>
      </Form>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Results</CardTitle>
        </CardHeader>
        <CardContent>
          {!record ? (
            <div className="text-sm text-muted-foreground">No sheet found for selected company and month.</div>
          ) : (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm">Attendance Sheet</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (!record?.attendanceSheetUrl) return
                      
                      setPreviewUrl(record.attendanceSheetUrl)
                      setPreviewOpen(true)
                      setPreviewType("loading")
                      
                      // Detect file type
                      try {
                        const response = await fetch(record.attendanceSheetUrl, { method: "HEAD" })
                        const contentType = response.headers.get("Content-Type") || ""
                        const urlLower = record.attendanceSheetUrl.toLowerCase()
                        
                        // Check for PDF first
                        if (contentType.includes("pdf") || urlLower.endsWith(".pdf")) {
                          setPreviewType("pdf")
                          return
                        }
                        
                        // Check for images - be more comprehensive
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
                        
                        // If Content-Type is not helpful, default to trying image first
                        // (many servers return application/octet-stream for images)
                        // The img tag's onError will handle if it's not actually an image
                        if (!contentType || contentType === "application/octet-stream") {
                          setPreviewType("image")
                        } else {
                          setPreviewType("unsupported")
                        }
                      } catch (error) {
                        // Fallback: try to detect from URL
                        console.log("HEAD request failed, using URL detection:", error)
                        const urlLower = record.attendanceSheetUrl.toLowerCase()
                        
                        if (urlLower.endsWith(".pdf")) {
                          setPreviewType("pdf")
                        } else if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)) {
                          setPreviewType("image")
                        } else {
                          // For unknown types, try to load as image first (common case)
                          // If image load fails, it will fall back to unsupported
                          setPreviewType("image")
                        }
                      }
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2"/> View
                  </Button>
                </div>
                <div>
                  <Badge variant="outline">{form.getValues().month ? format(form.getValues().month!, "MMMM yyyy") : "—"}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.location.assign("/attendance/upload")}> 
                  <UploadIcon className="w-4 h-4 mr-2"/> Replace
                </Button>
                <Button variant="destructive" onClick={onDelete} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Trash2 className="w-4 h-4 mr-2"/>}
                  Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span>
                Attendance Sheet - {companies.find((c) => c.id === form.getValues("companyId"))?.name || "Sheet"} - {form.getValues().month ? format(form.getValues().month!, "MMMM yyyy") : ""}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!previewUrl) return
                    try {
                      const response = await fetch(previewUrl)
                      if (!response.ok) throw new Error("Failed to download")
                      
                      const blob = await response.blob()
                      const contentType = response.headers.get("Content-Type") || "application/octet-stream"
                      
                      // Detect extension from content type or URL
                      let extension = ""
                      if (contentType.includes("pdf")) extension = ".pdf"
                      else if (contentType.includes("jpeg") || contentType.includes("jpg")) extension = ".jpg"
                      else if (contentType.includes("png")) extension = ".png"
                      else if (contentType.includes("gif")) extension = ".gif"
                      else if (contentType.includes("webp")) extension = ".webp"
                      else {
                        // Try to get extension from URL
                        const urlLower = previewUrl.toLowerCase()
                        const match = urlLower.match(/\.([a-z0-9]+)(?:\?|$)/)
                        if (match) extension = `.${match[1]}`
                        else extension = ".jpg" // Default for images from S3
                      }
                      
                      const selectedCompany = companies.find((c) => c.id === form.getValues("companyId"))
                      const selectedMonth = form.getValues().month
                      const filename = `attendance-sheet-${selectedCompany?.name || "sheet"}-${selectedMonth ? format(selectedMonth, "yyyy-MM") : ""}${extension}`
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
                <iframe src={previewUrl || ""} className="w-full h-[70vh] border-0" />
              ) : previewType === "image" ? (
                <div className="flex items-center justify-center min-h-[70vh] bg-gray-50 p-4">
                  <img
                    src={previewUrl || ""}
                    alt="Attendance Sheet"
                    className="max-w-full max-h-[70vh] object-contain"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error("Image load error:", e, "URL:", previewUrl)
                      // Only switch to unsupported if it's definitely not an image
                      const urlLower = (previewUrl || "").toLowerCase()
                      if (!urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)) {
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
                          const response = await fetch(previewUrl)
                          if (!response.ok) throw new Error("Failed to download")
                          
                          const blob = await response.blob()
                          const contentType = response.headers.get("Content-Type") || "application/octet-stream"
                          
                          // Detect extension from content type
                          let extension = ""
                          if (contentType.includes("pdf")) extension = ".pdf"
                          else if (contentType.includes("jpeg")) extension = ".jpg"
                          else if (contentType.includes("png")) extension = ".png"
                          else if (contentType.includes("gif")) extension = ".gif"
                          else if (contentType.includes("webp")) extension = ".webp"
                          else if (contentType.includes("word") || contentType.includes("msword")) extension = ".doc"
                          else if (contentType.includes("excel") || contentType.includes("spreadsheet")) extension = ".xlsx"
                          else {
                            // Try to get extension from URL
                            const urlLower = previewUrl.toLowerCase()
                            const match = urlLower.match(/\.([a-z0-9]+)(?:\?|$)/)
                            if (match) extension = `.${match[1]}`
                          }
                          
                          const selectedCompany = companies.find((c) => c.id === form.getValues("companyId"))
                          const selectedMonth = form.getValues().month
                          const filename = `attendance-sheet-${selectedCompany?.name || "sheet"}-${selectedMonth ? format(selectedMonth, "yyyy-MM") : ""}${extension}`
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



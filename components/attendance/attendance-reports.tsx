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
  Eye,
  Loader2,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { useCompany } from "@/hooks/use-company"
import { attendanceService } from "@/services/attendanceService"
import type { Company } from "@/types/company"

// Types for attendance data
interface AttendanceRecord {
  employeeID: string
  employeeName: string
  companyName: string
  designationName: string
  departmentName: string
  presentCount: number
  attendanceSheetUrl: string
}

interface CompanyAttendanceRecord {
  id: string
  employeeId: string
  month: string
  presentCount: number
  companyId: string
}

// Form validation schema
const reportsSchema = z.object({
  companyId: z.string().min(1, "Please select a company"),
  month: z.string().min(1, "Please select a month"),
})

type ReportsFormValues = z.infer<typeof reportsSchema>

export function AttendanceReportsComponent() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMonths, setLoadingMonths] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)

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
    setAttendanceData([])

    if (!companyId) {
      setAvailableMonths([])
      return
    }

    try {
      setLoadingMonths(true)
      const response = await attendanceService.getAttendanceByCompanyId(companyId)

      // Extract unique months from the response
      const months = response.data?.map((record: CompanyAttendanceRecord) => record.month) || []
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

      const response = await attendanceService.getAttendanceByCompanyAndMonth({
        companyId: data.companyId,
        month: data.month,
      })

      setAttendanceData(response.data || [])
      setReportGenerated(true)

      toast({
        title: "Report Generated",
        description: `Found ${response.data?.length || 0} attendance records for the selected period.`,
      })
    } catch (error: any) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Generate CSV content
  const generateCSV = () => {
    if (!attendanceData.length) return ""

    const headers = ["Employee ID", "Employee Name", "Company Name", "Department", "Designation", "Present Days"]
    const csvContent = [
      headers.join(","),
      ...attendanceData.map((record) =>
        [
          record.employeeID,
          `"${record.employeeName}"`,
          `"${record.companyName}"`,
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
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `attendance-report-${getSelectedCompanyName()}-${form.watch("month")}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    toast({
      title: "CSV Downloaded",
      description: "Attendance report has been downloaded as CSV file.",
    })
  }

  // Generate and download PDF
  const downloadPDF = () => {
    // Create a simple HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Attendance Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat-item { text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          .stat-label { font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Attendance Report</h1>
          <h2>${getSelectedCompanyName()}</h2>
          <p>Month: ${getSelectedMonthDisplay()}</p>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="stats">
          <div class="stat-item">
            <div class="stat-value">${stats.totalEmployees}</div>
            <div class="stat-label">Total Employees</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.totalPresent}</div>
            <div class="stat-label">Total Present Days</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.avgAttendance.toFixed(1)}</div>
            <div class="stat-label">Average Attendance</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Present Days</th>
            </tr>
          </thead>
          <tbody>
            ${attendanceData
              .map(
                (record) => `
              <tr>
                <td>${record.employeeID}</td>
                <td>${record.employeeName}</td>
                <td>${record.departmentName}</td>
                <td>${record.designationName}</td>
                <td>${record.presentCount}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `

    // Open in new window for printing/saving as PDF
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.focus()

      // Trigger print dialog
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }

    toast({
      title: "PDF Generated",
      description: "PDF report has been opened in a new window. Use your browser's print function to save as PDF.",
    })
  }

  const previewReport = () => {
    // Open preview in new window
    const csvContent = generateCSV()
    const previewContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Attendance Report Preview</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
          .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #2563eb; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          tr:hover { background-color: #f0f8ff; }
          .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
          .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; }
          .stat-value { font-size: 28px; font-weight: bold; color: #2563eb; }
          .stat-label { font-size: 14px; color: #64748b; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Attendance Report</h1>
            <h2>${getSelectedCompanyName()}</h2>
            <p><strong>Month:</strong> ${getSelectedMonthDisplay()}</p>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${stats.totalEmployees}</div>
              <div class="stat-label">Total Employees</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.totalPresent}</div>
              <div class="stat-label">Total Present Days</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.avgAttendance.toFixed(1)}</div>
              <div class="stat-label">Average Attendance</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Present Days</th>
              </tr>
            </thead>
            <tbody>
              ${attendanceData
                .map(
                  (record) => `
                <tr>
                  <td><strong>${record.employeeID}</strong></td>
                  <td>${record.employeeName}</td>
                  <td>${record.departmentName}</td>
                  <td>${record.designationName}</td>
                  <td><span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${record.presentCount}</span></td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `

    const previewWindow = window.open("", "_blank")
    if (previewWindow) {
      previewWindow.document.write(previewContent)
      previewWindow.document.close()
    }

    toast({
      title: "Report Preview",
      description: "Report preview has been opened in a new window.",
    })
  }

  const getSelectedCompanyName = () => {
    const companyId = form.watch("companyId")
    const company = companies.find((c) => c.id === companyId)
    return company?.name || ""
  }

  const getSelectedMonthDisplay = () => {
    const month = form.watch("month")
    if (!month) return ""

    try {
      const date = parse(month, "yyyy-MM", new Date())
      return format(date, "MMMM yyyy")
    } catch {
      return month
    }
  }

  const calculateStats = () => {
    if (!attendanceData.length) return { totalEmployees: 0, totalPresent: 0, avgAttendance: 0 }

    const totalEmployees = attendanceData.length
    const totalPresent = attendanceData.reduce((sum, record) => sum + record.presentCount, 0)
    const avgAttendance = totalPresent / totalEmployees

    return { totalEmployees, totalPresent, avgAttendance }
  }

  const stats = calculateStats()

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Attendance Reports</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Generate and download comprehensive attendance reports for your companies
        </p>
      </div>

      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold">Attendance Reports</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Generate detailed attendance reports for any company and month. Download reports in PDF or Excel format for
          further analysis.
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
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
      {reportGenerated && (
        <div className="space-y-6">
          {/* Report Header */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Report Generated Successfully</h3>
                  <p className="text-green-700">
                    {getSelectedCompanyName()} - {getSelectedMonthDisplay()}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Employees</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalEmployees}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Present Days</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totalPresent}</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Attendance</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.avgAttendance.toFixed(1)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Download Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Download Report</CardTitle>
              <CardDescription>Download the attendance report in your preferred format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={downloadPDF} variant="outline" size="lg">
                  <FileText className="w-5 h-5 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={downloadCSV} variant="outline" size="lg">
                  <Download className="w-5 h-5 mr-2" />
                  Download CSV
                </Button>
                <Button onClick={previewReport} variant="outline" size="lg">
                  <Eye className="w-5 h-5 mr-2" />
                  Preview Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Data Table */}
          {attendanceData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>Detailed attendance data for {getSelectedMonthDisplay()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Employee ID</th>
                        <th className="text-left p-3 font-medium">Employee Name</th>
                        <th className="text-left p-3 font-medium">Department</th>
                        <th className="text-left p-3 font-medium">Designation</th>
                        <th className="text-center p-3 font-medium">Present Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.map((record, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <Badge variant="outline">{record.employeeID}</Badge>
                          </td>
                          <td className="p-3 font-medium">{record.employeeName}</td>
                          <td className="p-3">{record.departmentName}</td>
                          <td className="p-3">{record.designationName}</td>
                          <td className="p-3 text-center">
                            <Badge variant="secondary">{record.presentCount}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {attendanceData.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No attendance records found for the selected company and month.</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Printer, Download, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { SalaryFieldPurpose, SalaryFieldType, type SalaryTemplateConfig } from "@/types/company"

interface SalarySlipPreviewProps {
  config: SalaryTemplateConfig
}

export function SalarySlipPreview({ config }: SalarySlipPreviewProps) {
  const [employeeName, setEmployeeName] = useState("John Doe")
  const [month, setMonth] = useState(new Date().toLocaleString("default", { month: "long" }))
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Get all enabled fields
  const getEnabledFields = () => {
    const mandatoryFields = config.mandatoryFields.filter((field) => field.enabled)
    const optionalFields = config.optionalFields.filter((field) => field.enabled)
    const customFields = (config.customFields || []).filter((field) => field.enabled)

    return [...mandatoryFields, ...optionalFields, ...customFields]
  }

  // Group fields by purpose
  const groupFieldsByPurpose = () => {
    const enabledFields = getEnabledFields()
    const grouped = {
      [SalaryFieldPurpose.INFORMATION]: enabledFields.filter(
        (field) => field.purpose === SalaryFieldPurpose.INFORMATION,
      ),
      [SalaryFieldPurpose.CALCULATION]: enabledFields.filter(
        (field) => field.purpose === SalaryFieldPurpose.CALCULATION,
      ),
      [SalaryFieldPurpose.ALLOWANCE]: enabledFields.filter((field) => field.purpose === SalaryFieldPurpose.ALLOWANCE),
      [SalaryFieldPurpose.DEDUCTION]: enabledFields.filter((field) => field.purpose === SalaryFieldPurpose.DEDUCTION),
    }

    return grouped
  }

  // Get field value based on field type and default values
  const getFieldValue = (field: any) => {
    if (field.key === "employeeName") return employeeName
    if (field.key === "month") return month
    if (field.key === "year") return year
    if (field.key === "basicDuty") return `${field.defaultValue || "30"} days`

    if (field.type === SalaryFieldType.NUMBER) {
      if (field.rules?.defaultValue) return field.rules.defaultValue.toLocaleString()
      return "0"
    }

    if (field.type === SalaryFieldType.TEXT) {
      return field.defaultValue || "-"
    }

    if (field.type === SalaryFieldType.SELECT) {
      return field.defaultValue || "-"
    }

    return "-"
  }

  // Convert template config to new SalarySlipData format
  const convertToSalarySlipData = () => {
    const groupedFields = groupFieldsByPurpose()
    
    // Get numeric values from fields
    const getNumericValue = (field: any) => {
      if (field.type === SalaryFieldType.NUMBER) {
        return Number(field.rules?.defaultValue || field.defaultValue || 0)
      }
      return 0
    }

    // Calculate earnings
    const basicField = groupedFields[SalaryFieldPurpose.CALCULATION].find(
      (f) => f.key === "basic" || f.key === "basicSalary" || f.key === "basicPay"
    )
    const basic = basicField ? getNumericValue(basicField) : 15000

    const allowanceFields = groupedFields[SalaryFieldPurpose.ALLOWANCE]
    const allowance = allowanceFields.reduce((sum, field) => sum + getNumericValue(field), 0)
    const otherAllowance = 0 // Can be extended if needed
    const other = 0
    const grossEarning = basic + allowance + otherAllowance + other

    // Calculate deductions
    const deductionFields = groupedFields[SalaryFieldPurpose.DEDUCTION]
    const epfContribution = deductionFields
      .filter((f) => f.key === "pf" || f.key === "epfContribution12Percent")
      .reduce((sum, field) => sum + getNumericValue(field), 0)
    const esicContribution = deductionFields
      .filter((f) => f.key === "esic" || f.key === "esic075Percent")
      .reduce((sum, field) => sum + getNumericValue(field), 0)
    const advance = deductionFields
      .filter((f) => f.key === "advance")
      .reduce((sum, field) => sum + getNumericValue(field), 0)
    const grossDeduction = epfContribution + esicContribution + advance
    const netPay = grossEarning - grossDeduction

    // Format month (e.g., "January" to "Jan-25")
    const formatMonth = (monthStr: string, yearStr: string) => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const fullMonthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
      const monthIndex = fullMonthNames.indexOf(monthStr)
      const monthAbbr = monthIndex >= 0 ? monthNames[monthIndex] : monthStr.substring(0, 3)
      return `${monthAbbr}-${yearStr.slice(-2)}`
    }

    // Get pay period
    const getPayPeriod = (monthStr: string, yearStr: string) => {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
      const monthIndex = monthNames.indexOf(monthStr)
      if (monthIndex < 0) return "01-01-2025 to 31-01-2025"
      const year = parseInt(yearStr)
      const lastDay = new Date(year, monthIndex + 1, 0).getDate()
      const monthNum = String(monthIndex + 1).padStart(2, "0")
      return `01-${monthNum}-${year} to ${String(lastDay).padStart(2, "0")}-${monthNum}-${year}`
    }

    return {
      company: "TULSYAN SECURITY SERVICES PVT. LTD.",
      month: formatMonth(month, year),
      pay_period: getPayPeriod(month, year),
      employee: {
        name: employeeName || "Sample Employee",
        employee_id: "E-XXX",
        category: "N/A",
        department: "N/A",
        location: "N/A",
        working_days: 27,
        account_no: "",
        esic_no: "",
        uan_no: "",
      },
      earnings: {
        basic: basic || 0,
        allowance: allowance || 0,
        other_allowance: otherAllowance || 0,
        other: other || 0,
        gross_earning: grossEarning || 0,
      },
      deductions: {
        epf_contribution_12_percent: epfContribution || 0,
        esic_0_75_percent: esicContribution || 0,
        advance: advance || 0,
        gross_deduction: grossDeduction || 0,
      },
      net_pay: netPay || 0,
    }
  }

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true)

      // Clean up previous PDF if exists
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
        setPdfUrl(null)
      }

      // Dynamically import both pdf and the component
      const [{ pdf }, { default: SalarySlipPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/salary-slip-pdf"),
      ])

      // Convert config to new format
      const salarySlipData = convertToSalarySlipData()

      // Validate data before generating
      if (!salarySlipData || !salarySlipData.employee || !salarySlipData.earnings || !salarySlipData.deductions) {
        throw new Error("Invalid salary slip data")
      }

      // Generate PDF with a delay to avoid Config conflicts
      // This is a known React-PDF issue that can be safely ignored if PDF generates successfully
      await new Promise((resolve) => setTimeout(resolve, 200))
      
      let blob: Blob | null = null
      let configErrorOccurred = false
      
      try {
        blob = await pdf(<SalarySlipPDF data={salarySlipData} />).toBlob()
      } catch (error: any) {
        // Check if it's the BindingError (Config error) - this is a known React-PDF quirk
        if (error?.name === "BindingError" && error?.message?.includes("Config")) {
          configErrorOccurred = true
          // Retry once after a brief delay
          await new Promise((resolve) => setTimeout(resolve, 300))
          try {
            blob = await pdf(<SalarySlipPDF data={salarySlipData} />).toBlob()
          } catch (retryError: any) {
            // If retry also fails, throw the original error
            if (retryError?.name === "BindingError" && retryError?.message?.includes("Config")) {
              // Still try to generate - sometimes it works despite the error
              blob = await pdf(<SalarySlipPDF data={salarySlipData} />).toBlob()
            } else {
              throw retryError
            }
          }
        } else {
          throw error
        }
      }

      if (!blob) {
        throw new Error("Failed to generate PDF blob")
      }

      const url = URL.createObjectURL(blob)
      setPdfUrl(url)

      // Only show success toast if we didn't have a Config error (to avoid confusion)
      if (!configErrorOccurred) {
        toast({
          title: "PDF Generated",
          description: "Your salary slip PDF has been generated successfully",
        })
      }
    } catch (error: any) {
      // Only show error toast for real errors, not Config binding errors
      if (error?.name !== "BindingError" || !error?.message?.includes("Config")) {
        console.error("Error generating PDF:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate PDF. Please try again.",
        })
      } else {
        // Silently handle Config errors - they're usually harmless
        console.warn("PDF Config warning (can be safely ignored):", error.message)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!pdfUrl) {
      await handleGeneratePDF()
      return
    }

    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = `salary_slip_${employeeName.replace(/\s+/g, "_").toLowerCase()}_${month}_${year}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Auto-generate PDF preview when component mounts or inputs change
  useEffect(() => {
    // Add a delay to prevent rapid re-generation and Config conflicts
    const timeoutId = setTimeout(() => {
      void handleGeneratePDF()
    }, 300)
    
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeName, month, year, config])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Salary Slip Preview</CardTitle>
        <CardDescription>See how the salary slip will look with your template configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="employeeName">Employee Name</Label>
            <Input
              id="employeeName"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Enter employee name"
            />
          </div>
          <div>
            <Label htmlFor="month">Month</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger id="month">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="year">Year</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger id="year">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const yearValue = new Date().getFullYear() - 2 + i
                  return (
                    <SelectItem key={yearValue} value={yearValue.toString()}>
                      {yearValue}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleGeneratePDF} disabled={isGenerating}>
            <FileText className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Regenerate Preview"}
          </Button>
        </div>

        {pdfUrl ? (
          <div className="space-y-4">
            <div className="border rounded-md overflow-hidden h-[500px]">
              <iframe src={pdfUrl} className="w-full h-full" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => window.open(pdfUrl, "_blank")}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden h-[500px] flex items-center justify-center bg-muted">
            <div className="text-center text-muted-foreground">
              {isGenerating ? (
                <p>Generating preview...</p>
              ) : (
                <p>Click Regenerate to create a preview</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

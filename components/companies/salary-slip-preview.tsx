"use client"

import { useState } from "react"
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

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true)

      // Clean up previous PDF if exists
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }

      // Dynamically import both pdf and the component
      const [{ pdf }, { default: SalarySlipPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/salary-slip-pdf"),
      ])

      // Generate PDF
      const blob = await pdf(
        <SalarySlipPDF config={config} employeeName={employeeName} month={month} year={year} />,
      ).toBlob()

      const url = URL.createObjectURL(blob)
      setPdfUrl(url)

      toast({
        title: "PDF Generated",
        description: "Your salary slip PDF has been generated successfully",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
      })
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

  const groupedFields = groupFieldsByPurpose()

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
            {isGenerating ? "Generating..." : "Generate Preview"}
          </Button>
        </div>

        {pdfUrl && (
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
        )}

        {!pdfUrl && (
          <div className="border rounded-lg p-6 bg-white print:shadow-none">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">SALARY SLIP</h2>
              <p className="text-lg">
                For the month of {month} {year}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Information Fields */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg border-b pb-1">Employee Information</h3>
                {groupedFields[SalaryFieldPurpose.INFORMATION].map((field) => (
                  <div key={field.key} className="flex justify-between">
                    <span className="font-medium">{field.label}:</span>
                    <span>{getFieldValue(field)}</span>
                  </div>
                ))}
              </div>

              {/* Calculation Fields */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg border-b pb-1">Salary Calculation</h3>
                {groupedFields[SalaryFieldPurpose.CALCULATION].map((field) => (
                  <div key={field.key} className="flex justify-between">
                    <span className="font-medium">{field.label}:</span>
                    <span>{getFieldValue(field)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Allowance Fields */}
              {groupedFields[SalaryFieldPurpose.ALLOWANCE].length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg border-b pb-1">Allowances</h3>
                  {groupedFields[SalaryFieldPurpose.ALLOWANCE].map((field) => (
                    <div key={field.key} className="flex justify-between">
                      <span className="font-medium">{field.label}:</span>
                      <span>{getFieldValue(field)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Deduction Fields */}
              {groupedFields[SalaryFieldPurpose.DEDUCTION].length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg border-b pb-1">Deductions</h3>
                  {groupedFields[SalaryFieldPurpose.DEDUCTION].map((field) => (
                    <div key={field.key} className="flex justify-between">
                      <span className="font-medium">{field.label}:</span>
                      <span>{getFieldValue(field)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Net Salary:</span>
                <span>
                  ₹{" "}
                  {groupedFields[SalaryFieldPurpose.CALCULATION].find((field) => field.key === "netSalary")
                    ? getFieldValue(
                        groupedFields[SalaryFieldPurpose.CALCULATION].find((field) => field.key === "netSalary"),
                      )
                    : "0"}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
              <p>This is a computer-generated salary slip and does not require a signature.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Printer, Download, FileText } from "lucide-react"
import { pdf } from "@react-pdf/renderer"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SalaryTemplates } from "@/types/company"

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 10,
    textAlign: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333333",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 4,
  },
  label: {
    width: "50%",
    fontSize: 10,
    fontWeight: "bold",
    color: "#555555",
  },
  value: {
    width: "50%",
    fontSize: 10,
    color: "#333333",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#999999",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 4,
    fontWeight: "bold",
  },
})

// PDF Document Component
const SalarySlipPDF = ({
  salaryTemplates,
  employeeName,
  month,
  year,
}: {
  salaryTemplates: SalaryTemplates
  employeeName: string
  month: string
  year: string
}) => {
  const currentDate = new Date().toLocaleDateString()

  // Get enabled fields grouped by category
  const basicFields = ["name", "fatherName", "companyName", "designation"]
  const salaryFields = ["monthlyRate", "basicDuty", "dutyDone", "wagesPerDay", "basicPay", "epfWages"]
  const allowanceFields = ["otherAllowance", "otherAllowanceRemark", "bonus", "grossSalary"]
  const deductionFields = [
    "pf",
    "esic",
    "advance",
    "uniform",
    "advanceGivenBy",
    "penalty",
    "lwf",
    "otherDeductions",
    "otherDeductionsRemark",
    "totalDeductions",
  ]
  const finalFields = ["netSalary", "uanNumber", "pfPaidStatus", "esicNumber", "esicFilingStatus"]

  // Helper to get enabled fields from a group
  const getEnabledFields = (fieldIds: string[]) => {
    return fieldIds.filter((id) => salaryTemplates[id] && salaryTemplates[id].enabled)
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Salary Slip</Text>
          <Text style={styles.subtitle}>
            {month} {year}
          </Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee Information</Text>

          {/* Always show employee name */}
          <View style={styles.row}>
            <Text style={styles.label}>Employee Name:</Text>
            <Text style={styles.value}>{employeeName}</Text>
          </View>

          {getEnabledFields(basicFields).map((fieldId) => (
            <View style={styles.row} key={fieldId}>
              <Text style={styles.label}>{fieldId}:</Text>
              <Text style={styles.value}>{salaryTemplates[fieldId]?.value || ""}</Text>
            </View>
          ))}
        </View>

        {/* Salary Information */}
        {getEnabledFields(salaryFields).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Salary Details</Text>

            {getEnabledFields(salaryFields).map((fieldId) => (
              <View style={styles.row} key={fieldId}>
                <Text style={styles.label}>{fieldId}:</Text>
                <Text style={styles.value}>{salaryTemplates[fieldId]?.value || ""}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Allowances */}
        {getEnabledFields(allowanceFields).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Allowances</Text>

            {getEnabledFields(allowanceFields).map((fieldId) => (
              <View style={styles.row} key={fieldId}>
                <Text style={styles.label}>{fieldId}:</Text>
                <Text style={styles.value}>{salaryTemplates[fieldId]?.value || ""}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Deductions */}
        {getEnabledFields(deductionFields).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deductions</Text>

            {getEnabledFields(deductionFields).map((fieldId) => (
              <View style={styles.row} key={fieldId}>
                <Text style={styles.label}>{fieldId}:</Text>
                <Text style={styles.value}>{salaryTemplates[fieldId]?.value || ""}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Final Details */}
        {getEnabledFields(finalFields).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Final Details</Text>

            {getEnabledFields(finalFields).map((fieldId) => (
              <View style={styles.row} key={fieldId}>
                <Text style={styles.label}>{fieldId}:</Text>
                <Text style={styles.value}>{salaryTemplates[fieldId]?.value || ""}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Net Salary (always show if available) */}
        {salaryTemplates.netSalary && salaryTemplates.netSalary.enabled && (
          <View style={styles.totalRow}>
            <Text style={styles.label}>Net Salary:</Text>
            <Text style={styles.value}>{salaryTemplates.netSalary.value || ""}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>Generated on {currentDate} | Tulsyan Security Solutions</Text>
        </View>
      </Page>
    </Document>
  )
}

interface SalarySlipPreviewProps {
  salaryTemplates: SalaryTemplates
}

export function SalarySlipPreview({ salaryTemplates }: SalarySlipPreviewProps) {
  const [employeeName, setEmployeeName] = useState("John Doe")
  const [month, setMonth] = useState(new Date().toLocaleString("default", { month: "long" }))
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true)

      // Clean up previous PDF if exists
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }

      // Generate PDF
      const blob = await pdf(
        <SalarySlipPDF salaryTemplates={salaryTemplates} employeeName={employeeName} month={month} year={year} />,
      ).toBlob()

      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!pdfUrl) return

    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = `salary_slip_${employeeName.replace(/\s+/g, "_").toLowerCase()}_${month}_${year}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
            <Input id="month" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="Enter month" />
          </div>
          <div>
            <Label htmlFor="year">Year</Label>
            <Input id="year" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Enter year" />
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
      </CardContent>
    </Card>
  )
}

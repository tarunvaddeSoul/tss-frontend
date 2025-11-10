import { Document, Text, View, StyleSheet, PDFDownloadLink, Image, Page } from "@react-pdf/renderer"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CompanyPayrollMonth, CompanyPayrollRecord } from "@/types/payroll"
import { BRAND, BrandPage, PdfFooter, PdfHeader, Section, brandStyles } from "@/components/pdf/brand"
import { SalarySlipPDFPage, type SalarySlipData } from "@/components/pdf/salary-slip-pdf"

function getCurrentDateTime(): string {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, "-").slice(0, 19)
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 10,
  },
  metadata: {
    fontSize: 9,
    color: "#888888",
  },
  monthSection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  monthTitle: {
    fontSize: 12,
    fontWeight: "bold",
  },
  monthStats: {
    fontSize: 9,
    color: "#6b7280",
  },
  table: brandStyles.table,
  tableRow: { ...brandStyles.tableRow, minHeight: 22, alignItems: "center" },
  tableHeader: brandStyles.tableHeader,
  tableCell: { ...brandStyles.tableCell, fontSize: 9 },
  col1: { width: "25%" }, // Employee
  col2: { width: "15%" }, // Basic Pay
  col3: { width: "15%" }, // Gross
  col4: { width: "15%" }, // Net
  col5: { width: "30%" }, // Deductions
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#666666",
  },
})

interface CompanyPayrollPDFProps {
  data: CompanyPayrollMonth[]
  companyName: string
  companyDetails?: {
    address?: string
    contactPersonName?: string
    contactPersonNumber?: string
    companyOnboardingDate?: string
  }
}

// Helper function to convert CompanyPayrollRecord to SalarySlipData
const convertToSalarySlipData = (
  record: CompanyPayrollRecord,
  companyName: string,
  month: string
): SalarySlipData => {
  const salaryData = record.salaryData
  const employee = record.employee

  // Format month (e.g., "2025-07" to "Jul-25")
  const formatMonth = (monthStr: string) => {
    const [year, monthNum] = monthStr.split("-")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${monthNames[parseInt(monthNum) - 1]}-${year.slice(-2)}`
  }

  // Get pay period (first and last day of month)
  const getPayPeriod = (monthStr: string) => {
    const [year, monthNum] = monthStr.split("-")
    const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate()
    return `01-${monthNum}-${year} to ${lastDay}-${monthNum}-${year}`
  }

  // Access grouped salary data with fallbacks for backward compatibility
  const calculations = salaryData?.calculations || {}
  const deductions = salaryData?.deductions || {}
  const allowances = salaryData?.allowances || {}
  const information = salaryData?.information || {}

  // Calculate earnings - use grouped structure with fallbacks
  const basic = calculations?.basicPay ?? salaryData?.basicPay ?? 0
  const allowance = allowances?.allowance ?? allowances?.hra ?? allowances?.transportAllowance ?? salaryData?.allowance ?? salaryData?.hra ?? salaryData?.transportAllowance ?? 0
  const otherAllowance = allowances?.otherAllowance ?? allowances?.bonus ?? salaryData?.otherAllowance ?? salaryData?.bonus ?? 0
  const other = allowances?.other ?? salaryData?.other ?? 0
  const grossEarning = calculations?.grossSalary ?? salaryData?.grossSalary ?? 0

  // Calculate deductions - use grouped structure with fallbacks
  const epfContribution = deductions?.pf ?? deductions?.epfContribution12Percent ?? salaryData?.pf ?? salaryData?.epfContribution12Percent ?? 0
  const esicContribution = deductions?.esic ?? deductions?.esic075Percent ?? salaryData?.esic ?? salaryData?.esic075Percent ?? 0
  const advance = deductions?.advance ?? deductions?.advanceTaken ?? salaryData?.advance ?? salaryData?.advanceTaken ?? 0
  const grossDeduction = deductions?.totalDeductions ?? salaryData?.totalDeductions ?? (epfContribution + esicContribution + advance)

  return {
    company: companyName,
    month: formatMonth(month),
    pay_period: getPayPeriod(month),
    employee: {
      name: employee
        ? `${employee.title || ""} ${employee.firstName} ${employee.lastName}`.trim()
        : record.employeeId,
      employee_id: record.employeeId,
      category: employee?.category ?? salaryData?.category ?? salaryData?.salaryCategory ?? "N/A",
      department: information?.department ?? salaryData?.department ?? "N/A",
      location: information?.location ?? salaryData?.location ?? "N/A",
      working_days: calculations?.dutyDone ?? calculations?.workingDays ?? salaryData?.dutyDone ?? salaryData?.workingDays ?? 0,
      account_no: information?.bankAccountNumber ?? "",
      esic_no: information?.esicNumber ?? "",
      uan_no: information?.uanNumber ? String(information.uanNumber) : information?.pfUanNumber ?? "",
    },
    earnings: {
      basic,
      allowance,
      other_allowance: otherAllowance,
      other,
      gross_earning: grossEarning,
    },
    deductions: {
      epf_contribution_12_percent: epfContribution,
      esic_0_75_percent: esicContribution,
      advance,
      gross_deduction: grossDeduction,
    },
    net_pay: calculations?.netSalary ?? salaryData?.netSalary ?? 0,
  }
}

const CompanyPayrollPDF = ({ data, companyName, companyDetails }: CompanyPayrollPDFProps) => {
  const totalEmployees = data.reduce((sum, month) => sum + month.employeeCount, 0)
  const totalNetSalary = data.reduce((sum, month) => sum + month.totalNetSalary, 0)

  // Collect all employee records for salary slips
  const allEmployeeRecords: Array<{ record: CompanyPayrollRecord; month: string }> = []
  data.forEach((monthData) => {
    monthData.records.forEach((record) => {
      allEmployeeRecords.push({ record, month: monthData.month })
    })
  })

  return (
    <Document
      title={`${companyName} - Payroll Report`}
      author={BRAND.name}
      subject="Company Payroll Report"
      keywords="Tulsyan Security Solutions, Payroll, Company"
    >
      {/* Page 1: Company Details */}
      <BrandPage>
        <PdfHeader title={`${companyName} - Payroll Report`} subtitle="Company Payroll Summary" />

        <Section title="Company Information">
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Company Name:</Text>
            <Text style={brandStyles.value}>{companyName}</Text>
          </View>
          {companyDetails?.address && (
            <View style={brandStyles.row}>
              <Text style={brandStyles.label}>Address:</Text>
              <Text style={brandStyles.value}>{companyDetails.address}</Text>
            </View>
          )}
          {companyDetails?.contactPersonName && (
            <View style={brandStyles.row}>
              <Text style={brandStyles.label}>Contact Person:</Text>
              <Text style={brandStyles.value}>{companyDetails.contactPersonName}</Text>
            </View>
          )}
          {companyDetails?.contactPersonNumber && (
            <View style={brandStyles.row}>
              <Text style={brandStyles.label}>Contact Number:</Text>
              <Text style={brandStyles.value}>{companyDetails.contactPersonNumber}</Text>
            </View>
          )}
          {companyDetails?.companyOnboardingDate && (
            <View style={brandStyles.row}>
              <Text style={brandStyles.label}>Onboarding Date:</Text>
              <Text style={brandStyles.value}>{companyDetails.companyOnboardingDate}</Text>
            </View>
          )}
        </Section>

        <Section title="Payroll Summary">
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total Months:</Text>
            <Text style={brandStyles.value}>{data.length}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total Employees:</Text>
            <Text style={brandStyles.value}>{totalEmployees}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total Net Salary:</Text>
            <Text style={brandStyles.value}>₹{totalNetSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
          </View>
        </Section>

        <PdfFooter rightNote="This is a computer-generated report" />
      </BrandPage>

      {/* Page 2+: Individual Salary Slips */}
      {allEmployeeRecords.map(({ record, month }) => {
        const salarySlipData = convertToSalarySlipData(record, companyName, month)
        return <SalarySlipPDFPage key={record.id} data={salarySlipData} />
      })}
    </Document>
  )
}

interface CompanyPayrollPDFDownloadButtonProps {
  data: CompanyPayrollMonth[]
  companyName: string
  companyDetails?: {
    address?: string
    contactPersonName?: string
    contactPersonNumber?: string
    companyOnboardingDate?: string
  }
  disabled?: boolean
  className?: string
}

export const CompanyPayrollPDFDownloadButton = ({
  data,
  companyName,
  companyDetails,
  disabled = false,
  className,
}: CompanyPayrollPDFDownloadButtonProps) => {
  const fileName = `${companyName.replace(/\s+/g, "_")}_Payroll_${getCurrentDateTime()}.pdf`

  return (
    <PDFDownloadLink
      document={<CompanyPayrollPDF data={data} companyName={companyName} companyDetails={companyDetails} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <Button variant="outline" size="lg" disabled={disabled || loading} className={`min-w-0 ${className || ""}`}>
          <FileText className="mr-2 h-5 w-5 shrink-0" />
          {loading ? (
            <>
              <span className="hidden sm:inline truncate">Generating PDF...</span>
              <span className="sm:hidden truncate">Generating...</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline truncate">View & Download PDF</span>
              <span className="sm:hidden truncate">PDF</span>
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  )
}


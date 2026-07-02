import { Document, Text, View, PDFDownloadLink } from "@react-pdf/renderer"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ClientPayrollMonth, ClientPayrollRecord } from "@/types/payroll"
import { formatDate } from "@/lib/labels"
import { BRAND, BrandPage, PdfFooter, PdfHeader, Section, brandStyles } from "@/components/pdf/brand"
import { SalarySlipPDFPage, type SalarySlipData } from "@/components/pdf/salary-slip-pdf"

function getCurrentDateTime(): string {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, "-").slice(0, 19)
}

interface ClientPayrollPDFProps {
  data: ClientPayrollMonth[]
  clientName: string
  clientDetails?: {
    address?: string
    contactPersonName?: string
    contactPersonNumber?: string
    clientOnboardingDate?: string
  }
}

export interface PayslipSourceRecord {
  employeeId: string
  salaryData: any
  employee?: { title?: string | null; firstName: string; lastName: string; category?: string | null } | null
}

// Helper function to convert a payroll record to SalarySlipData
export const clientRecordToSalarySlip = (
  record: PayslipSourceRecord,
  clientName: string,
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
    client: clientName,
    month: formatMonth(month),
    pay_period: getPayPeriod(month),
    employee: {
      name: employee
        ? `${employee.title || ""} ${employee.firstName} ${employee.lastName}`.trim()
        : information?.employeeName ?? record.employeeId,
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

const ClientPayrollPDF = ({ data, clientName, clientDetails }: ClientPayrollPDFProps) => {
  const totalEmployees = data.reduce((sum, month) => sum + month.employeeCount, 0)
  const totalNetSalary = data.reduce((sum, month) => sum + month.totalNetSalary, 0)

  // Collect all employee records for salary slips
  const allEmployeeRecords: Array<{ record: ClientPayrollRecord; month: string }> = []
  data.forEach((monthData) => {
    monthData.records.forEach((record) => {
      allEmployeeRecords.push({ record, month: monthData.month })
    })
  })

  return (
    <Document
      title={`${clientName} - Payroll Report`}
      author={BRAND.name}
      subject="Client Payroll Report"
      keywords="Tulsyan Security Services, Payroll, Client"
    >
      {/* Page 1: Client Details */}
      <BrandPage>
        <PdfHeader title={`${clientName} - Payroll Report`} subtitle="Client Payroll Summary" />

        <Section title="Client Information">
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Client Name:</Text>
            <Text style={brandStyles.value}>{clientName}</Text>
          </View>
          {clientDetails?.address && (
            <View style={brandStyles.row}>
              <Text style={brandStyles.label}>Address:</Text>
              <Text style={brandStyles.value}>{clientDetails.address}</Text>
            </View>
          )}
          {clientDetails?.contactPersonName && (
            <View style={brandStyles.row}>
              <Text style={brandStyles.label}>Contact Person:</Text>
              <Text style={brandStyles.value}>{clientDetails.contactPersonName}</Text>
            </View>
          )}
          {clientDetails?.contactPersonNumber && (
            <View style={brandStyles.row}>
              <Text style={brandStyles.label}>Contact Number:</Text>
              <Text style={[brandStyles.value, { fontFamily: "IBMPlexMono", fontSize: 9 }]}>{clientDetails.contactPersonNumber}</Text>
            </View>
          )}
          {clientDetails?.clientOnboardingDate && (
            <View style={brandStyles.row}>
              <Text style={brandStyles.label}>Onboarding Date:</Text>
              <Text style={brandStyles.value}>{formatDate(clientDetails.clientOnboardingDate)}</Text>
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
            <Text style={[brandStyles.value, { fontFamily: "IBMPlexMono", fontSize: 9 }]}>₹{totalNetSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
          </View>
        </Section>

        <PdfFooter rightNote="This is a computer-generated report" />
      </BrandPage>

      {/* Page 2+: Individual Salary Slips */}
      {allEmployeeRecords.map(({ record, month }) => {
        const salarySlipData = clientRecordToSalarySlip(record, clientName, month)
        return <SalarySlipPDFPage key={record.id} data={salarySlipData} />
      })}
    </Document>
  )
}

interface ClientPayrollPDFDownloadButtonProps {
  data: ClientPayrollMonth[]
  clientName: string
  clientDetails?: {
    address?: string
    contactPersonName?: string
    contactPersonNumber?: string
    clientOnboardingDate?: string
  }
  disabled?: boolean
  className?: string
}

export const ClientPayrollPDFDownloadButton = ({
  data,
  clientName,
  clientDetails,
  disabled = false,
  className,
}: ClientPayrollPDFDownloadButtonProps) => {
  const fileName = `${clientName.replace(/\s+/g, "_")}_Payroll_${getCurrentDateTime()}.pdf`

  return (
    <PDFDownloadLink
      document={<ClientPayrollPDF data={data} clientName={clientName} clientDetails={clientDetails} />}
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


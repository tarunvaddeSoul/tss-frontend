import { Document } from "@react-pdf/renderer"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import type { EmployeePayrollRecord } from "@/types/payroll"
import { BRAND, SalarySlipPDFPage, type SalarySlipData } from "@/components/pdf/salary-slip-pdf"
import { PdfPreviewDialog } from "@/components/pdf/pdf-preview-dialog"
import { format } from "date-fns"

function getCurrentDateTime(): string {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, "-").slice(0, 19)
}

// Convert employee payroll record to salary slip data format
function convertToSalarySlipData(record: EmployeePayrollRecord): SalarySlipData {
  const salaryData = record.salaryData as any

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

  // Get employee name from information or record
  const employeeName = information?.employeeName || record.employeeId

  return {
    company: information?.companyName || "N/A",
    month: formatMonth(record.month),
    pay_period: getPayPeriod(record.month),
    employee: {
      name: employeeName,
      employee_id: record.employeeId,
      category: salaryData?.salaryCategory ?? salaryData?.category ?? "N/A",
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

interface EmployeePayrollPDFProps {
  data: EmployeePayrollRecord[]
  employeeId: string
}

const EmployeePayrollPDF = ({ data, employeeId }: EmployeePayrollPDFProps) => {
  // Sort records by month (ascending)
  const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month))

  return (
    <Document
      title={`Employee ${employeeId} - Payroll Report`}
      author={BRAND.name}
      subject="Employee Payroll Report"
      keywords="Tulsyan Security Services, Payroll, Employee"
    >
      {/* Generate one salary slip per month */}
      {sortedData.map((record) => {
        const salarySlipData = convertToSalarySlipData(record)
        return <SalarySlipPDFPage key={record.id} data={salarySlipData} />
      })}
    </Document>
  )
}

interface EmployeePayrollPDFDownloadButtonProps {
  data: EmployeePayrollRecord[]
  employeeId: string
  disabled?: boolean
  className?: string
}

export const EmployeePayrollPDFDownloadButton = ({
  data,
  employeeId,
  disabled = false,
  className,
}: EmployeePayrollPDFDownloadButtonProps) => {
  const [pdfOpen, setPdfOpen] = useState(false)

  // Get month range for description
  const getMonthRange = () => {
    if (data.length === 0) return ""
    const sortedMonths = [...data].map((r) => r.month).sort()
    const startMonth = sortedMonths[0]
    const endMonth = sortedMonths[sortedMonths.length - 1]
    
    if (startMonth === endMonth) {
      try {
        const [year, month] = startMonth.split("-")
        return format(new Date(parseInt(year), parseInt(month) - 1, 1), "MMM yyyy")
      } catch {
        return startMonth
      }
    }
    
    try {
      const [startYear, startMonthNum] = startMonth.split("-")
      const [endYear, endMonthNum] = endMonth.split("-")
      const start = format(new Date(parseInt(startYear), parseInt(startMonthNum) - 1, 1), "MMM yyyy")
      const end = format(new Date(parseInt(endYear), parseInt(endMonthNum) - 1, 1), "MMM yyyy")
      return `${start} - ${end}`
    } catch {
      return `${startMonth} - ${endMonth}`
    }
  }

  const fileName = `Employee_${employeeId}_Payroll_${getCurrentDateTime()}.pdf`
  const monthRange = getMonthRange()

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        disabled={disabled}
        onClick={() => setPdfOpen(true)}
        className={`min-w-0 ${className || ""}`}
      >
        <FileText className="mr-2 h-5 w-5 shrink-0" />
        <span className="hidden sm:inline truncate">View & Download PDF</span>
        <span className="sm:hidden truncate">PDF</span>
      </Button>

      {pdfOpen && (
        <PdfPreviewDialog
          open={pdfOpen}
          onOpenChange={setPdfOpen}
          title={`Employee ${employeeId} - Payroll Report`}
          description={monthRange ? `Pay Period: ${monthRange}` : "Employee Payroll Report"}
          fileName={fileName}
          renderDocument={() => <EmployeePayrollPDF data={data} employeeId={employeeId} />}
        />
      )}
    </>
  )
}


import { Document } from "@react-pdf/renderer"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import type { EmployeePayrollRecord } from "@/types/payroll"
import { SalarySlipPDFPage, payrollRecordToSalarySlip } from "@/components/pdf/salary-slip-pdf"
import { BRAND } from "@/components/pdf/brand"
import { PdfPreviewDialog } from "@/components/pdf/pdf-preview-dialog"
import { downloadFileName } from "@/lib/filenames"
import { formatMonth } from "@/lib/labels"
import { resolveEmployeeName } from "@/utils/payroll-export"

interface EmployeePayrollPDFProps {
  data: EmployeePayrollRecord[]
  title: string
}

const EmployeePayrollPDF = ({ data, title }: EmployeePayrollPDFProps): JSX.Element => {
  const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month))

  return (
    <Document
      title={`${title} - Payroll Report`}
      author={BRAND.name}
      subject="Employee Payroll Report"
      keywords="Tulsyan Security Services, Payroll, Employee"
    >
      {sortedData.map((record) => (
        <SalarySlipPDFPage key={record.id} data={payrollRecordToSalarySlip(record)} />
      ))}
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
}: EmployeePayrollPDFDownloadButtonProps): JSX.Element => {
  const [pdfOpen, setPdfOpen] = useState(false)

  const months = data.map((record) => record.month).sort()
  const monthRange =
    months.length === 0
      ? ""
      : months[0] === months[months.length - 1]
        ? formatMonth(months[0])
        : `${formatMonth(months[0])} to ${formatMonth(months[months.length - 1])}`

  const employeeName = data.length ? resolveEmployeeName(data[0]) : null
  const title = employeeName ? `${employeeName} (${employeeId})` : employeeId
  const fileName = downloadFileName("payslips", employeeId, months, "pdf")

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
          title={`${title} - Payslips`}
          description={monthRange ? `Pay Period: ${monthRange}` : "Employee Payroll Report"}
          fileName={fileName}
          renderDocument={() => <EmployeePayrollPDF data={data} title={title} />}
        />
      )}
    </>
  )
}

"use client"

import { Document } from "@react-pdf/renderer"
import { useState } from "react"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SalarySlipPDFPage, payrollRecordToSalarySlip } from "@/components/pdf/salary-slip-pdf"
import { BRAND } from "@/components/pdf/brand"
import { PdfPreviewDialog } from "@/components/pdf/pdf-preview-dialog"
import { downloadFileName } from "@/lib/filenames"
import { formatMonth } from "@/lib/labels"
import { resolveEmployeeName, type PayslipSourceRecord } from "@/utils/payroll-export"

interface SingleEmployeePayslipButtonProps {
  record: PayslipSourceRecord
  clientName: string
  month: string
}

export const SingleEmployeePayslipButton = ({
  record,
  clientName,
  month,
}: SingleEmployeePayslipButtonProps): JSX.Element => {
  const [open, setOpen] = useState(false)

  const source: PayslipSourceRecord = { ...record, month: record.month || month }
  const employeeName = resolveEmployeeName(source)
  const slip = payrollRecordToSalarySlip(source, clientName)
  const zeroPay = slip.net_pay <= 0
  const fileName = downloadFileName("payslip", record.employeeId, source.month, "pdf")

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className={`h-8 gap-1.5 ${zeroPay ? "text-warning hover:text-warning" : ""}`}
        title={zeroPay ? "Net pay is ₹0. Check attendance before sharing this slip." : undefined}
      >
        <FileText className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">{zeroPay ? "₹0 payslip" : "Payslip"}</span>
      </Button>

      {open && (
        <PdfPreviewDialog
          open={open}
          onOpenChange={setOpen}
          title={`Payslip - ${employeeName ?? record.employeeId}`}
          description={`${clientName} · ${formatMonth(source.month)}${zeroPay ? " · Net pay is ₹0" : ""}`}
          fileName={fileName}
          renderDocument={() => (
            <Document
              title={`Payslip ${record.employeeId} ${source.month}`}
              author={BRAND.name}
              subject="Employee Payslip"
              keywords="Tulsyan Security Services, Payslip"
            >
              <SalarySlipPDFPage data={slip} />
            </Document>
          )}
        />
      )}
    </>
  )
}

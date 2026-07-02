"use client"

import { Document } from "@react-pdf/renderer"
import { useState } from "react"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SalarySlipPDFPage } from "@/components/pdf/salary-slip-pdf"
import { BRAND } from "@/components/pdf/brand"
import { PdfPreviewDialog } from "@/components/pdf/pdf-preview-dialog"
import { clientRecordToSalarySlip, type PayslipSourceRecord } from "./client-payroll-pdf"

function getCurrentDateTime(): string {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, "-").slice(0, 19)
}

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

  const employeeName = record.employee
    ? `${record.employee.firstName} ${record.employee.lastName}`.trim()
    : record.salaryData?.information?.employeeName ?? record.employeeId
  const fileName = `Payslip_${record.employeeId}_${month}_${getCurrentDateTime()}.pdf`

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="h-8 gap-1.5">
        <FileText className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">Payslip</span>
      </Button>

      {open && (
        <PdfPreviewDialog
          open={open}
          onOpenChange={setOpen}
          title={`Payslip - ${employeeName}`}
          description={`${clientName} (${month})`}
          fileName={fileName}
          renderDocument={() => (
            <Document
              title={`Payslip ${record.employeeId} ${month}`}
              author={BRAND.name}
              subject="Employee Payslip"
              keywords="Tulsyan Security Services, Payslip"
            >
              <SalarySlipPDFPage data={clientRecordToSalarySlip(record, clientName, month)} />
            </Document>
          )}
        />
      )}
    </>
  )
}

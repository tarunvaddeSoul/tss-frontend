import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { employeeName, formatDate, formatMonth, humanize, isPlaceholder, label } from "@/lib/labels"

export interface PayrollReportRecord {
  id: string
  employeeId: string
  clientName: string | null
  clientId: string
  month: string
  salaryData: Record<string, any>
  status?: string | null
  finalizedAt?: string | null
  employee?: { title?: string | null; firstName: string; lastName: string; fatherName?: string | null } | null
  createdAt: string
  updatedAt: string
}

export interface PayslipSourceRecord {
  employeeId: string
  month: string
  clientName?: string | null
  salaryData: Record<string, any> | null | undefined
  employee?: { title?: string | null; firstName: string; lastName: string; fatherName?: string | null } | null
}

export function resolveEmployeeName(record: PayslipSourceRecord): string | null {
  const salaryData = record.salaryData ?? {}
  const stored = salaryData.information?.employeeName ?? salaryData.employeeName
  if (stored && !isPlaceholder(String(stored))) {
    const cleaned = String(stored).split(/\s+/).filter((word) => !isPlaceholder(word)).join(" ")
    if (cleaned) return cleaned
  }
  const fromEmployee = employeeName(record.employee)
  return fromEmployee === "-" ? null : fromEmployee
}

const INR_FORMAT = '[>=10000000]"₹"##\\,##\\,##\\,##0.00;[>=100000]"₹"##\\,##\\,##0.00;"₹"#,##0.00'
const MONEY_COLUMNS = new Set([
  "Rate (Per Day/Month)",
  "Basic Pay",
  "Monthly Pay",
  "Gross Salary",
  "Net Salary",
  "PF",
  "ESIC",
  "LWF",
  "Advance Taken",
  "Bonus",
  "Total Deductions",
])

function applyMoneyFormat(worksheet: XLSX.WorkSheet, headers: string[], rowCount: number): void {
  headers.forEach((header, col) => {
    if (!MONEY_COLUMNS.has(header)) return
    for (let row = 1; row <= rowCount; row += 1) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })]
      if (cell && typeof cell.v === "number") cell.z = INR_FORMAT
    }
  })
}

export function exportPayrollToExcel(
  data: PayrollReportRecord[],
  fileName: string,
): { success: true; fileName: string } | { success: false; error: string } {
  try {
    const excelData = data.map((record) => {
      const salaryData = record.salaryData as any
      const calculations = salaryData?.calculations || {}
      const deductions = salaryData?.deductions || {}
      const allowances = salaryData?.allowances || {}
      const information = salaryData?.information || {}

      const basicPay = calculations?.basicPay ?? salaryData?.basicPay ?? 0
      const grossSalary = calculations?.grossSalary ?? salaryData?.grossSalary ?? 0
      const netSalary = calculations?.netSalary ?? salaryData?.netSalary ?? 0
      const pf = deductions?.pf ?? salaryData?.pf ?? 0
      const esic = deductions?.esic ?? salaryData?.esic ?? 0
      const lwf = deductions?.lwf ?? salaryData?.lwf ?? 0
      const advanceTaken = deductions?.advanceTaken ?? salaryData?.advanceTaken ?? 0
      const totalDeductions = deductions?.totalDeductions ?? salaryData?.totalDeductions ?? 0
      const bonus = allowances?.bonus ?? salaryData?.bonus ?? 0
      const dutyDone = calculations?.dutyDone ?? salaryData?.dutyDone ?? 0
      const basicDuty = calculations?.basicDuty ?? salaryData?.basicDuty ?? 0
      const monthlyPay = information?.monthlyPay ?? salaryData?.monthlyPay ?? 0
      const rate = calculations?.rate ?? calculations?.wagesPerDay ?? salaryData?.rate ?? salaryData?.wagesPerDay ?? 0

      return {
        "Employee ID": record.employeeId,
        "Employee Name": resolveEmployeeName(record) ?? "-",
        Client: record.clientName || information?.clientName || "-",
        Month: formatMonth(record.month),
        Status: label.status(record.status),
        "Finalized On": formatDate(record.finalizedAt),
        "Salary Category": label.salaryCategory(information?.salaryCategory ?? salaryData?.salaryCategory),
        "Salary Sub-Category": label.salarySubCategory(information?.salarySubCategory ?? salaryData?.salarySubCategory),
        "Rate (Per Day/Month)": rate,
        "Basic Duty": basicDuty,
        "Duty Done": dutyDone,
        "Basic Pay": basicPay,
        "Monthly Pay": monthlyPay,
        "Gross Salary": grossSalary,
        "Net Salary": netSalary,
        PF: pf,
        ESIC: esic,
        LWF: lwf,
        "Advance Taken": advanceTaken,
        Bonus: bonus,
        "Total Deductions": totalDeductions,
        Designation: humanize(information?.designation ?? salaryData?.designation),
        Department: humanize(information?.department ?? salaryData?.department),
        "Created At": formatDate(record.createdAt),
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()

    const headers = excelData.length ? Object.keys(excelData[0]) : []
    applyMoneyFormat(worksheet, headers, excelData.length)

    worksheet["!cols"] = [
      { wch: 14 }, // Employee ID
      { wch: 24 }, // Employee Name
      { wch: 28 }, // Client
      { wch: 10 }, // Month
      { wch: 10 }, // Status
      { wch: 13 }, // Finalized On
      { wch: 14 }, // Salary Category
      { wch: 18 }, // Salary Sub-Category
      { wch: 16 }, // Rate
      { wch: 10 }, // Basic Duty
      { wch: 10 }, // Duty Done
      { wch: 14 }, // Basic Pay
      { wch: 14 }, // Monthly Pay
      { wch: 14 }, // Gross Salary
      { wch: 14 }, // Net Salary
      { wch: 12 }, // PF
      { wch: 12 }, // ESIC
      { wch: 10 }, // LWF
      { wch: 14 }, // Advance Taken
      { wch: 12 }, // Bonus
      { wch: 16 }, // Total Deductions
      { wch: 20 }, // Designation
      { wch: 20 }, // Department
      { wch: 13 }, // Created At
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Report")

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    saveAs(blob, fileName)

    return { success: true, fileName }
  } catch (error) {
    console.error("Excel export error:", error)
    return { success: false, error: "Failed to generate Excel file" }
  }
}

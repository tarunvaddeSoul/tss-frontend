import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

export interface PayrollReportRecord {
  id: string
  employeeId: string
  companyName: string | null
  companyId: string
  month: string
  salaryData: Record<string, any>
  createdAt: string
  updatedAt: string
}

export function getCurrentDateTime(): string {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, "-").slice(0, 19)
}

export function exportPayrollToExcel(data: PayrollReportRecord[], filename: string) {
  try {
    // Transform data for Excel export
    const excelData = data.map((record) => ({
      "Employee ID": record.employeeId,
      Company: record.companyName || "N/A",
      Month: record.month,
      "Basic Pay": record.salaryData.basicPay || 0,
      "Monthly Pay": record.salaryData.monthlyPay || 0,
      "Gross Salary": record.salaryData.grossSalary || 0,
      "Net Salary": record.salaryData.netSalary || 0,
      PF: record.salaryData.pf || 0,
      ESIC: record.salaryData.esic || 0,
      LWF: record.salaryData.lwf || 0,
      Bonus: record.salaryData.bonus || 0,
      "Attendance Bonus": record.salaryData.attendanceBonus || 0,
      "Total Deductions": record.salaryData.totalDeductions || 0,
      "Duty Done": record.salaryData.dutyDone || 0,
      "Basic Duty": record.salaryData.basicDuty || 0,
      "Created At": new Date(record.createdAt).toLocaleDateString(),
    }))

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()

    // Set column widths for better readability
    const columnWidths = [
      { wch: 15 }, // Employee ID
      { wch: 20 }, // Company
      { wch: 12 }, // Month
      { wch: 12 }, // Basic Pay
      { wch: 12 }, // Monthly Pay
      { wch: 12 }, // Gross Salary
      { wch: 12 }, // Net Salary
      { wch: 10 }, // PF
      { wch: 10 }, // ESIC
      { wch: 10 }, // LWF
      { wch: 10 }, // Bonus
      { wch: 15 }, // Attendance Bonus
      { wch: 15 }, // Total Deductions
      { wch: 12 }, // Duty Done
      { wch: 12 }, // Basic Duty
      { wch: 15 }, // Created At
    ]
    worksheet["!cols"] = columnWidths

    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Report")

    // Generate Excel file and download
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    const fileName = `${filename}_${getCurrentDateTime()}.xlsx`
    saveAs(blob, fileName)

    return { success: true, fileName }
  } catch (error) {
    console.error("Excel export error:", error)
    return { success: false, error: "Failed to generate Excel file" }
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

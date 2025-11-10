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
    // Transform data for Excel export using grouped salary structure
    const excelData = data.map((record) => {
      const salaryData = record.salaryData as any
      // Access grouped salary data with fallbacks
      const calculations = salaryData?.calculations || {}
      const deductions = salaryData?.deductions || {}
      const allowances = salaryData?.allowances || {}
      const information = salaryData?.information || {}
      
      // Get all values with proper fallbacks
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
        Company: record.companyName || information?.companyName || "N/A",
        Month: record.month,
        "Salary Category": salaryData?.salaryCategory || "N/A",
        "Salary Sub-Category": salaryData?.salarySubCategory || "N/A",
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
        "Designation": information?.designation || salaryData?.designation || "N/A",
        "Employee Name": information?.employeeName || "N/A",
        "Created At": new Date(record.createdAt).toLocaleDateString(),
      }
    })

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()

    // Set column widths for better readability
    const columnWidths = [
      { wch: 15 }, // Employee ID
      { wch: 20 }, // Company
      { wch: 12 }, // Month
      { wch: 18 }, // Salary Category
      { wch: 20 }, // Salary Sub-Category
      { wch: 18 }, // Rate (Per Day/Month)
      { wch: 12 }, // Basic Duty
      { wch: 12 }, // Duty Done
      { wch: 12 }, // Basic Pay
      { wch: 12 }, // Monthly Pay
      { wch: 12 }, // Gross Salary
      { wch: 12 }, // Net Salary
      { wch: 10 }, // PF
      { wch: 10 }, // ESIC
      { wch: 10 }, // LWF
      { wch: 15 }, // Advance Taken
      { wch: 10 }, // Bonus
      { wch: 15 }, // Total Deductions
      { wch: 15 }, // Designation
      { wch: 20 }, // Employee Name
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

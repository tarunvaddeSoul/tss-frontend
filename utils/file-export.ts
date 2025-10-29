import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import type { CompanyPayrollMonth } from "@/types/payroll"

function getCurrentDateTime(): string {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, "-").slice(0, 19)
}

export function exportCompanyPayrollToExcel(data: CompanyPayrollMonth[], companyName: string) {
  try {
    // Transform data for Excel export - flatten all months and records
    const excelData: any[] = []

    data.forEach((month) => {
      month.records.forEach((record) => {
        excelData.push({
          Month: month.month,
          "Employee ID": record.employeeId,
          "Employee Name": record.employee
            ? `${record.employee.firstName} ${record.employee.lastName}`
            : record.employeeId,
          Company: companyName || "N/A",
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
        })
      })
    })

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()

    // Set column widths for better readability
    const columnWidths = [
      { wch: 12 }, // Month
      { wch: 15 }, // Employee ID
      { wch: 20 }, // Employee Name
      { wch: 20 }, // Company
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

    XLSX.utils.book_append_sheet(workbook, worksheet, "Company Payroll")

    // Generate Excel file and download
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    const fileName = `${companyName.replace(/\s+/g, "_")}_Payroll_${getCurrentDateTime()}.xlsx`
    saveAs(blob, fileName)

    return { success: true, fileName }
  } catch (error) {
    console.error("Excel export error:", error)
    throw new Error("Failed to generate Excel file")
  }
}


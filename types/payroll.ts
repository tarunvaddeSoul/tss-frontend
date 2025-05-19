export interface Payroll {
  id: string
  employeeId: string
  employeeName?: string
  month: number
  year: number
  basicSalary: number
  overtime?: number
  deductions?: number
  bonus?: number
  netSalary: number
  status: "PENDING" | "PAID" | "CANCELLED"
  paymentDate?: string
  paymentMethod?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

import api from "./api"
import { authService } from "./auth"
import { employeeService } from "./employeeService"
import { companyService } from "./companyService"
import { attendanceService } from "./attendanceService"
import { payrollService } from "./payrollService"
import { dashboardService } from "./dashboardService"
import { departmentService } from "./departmentService"
import { designationService } from "./designationService"

export const services = {
  api,
  auth: authService,
  employees: employeeService,
  companies: companyService,
  attendance: attendanceService,
  payroll: payrollService,
  dashboard: dashboardService,
  departments: departmentService,
  designations: designationService,
}
  
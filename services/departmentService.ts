import api from "./api"
import { handleApiError } from "@/utils"

export interface Department {
  id: string
  name: string
}

export interface DepartmentResponse {
  statusCode: number
  message: string
  data: Department[]
}

const DEPARTMENT_ENDPOINTS = {
  USER: "/departments/user-departments",
  EMPLOYEE: "/departments/employee-departments",
}

export const departmentService = {
  async getUserDepartments(): Promise<Department[]> {
    try {
      const response = await api.get<DepartmentResponse>(DEPARTMENT_ENDPOINTS.USER)
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async getEmployeeDepartments(): Promise<Department[]> {
    try {
      const response = await api.get<DepartmentResponse>(DEPARTMENT_ENDPOINTS.EMPLOYEE)
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
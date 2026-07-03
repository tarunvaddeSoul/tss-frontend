import api from "./api"
import { handleApiError } from "@/utils"

export interface Department {
  id: string
  name: string
}

export type DepartmentListResponse = Department[]

export interface DepartmentResponse {
  data: Department
}

const DEPARTMENT_ENDPOINTS = {
  USER: {
    GET_ALL: "/departments/user-departments",
    ADD: (name: string) => `/departments/user-department/${encodeURIComponent(name)}`,
    DELETE: (name: string) => `/departments/user-department/${encodeURIComponent(name)}`,
  },
  EMPLOYEE: {
    GET_ALL: "/departments/employee-departments",
    ADD: (name: string) => `/departments/employee-department/${encodeURIComponent(name)}`,
    DELETE: (name: string) => `/departments/employee-department/${encodeURIComponent(name)}`,
  },
}

export const departmentService = {
  // User Department Methods
  async getUserDepartments(): Promise<Department[]> {
    try {
      const response = await api.get(DEPARTMENT_ENDPOINTS.USER.GET_ALL)
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async addUserDepartment(name: string): Promise<Department> {
    try {
      const response = await api.post<DepartmentResponse>(DEPARTMENT_ENDPOINTS.USER.ADD(name))
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async deleteUserDepartment(name: string): Promise<void> {
    try {
      await api.delete(DEPARTMENT_ENDPOINTS.USER.DELETE(name))
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Employee Department Methods
  async getEmployeeDepartments(): Promise<Department[]> {
    try {
      const response = await api.get(DEPARTMENT_ENDPOINTS.EMPLOYEE.GET_ALL)
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async addEmployeeDepartment(name: string): Promise<Department> {
    try {
      const response = await api.post<DepartmentResponse>(DEPARTMENT_ENDPOINTS.EMPLOYEE.ADD(name))
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async deleteEmployeeDepartment(name: string): Promise<void> {
    try {
      await api.delete(DEPARTMENT_ENDPOINTS.EMPLOYEE.DELETE(name))
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
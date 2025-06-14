import api from "./api"
import { handleApiError } from "@/utils"

export interface Designation {
  id: string
  name: string
}

export interface DesignationResponse {
  statusCode: number
  message: string
  data: Designation | Designation[]
}

const DESIGNATION_ENDPOINTS = {
  BASE: "/designations",
  BY_ID: (id: string) => `/designations/${id}`,
  BY_NAME: (name: string) => `/designations/name/${name}`,
}

export const designationService = {
  async getDesignations(): Promise<Designation[]> {
    try {
      const response = await api.get<DesignationResponse>(DESIGNATION_ENDPOINTS.BASE)
      return response.data.data as Designation[]
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async getDesignationById(id: string): Promise<Designation> {
    try {
      const response = await api.get<DesignationResponse>(DESIGNATION_ENDPOINTS.BY_ID(id))
      return response.data.data as Designation
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async getDesignationByName(name: string): Promise<Designation> {
    try {
      const response = await api.get<DesignationResponse>(DESIGNATION_ENDPOINTS.BY_NAME(name))
      return response.data.data as Designation
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async createDesignation(name: string): Promise<Designation> {
    try {
      const response = await api.post<DesignationResponse>(DESIGNATION_ENDPOINTS.BASE, { name })
      return response.data.data as Designation
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async deleteDesignationById(id: string): Promise<void> {
    try {
      await api.delete(DESIGNATION_ENDPOINTS.BY_ID(id))
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async deleteDesignationByName(name: string): Promise<void> {
    try {
      await api.delete(DESIGNATION_ENDPOINTS.BY_NAME(name))
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
import api from "./api"
import { handleApiError } from "@/utils"

export interface ServiceType {
  id: string
  name: string
}

const SERVICE_TYPE_ENDPOINTS = {
  BASE: "/service-types",
  BY_ID: (id: string) => `/service-types/${id}`,
}

export const serviceTypeService = {
  async getServiceTypes(): Promise<ServiceType[]> {
    try {
      const response = await api.get(SERVICE_TYPE_ENDPOINTS.BASE)
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async createServiceType(name: string): Promise<ServiceType> {
    try {
      const response = await api.post(SERVICE_TYPE_ENDPOINTS.BASE, { name })
      return response.data.data as ServiceType
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async updateServiceType(id: string, name: string): Promise<ServiceType> {
    try {
      const response = await api.patch(SERVICE_TYPE_ENDPOINTS.BY_ID(id), { name })
      return response.data.data as ServiceType
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async deleteServiceType(id: string): Promise<void> {
    try {
      await api.delete(SERVICE_TYPE_ENDPOINTS.BY_ID(id))
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}

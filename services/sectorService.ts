import api from "./api"
import { handleApiError } from "@/utils"

export interface Sector {
  id: string
  name: string
}

const SECTOR_ENDPOINTS = {
  BASE: "/sectors",
  BY_ID: (id: string) => `/sectors/${id}`,
}

export const sectorService = {
  async getSectors(): Promise<Sector[]> {
    try {
      const response = await api.get(SECTOR_ENDPOINTS.BASE)
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async createSector(name: string): Promise<Sector> {
    try {
      const response = await api.post(SECTOR_ENDPOINTS.BASE, { name })
      return response.data.data as Sector
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async updateSector(id: string, name: string): Promise<Sector> {
    try {
      const response = await api.patch(SECTOR_ENDPOINTS.BY_ID(id), { name })
      return response.data.data as Sector
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async deleteSector(id: string): Promise<void> {
    try {
      await api.delete(SECTOR_ENDPOINTS.BY_ID(id))
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}

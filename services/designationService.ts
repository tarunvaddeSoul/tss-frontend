import api from "./api"
import { handleApiError } from "@/utils"

export interface Designation {
  id: string
  name: string
}

export interface DesignationResponse {
  statusCode: number
  message: string
  data: Designation[]
}

const DESIGNATION_ENDPOINT = "/designation"

export const designationService = {
  async getDesignations(): Promise<Designation[]> {
    try {
      const response = await api.get<DesignationResponse>(DESIGNATION_ENDPOINT)
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
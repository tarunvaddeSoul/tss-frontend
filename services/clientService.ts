import api from "./api"
import { handleApiError } from "@/utils"
import type {
  Client,
  ClientResponse,
  ClientsResponse,
  ClientSearchParams,
  ClientEmployeeCountResponse,
  ClientEmployeesResponse,
} from "@/types/client"

const CLIENT_ENDPOINTS = {
  BASE: "/clients",
  BY_ID: (id: string) => `/clients/${id}`,
  EMPLOYEE_COUNT: "/clients/employee-count",
  CLIENT_EMPLOYEES: (clientId: string) => `/clients/${clientId}/employees`,
}

export const clientService = {
  // Get all clients with pagination and search
  async getClients(params?: ClientSearchParams): Promise<ClientsResponse> {
    try {
      const response = await api.get<{ data?: Client[]; meta?: { total?: number } }>(CLIENT_ENDPOINTS.BASE, {
        params,
      })
      const clients = response.data.data ?? []
      const total = response.data.meta?.total ?? clients.length
      return { data: { clients, total } }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Every client, for pickers. Pages through the API so the default page size never truncates the list.
  async getAllClients(params: Pick<ClientSearchParams, "status"> = {}): Promise<Client[]> {
    const pageSize = 100
    const all: Client[] = []
    let page = 1
    while (true) {
      const response = await api.get<{ data?: Client[]; meta?: { total?: number } }>(CLIENT_ENDPOINTS.BASE, {
        params: { ...params, page, limit: pageSize, sortBy: "name", sortOrder: "asc" },
      })
      const batch = response.data.data ?? []
      all.push(...batch)
      const total = response.data.meta?.total ?? all.length
      if (batch.length < pageSize || all.length >= total) break
      page += 1
    }
    return all
  },

  // Get a single client by ID
  async getClientById(id: string): Promise<ClientResponse> {
    try {
      const response = await api.get<ClientResponse>(CLIENT_ENDPOINTS.BY_ID(id))
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Create a new client
  async createClient(clientData: Client): Promise<ClientResponse> {
    try {
      const response = await api.post<ClientResponse>(CLIENT_ENDPOINTS.BASE, clientData)
      if (!response.data) {
        throw new Error("Failed to create client")
      }
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Update an existing client
  async updateClient(id: string, clientData: Partial<Client>): Promise<ClientResponse> {
    try {
      const response = await api.put<ClientResponse>(CLIENT_ENDPOINTS.BY_ID(id), clientData)
      if (!response.data.data) {
        throw new Error("Failed to update client")
      }
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Delete a client
  async deleteClient(id: string): Promise<void> {
    try {
      await api.delete(CLIENT_ENDPOINTS.BY_ID(id))
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get employee count for clients
  async getClientEmployeeCounts(): Promise<any[]> {
    try {
      const response = await api.get<ClientEmployeeCountResponse>(CLIENT_ENDPOINTS.EMPLOYEE_COUNT)
      return response.data.data || []
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get employees in a client
  async getClientEmployees(clientId: string): Promise<ClientEmployeesResponse> {
    try {
      const response = await api.get<ClientEmployeesResponse>(CLIENT_ENDPOINTS.CLIENT_EMPLOYEES(clientId))
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}

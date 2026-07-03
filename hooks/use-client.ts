"use client"

import { useState, useEffect } from "react"
import { clientService } from "@/services/clientService"
import { getErrorMessage } from "@/services/api"
import type { Client, SalaryTemplateConfig } from "@/types/client"

export function useClient(clientId?: string) {
  const [client, setClient] = useState<Client | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [data, setData] = useState<{ clients: Client[] } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Only fetch if we have a clientId
    if (clientId) {
      fetchClient(clientId)
    }
    if (!clientId) {
      fetchClients()
    }
  }, [clientId])

  const fetchClient = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await clientService.getClientById(id)
      if (response.data) {
        setClient(response.data)
      } else {
        throw new Error("Client not found")
      }
    } catch (err) {
      console.error("Error fetching client:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch client"))
    } finally {
      setIsLoading(false)
    }
  }

  const saveSalaryTemplateConfig = async (templateConfig: SalaryTemplateConfig) => {
    if (!clientId || !client) {
      throw new Error("Client not found")
    }

    try {
      setIsSaving(true)
      setError(null)

      // Create updated client data with new salary template config
      const updatedClient: Partial<Client> = {
        salaryTemplates: templateConfig,
      }

      const response = await clientService.updateClient(clientId, updatedClient)

      if (response.data) {
        setClient(response.data)
        return response.data
      } else {
        throw new Error("Failed to update client salary template configuration")
      }
    } catch (err: any) {
      console.error("Error saving salary template config:", err)
      setError(new Error(getErrorMessage(err)))
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  const updateClient = async (data: Partial<Client>) => {
    if (!clientId) {
      throw new Error("Client ID is required")
    }

    try {
      setIsSaving(true)
      setError(null)

      const response = await clientService.updateClient(clientId, data)

      if (response.data) {
        setClient(response.data)
        return response.data
      } else {
        throw new Error("Failed to update client")
      }
    } catch (err) {
      console.error("Error updating client:", err)
      setError(err instanceof Error ? err : new Error("Failed to update client"))
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  const refreshClient = async () => {
    if (clientId) {
      await fetchClient(clientId)
    }
  }

  const clearError = () => {
    setError(null)
  }

  // Helper function to get enabled salary template fields count
  const getEnabledFieldsCount = () => {
    if (!client?.salaryTemplates) return 0

    const { mandatoryFields = [], optionalFields = [], customFields = [] } = client.salaryTemplates

    return [...mandatoryFields, ...optionalFields, ...customFields].filter((field) => field.enabled).length
  }

  // Helper function to check if salary template is configured
  const isSalaryTemplateConfigured = () => {
    if (!client?.salaryTemplates) return false

    const { mandatoryFields = [], optionalFields = [], customFields = [] } = client.salaryTemplates

    return [...mandatoryFields, ...optionalFields, ...customFields].length > 0
  }

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await clientService.getClients({ limit: 1000 })

      setData(response.data ? { clients: response.data.clients } : null)
      setClients(response.data ? response.data.clients : [])
    } catch (err) {
      console.error("Error fetching clients:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch clients"))
    } finally {
      setIsLoading(false)
    }
  }

  return {
    client,
    clients,
    data,
    isLoading,
    isSaving,
    error,
    fetchClient,
    fetchClients,
    saveSalaryTemplateConfig,
    updateClient,
    refreshClient,
    clearError,
    getEnabledFieldsCount,
    isSalaryTemplateConfigured,
    // Deprecated - keeping for backward compatibility but marked as deprecated
    /** @deprecated Use saveSalaryTemplateConfig instead */
    saveTemplates: saveSalaryTemplateConfig,
  }
}

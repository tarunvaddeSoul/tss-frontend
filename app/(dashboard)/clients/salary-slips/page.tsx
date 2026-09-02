"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Loader } from "@/components/ui/loader"
import { PageHeader } from "@/components/layout/page-header"
import { ClientSalarySetup } from "@/components/clients/client-salary-setup"
import { SalarySlipPreview } from "@/components/clients/salary-slip-preview"
import { clientService } from "@/services/clientService"
import { getErrorMessage } from "@/services/api"
import {
  convertSalaryTemplatesToConfig,
  getDefaultSalaryTemplateConfig,
  sanitizeSalaryTemplateConfigForSubmit,
  type Client,
  type SalaryTemplateConfig,
} from "@/types/client"

function SalarySlipsContent(): JSX.Element {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlClientId = searchParams.get("clientId") ?? ""

  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [selectedClientId, setSelectedClientId] = useState(urlClientId)
  const [config, setConfig] = useState<SalaryTemplateConfig | null>(null)
  const [loadingConfig, setLoadingConfig] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await clientService.getClients({ page: 1, limit: 100 })
        const list = (response.data as any)?.clients ?? response.data ?? []
        setClients(list)
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: getErrorMessage(error) })
      } finally {
        setLoadingClients(false)
      }
    }
    fetchClients()
  }, [])

  const loadSeq = useRef(0)
  const loadConfig = useCallback(async (clientId: string) => {
    // Guard against out-of-order responses when the user switches clients quickly,
    // so client A's template can never be saved onto client B.
    const seq = ++loadSeq.current
    setLoadingConfig(true)
    setConfig(null)
    setIsDirty(false)
    try {
      const response = await clientService.getClientById(clientId)
      if (seq !== loadSeq.current) return
      const client = response.data as any
      const converted = Array.isArray(client?.salaryTemplates)
        ? convertSalaryTemplatesToConfig(client.salaryTemplates)
        : (client?.salaryTemplates ?? null)
      setConfig(converted ?? getDefaultSalaryTemplateConfig())
    } catch (error) {
      if (seq !== loadSeq.current) return
      toast({ variant: "destructive", title: "Error", description: getErrorMessage(error) })
    } finally {
      if (seq === loadSeq.current) setLoadingConfig(false)
    }
  }, [])

  useEffect(() => {
    if (selectedClientId) loadConfig(selectedClientId)
  }, [selectedClientId, loadConfig])

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId)
    router.replace(clientId ? `/clients/salary-slips?clientId=${clientId}` : "/clients/salary-slips")
  }

  const handleConfigChange = (next: SalaryTemplateConfig) => {
    setConfig(next)
    setIsDirty(true)
  }

  const handleSave = async () => {
    if (!selectedClientId || !config) return
    setIsSaving(true)
    try {
      await clientService.updateClient(selectedClientId, {
        salaryTemplates: sanitizeSalaryTemplateConfigForSubmit(config),
      })
      setIsDirty(false)
      toast({ title: "Saved", description: "Salary slip template updated." })
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: getErrorMessage(error) })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        no="05"
        eyebrow="Client register"
        title="Salary Slips"
        description="Edit and preview the salary slip template for each client"
      />

      <Card>
        <CardHeader>
          <CardTitle>Client</CardTitle>
          <CardDescription>Pick the client whose salary slip you want to work on</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xl">
            <Combobox
              options={clients.map((client) => ({ value: client.id ?? "", label: client.name }))}
              value={selectedClientId}
              onChange={handleClientChange}
              placeholder={loadingClients ? "Loading clients..." : "Select a client"}
              searchPlaceholder="Search clients..."
              emptyText="No clients found."
              disabled={loadingClients}
            />
          </div>
        </CardContent>
      </Card>

      {selectedClientId && (
        loadingConfig ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !config ? (
          <div className="rounded-md border border-dashed py-16 text-center">
            <p className="text-sm text-muted-foreground">Could not load this client's salary slip.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => loadConfig(selectedClientId)}>
              Try again
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="edit" className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <Button onClick={handleSave} disabled={!isDirty || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isDirty ? "Save Changes" : "Saved"}
                  </>
                )}
              </Button>
            </div>

            <TabsContent value="edit" className="pt-4">
              <ClientSalarySetup config={config} onChange={handleConfigChange} />
            </TabsContent>

            <TabsContent value="preview" className="pt-4">
              <SalarySlipPreview config={config} />
            </TabsContent>
          </Tabs>
        )
      )}

      {!selectedClientId && !loadingClients && (
        <div className="rounded-md border border-dashed py-16 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">No client selected</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Select a client above to edit or preview its salary slip.
          </p>
        </div>
      )}
    </div>
  )
}

export default function SalarySlipsPage(): JSX.Element {
  return (
    <Suspense fallback={<Loader text="Loading salary slips..." size="lg" fullPage />}>
      <SalarySlipsContent />
    </Suspense>
  )
}

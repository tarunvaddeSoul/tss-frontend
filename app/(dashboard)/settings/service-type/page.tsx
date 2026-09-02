"use client"

import { ShieldCheck } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { LookupManager } from "@/components/settings/lookup-manager"
import { serviceTypeService } from "@/services/serviceTypeService"

export default function ServiceTypeSettingsPage(): JSX.Element {
  return (
    <div>
      <PageHeader
        no="06"
        eyebrow="Settings register"
        title="Service Types"
        description="Manage the services TSS offers to clients."
      />

      <LookupManager
        noun="service type"
        pluralTitle="Service Types"
        description="Security, housekeeping, facility management and more"
        icon={ShieldCheck}
        fetchAll={serviceTypeService.getServiceTypes}
        create={serviceTypeService.createServiceType}
        update={serviceTypeService.updateServiceType}
        remove={serviceTypeService.deleteServiceType}
      />
    </div>
  )
}

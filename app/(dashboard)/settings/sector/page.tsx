"use client"

import { Factory } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { LookupManager } from "@/components/settings/lookup-manager"
import { sectorService } from "@/services/sectorService"

export default function SectorSettingsPage(): JSX.Element {
  return (
    <div>
      <PageHeader
        no="06"
        eyebrow="Settings register"
        title="Sectors"
        description="Manage the industry sectors clients operate in."
      />

      <LookupManager
        noun="sector"
        pluralTitle="Sectors"
        description="Banking, manufacturing, healthcare and more"
        icon={Factory}
        fetchAll={sectorService.getSectors}
        create={sectorService.createSector}
        update={sectorService.updateSector}
        remove={sectorService.deleteSector}
      />
    </div>
  )
}

"use client"

import { useState } from "react"
import { ChevronDown, Settings2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SalaryTemplateConfigForm } from "./salary-template-config-form"
import type { SalaryTemplateConfig } from "@/types/client"

// The handful of client-specific choices that actually matter at onboarding.
// Everything else in the template is standard and lives under "Advanced".
const QUICK_TOGGLES: { key: string; title: string; description: string }[] = [
  { key: "pf", title: "Provident Fund (PF)", description: "Deduct 12% PF from eligible employees." },
  { key: "esic", title: "ESIC", description: "Deduct 0.75% ESIC for employees under the wage ceiling." },
  { key: "lwf", title: "Labour Welfare Fund (LWF)", description: "Deduct the periodic LWF contribution." },
  { key: "bonus", title: "Bonus", description: "Show a bonus line on the payslip. You enter the amount each month." },
  { key: "advanceTaken", title: "Salary advance", description: "Show an advance line so advances can be deducted when taken." },
]

function isFieldEnabled(config: SalaryTemplateConfig, key: string): boolean {
  const all = [
    ...(config.mandatoryFields ?? []),
    ...(config.optionalFields ?? []),
    ...(config.customFields ?? []),
  ]
  return all.find((f) => f.key === key)?.enabled ?? false
}

function setFieldEnabled(config: SalaryTemplateConfig, key: string, enabled: boolean): SalaryTemplateConfig {
  const update = (arr?: SalaryTemplateConfig["mandatoryFields"]) =>
    (arr ?? []).map((f) => (f.key === key ? { ...f, enabled } : f))
  return {
    mandatoryFields: update(config.mandatoryFields),
    optionalFields: update(config.optionalFields),
    customFields: update(config.customFields),
  }
}

interface ClientSalarySetupProps {
  config: SalaryTemplateConfig
  onChange: (config: SalaryTemplateConfig) => void
}

export function ClientSalarySetup({ config, onChange }: ClientSalarySetupProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [advancedKey, setAdvancedKey] = useState(0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Slip</CardTitle>
        <CardDescription>
          A standard salary slip is ready for this client. Turn the common deductions and allowances on or off below.
          Most clients keep the defaults.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {QUICK_TOGGLES.map((t) => (
          <label
            key={t.key}
            htmlFor={`salary-toggle-${t.key}`}
            className="flex items-start justify-between gap-4 rounded-lg border p-4 cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <div className="min-w-0">
              <p className="font-medium">{t.title}</p>
              <p className="text-sm text-muted-foreground">{t.description}</p>
            </div>
            <Switch
              id={`salary-toggle-${t.key}`}
              checked={isFieldEnabled(config, t.key)}
              onCheckedChange={(v) => onChange(setFieldEnabled(config, t.key, v))}
            />
          </label>
        ))}

        <Collapsible
          open={advancedOpen}
          onOpenChange={(open) => {
            setAdvancedOpen(open)
            if (open) setAdvancedKey((k) => k + 1)
          }}
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="mt-1 flex w-full items-center justify-between gap-3 rounded-lg border border-dashed p-4 text-left hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium">Advanced: customize salary slip fields</p>
                  <p className="text-sm text-muted-foreground">
                    Rename, add, or remove individual fields. Only needed for special cases.
                  </p>
                </div>
              </div>
              <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", advancedOpen && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <SalaryTemplateConfigForm key={advancedKey} initialConfig={config} onSave={onChange} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

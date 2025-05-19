"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCompany } from "@/hooks/use-company"
import { SalaryTemplateForm } from "@/components/companies/salary-template-form"
import { SalarySlipPreview } from "@/components/companies/salary-slip-preview"
import { Skeleton } from "@/components/ui/skeleton"

export default function SalaryTemplatesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const companyId = searchParams.get("id") // Changed from companyId to id to match the URL parameter

  const { company, isLoading, isSaving, saveTemplates } = useCompany(companyId || undefined)
  const { toast } = useToast()

  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (!companyId) {
      toast({
        title: "Missing company ID",
        description: "Please provide a company ID in the URL.",
        variant: "destructive",
      })
      router.push("/companies")
    }
  }, [companyId, router, toast])

  async function handleSaveTemplates(templates: any) {
    try {
      await saveTemplates(templates)
      toast({
        title: "Success",
        description: "Salary templates saved successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save salary templates.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <Skeleton key={j} className="h-24 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salary Templates</h1>
          <p className="text-muted-foreground">Configure salary template fields for {company?.name || "company"}</p>
        </div>
        <div className="flex gap-3">
          <Button variant={showPreview ? "default" : "outline"} onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/companies")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
        </div>
      </div>
      {company ? (
        <div className="space-y-6">
          <SalaryTemplateForm
            initialTemplates={company.salaryTemplates}
            onSave={handleSaveTemplates}
            isLoading={isSaving}
          />

          {showPreview && company.salaryTemplates && <SalarySlipPreview salaryTemplates={company.salaryTemplates} />}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Company Not Found</CardTitle>
            <CardDescription>
              The requested company could not be found or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/companies")}>Go Back to Companies</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

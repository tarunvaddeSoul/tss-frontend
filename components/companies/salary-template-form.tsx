"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalaryTemplateField } from "@/components/companies/salary-template-field"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { BasicDuty, type SalaryTemplates } from "@/types/company"

// Define the field groups for better organization
const fieldGroups = {
  basic: [
    { id: "name", label: "Name", type: "text" as const, required: true },
    { id: "fatherName", label: "Father's Name", type: "text" as const },
    { id: "companyName", label: "Company Name", type: "text" as const, required: true },
    { id: "designation", label: "Designation", type: "text" as const, required: true },
  ],
  salary: [
    { id: "monthlyRate", label: "Monthly Rate", type: "number" as const, required: true },
    {
      id: "basicDuty",
      label: "Basic Duty",
      type: "select" as const,
      options: Object.values(BasicDuty),
      required: true,
    },
    { id: "dutyDone", label: "Duty Done", type: "number" as const, required: true },
    { id: "wagesPerDay", label: "Wages Per Day", type: "number" as const, required: true },
    { id: "basicPay", label: "Basic Pay", type: "number" as const, required: true },
    { id: "epfWages", label: "EPF Wages", type: "number" as const },
  ],
  allowances: [
    { id: "otherAllowance", label: "Other Allowance", type: "number" as const },
    { id: "otherAllowanceRemark", label: "Other Allowance Remark", type: "text" as const },
    { id: "bonus", label: "Bonus", type: "number" as const },
    { id: "grossSalary", label: "Gross Salary", type: "number" as const, required: true },
  ],
  deductions: [
    { id: "pf", label: "PF", type: "number" as const },
    { id: "esic", label: "ESIC", type: "number" as const },
    { id: "advance", label: "Advance", type: "number" as const },
    { id: "uniform", label: "Uniform", type: "number" as const },
    { id: "advanceGivenBy", label: "Advance Given By", type: "text" as const },
    { id: "penalty", label: "Penalty", type: "number" as const },
    { id: "lwf", label: "LWF", type: "number" as const },
    { id: "otherDeductions", label: "Other Deductions", type: "number" as const },
    { id: "otherDeductionsRemark", label: "Other Deductions Remark", type: "text" as const },
    { id: "totalDeductions", label: "Total Deductions", type: "number" as const, required: true },
  ],
  final: [
    { id: "netSalary", label: "Net Salary", type: "number" as const, required: true },
    { id: "uanNumber", label: "UAN Number", type: "text" as const },
    { id: "pfPaidStatus", label: "PF Paid Status", type: "text" as const },
    { id: "esicNumber", label: "ESIC Number", type: "text" as const },
    { id: "esicFilingStatus", label: "ESIC Filing Status", type: "text" as const },
  ],
}

// Create a flat array of all fields for validation
const allFields = [
  ...fieldGroups.basic,
  ...fieldGroups.salary,
  ...fieldGroups.allowances,
  ...fieldGroups.deductions,
  ...fieldGroups.final,
]

// Create a dynamic schema based on enabled fields
const createSalaryTemplateSchema = (enabledFields: Record<string, boolean>) => {
  const schemaFields: Record<string, any> = {}

  allFields.forEach((field) => {
    if (enabledFields[field.id]) {
      let fieldSchema

      if (field.type === "number") {
        fieldSchema = field.required
          ? z
              .string()
              .min(1, `${field.label} is required`)
              .transform((val) => (val === "" ? undefined : Number(val)))
          : z
              .string()
              .optional()
              .transform((val) => (val === "" ? undefined : Number(val)))
      } else {
        fieldSchema = field.required ? z.string().min(1, `${field.label} is required`) : z.string().optional()
      }

      schemaFields[field.id] = fieldSchema
    }
  })

  return z.object(schemaFields)
}

interface SalaryTemplateFormProps {
  initialTemplates?: SalaryTemplates
  onSave: (templates: SalaryTemplates) => void
  isLoading?: boolean
}

export function SalaryTemplateForm({ initialTemplates, onSave, isLoading = false }: SalaryTemplateFormProps) {
  // Initialize enabled state from initialTemplates or default all to false
  const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>(() => {
    const enabled: Record<string, boolean> = {}

    if (initialTemplates) {
      Object.entries(initialTemplates).forEach(([key, field]) => {
        enabled[key] = field.enabled
      })
    } else {
      // Default required fields to enabled
      allFields.forEach((field) => {
        enabled[field.id] = field.required || false
      })
    }

    return enabled
  })

  // Create initial values object from initialTemplates
  const initialValues = (() => {
    const values: Record<string, any> = {}

    if (initialTemplates) {
      Object.entries(initialTemplates).forEach(([key, field]) => {
        if (field.enabled) {
          values[key] = field.value
        }
      })
    }

    return values
  })()

  // Initialize form with values from initialTemplates
  const form = useForm<Record<string, any>>({
    resolver: zodResolver(createSalaryTemplateSchema(enabledFields)),
    defaultValues: initialValues, // Use the object directly, not a function
    mode: "onChange",
  })

  // Remove the useEffect hook that's causing the error

  // Handle toggling a field on/off
  const handleToggleField = (fieldId: string, enabled: boolean) => {
    setEnabledFields((prev) => ({
      ...prev,
      [fieldId]: enabled,
    }))
  }

  // And update the onSubmit function to validate with the current schema:
  const onSubmit = (values: Record<string, any>) => {
    try {
      // Validate with current schema
      const schema = createSalaryTemplateSchema(enabledFields)
      const result = schema.safeParse(values)

      if (!result.success) {
        // Handle validation errors
        const formattedErrors = result.error.format()
        console.error("Validation errors:", formattedErrors)

        // Show toast with error
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please check the form for errors",
        })

        return
      }

      // Create the salary templates object
      const templates: SalaryTemplates = {}

      allFields.forEach((field) => {
        templates[field.id] = {
          enabled: enabledFields[field.id] || false,
          value: enabledFields[field.id] ? String(values[field.id] || "") : "",
        }
      })

      onSave(templates)

      toast({
        title: "Success",
        description: "Salary template configuration saved",
      })
    } catch (error) {
      console.error("Error saving salary template:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save salary template configuration",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Salary Template Configuration
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>Configure which fields should appear in salary slips and their default values.</p>
                <p className="mt-2">Toggle fields on/off and set default values for enabled fields.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>Customize which fields appear in employee salary slips for this company</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="salary">Salary</TabsTrigger>
                <TabsTrigger value="allowances">Allowances</TabsTrigger>
                <TabsTrigger value="deductions">Deductions</TabsTrigger>
                <TabsTrigger value="final">Final</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fieldGroups.basic.map((field) => (
                    <SalaryTemplateField
                      key={field.id}
                      field={field}
                      enabled={enabledFields[field.id] || false}
                      onToggle={(enabled) => handleToggleField(field.id, enabled)}
                      form={form}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="salary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fieldGroups.salary.map((field) => (
                    <SalaryTemplateField
                      key={field.id}
                      field={field}
                      enabled={enabledFields[field.id] || false}
                      onToggle={(enabled) => handleToggleField(field.id, enabled)}
                      form={form}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="allowances" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fieldGroups.allowances.map((field) => (
                    <SalaryTemplateField
                      key={field.id}
                      field={field}
                      enabled={enabledFields[field.id] || false}
                      onToggle={(enabled) => handleToggleField(field.id, enabled)}
                      form={form}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="deductions" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fieldGroups.deductions.map((field) => (
                    <SalaryTemplateField
                      key={field.id}
                      field={field}
                      enabled={enabledFields[field.id] || false}
                      onToggle={(enabled) => handleToggleField(field.id, enabled)}
                      form={form}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="final" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fieldGroups.final.map((field) => (
                    <SalaryTemplateField
                      key={field.id}
                      field={field}
                      enabled={enabledFields[field.id] || false}
                      onToggle={(enabled) => handleToggleField(field.id, enabled)}
                      form={form}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <CardFooter className="flex justify-end px-0">
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save Template Configuration"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

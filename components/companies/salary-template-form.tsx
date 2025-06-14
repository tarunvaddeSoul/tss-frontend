"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save, Info, Check, X, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  getBasicDutyOptions,
  type SalaryTemplateConfig,
  type SalaryTemplateField,
  SalaryFieldType,
  SalaryFieldCategory,
  SalaryFieldPurpose,
  getDefaultSalaryTemplateConfig,
} from "@/types/company"
import { ScrollArea } from "../ui/scroll-area"

// Create a dynamic schema based on enabled fields
const createSalaryTemplateSchema = (config: SalaryTemplateConfig) => {
  const schemaFields: Record<string, any> = {}

  // Process all field arrays with null checks
  const mandatoryFields = config?.mandatoryFields || []
  const optionalFields = config?.optionalFields || []
  const customFields = config?.customFields || []

  const allFields = [...mandatoryFields, ...optionalFields, ...customFields]

  allFields.forEach((field) => {
    if (field.enabled) {
      let fieldSchema

      if (field.type === SalaryFieldType.NUMBER) {
        fieldSchema =
          field.category === SalaryFieldCategory.MANDATORY_WITH_RULES
            ? z
              .string()
              .min(1, `${field.label} is required`)
              .transform((val) => (val === "" ? undefined : Number(val)))
            : z
              .string()
              .optional()
              .transform((val) => (val === "" ? undefined : Number(val)))
      } else if (field.type === SalaryFieldType.SELECT) {
        fieldSchema =
          field.category === SalaryFieldCategory.MANDATORY_WITH_RULES
            ? z.string().min(1, `${field.label} is required`)
            : z.string().optional()
      } else {
        fieldSchema =
          field.category === SalaryFieldCategory.MANDATORY_WITH_RULES
            ? z.string().min(1, `${field.label} is required`)
            : z.string().optional()
      }

      schemaFields[field.key] = fieldSchema
    }
  })

  return z.object(schemaFields)
}

interface SalaryTemplateFormProps {
  initialTemplateConfig?: SalaryTemplateConfig
  onSave: (templateConfig: SalaryTemplateConfig) => void
  isLoading?: boolean
}

export function SalaryTemplateForm({ initialTemplateConfig, onSave, isLoading = false }: SalaryTemplateFormProps) {
  // Initialize with default config if none provided
  const [templateConfig, setTemplateConfig] = useState<SalaryTemplateConfig>(() => {
    // Make sure we have a valid config with all required fields
    const defaultConfig = getDefaultSalaryTemplateConfig()

    if (!initialTemplateConfig) {
      return defaultConfig
    }

    // Ensure all required arrays exist
    return {
      mandatoryFields: initialTemplateConfig.mandatoryFields || defaultConfig.mandatoryFields,
      optionalFields: initialTemplateConfig.optionalFields || defaultConfig.optionalFields,
      customFields: initialTemplateConfig.customFields || defaultConfig.customFields,
    }
  })

  // Create initial values object from template config
  const initialValues = (() => {
    const values: Record<string, any> = {}

    // Use safe access with null checks
    const mandatoryFields = templateConfig?.mandatoryFields || []
    const optionalFields = templateConfig?.optionalFields || []
    const customFields = templateConfig?.customFields || []

    const allFields = [...mandatoryFields, ...optionalFields, ...customFields]

    allFields.forEach((field) => {
      if (field.enabled && field.rules?.defaultValue !== undefined) {
        values[field.key] = field.rules.defaultValue
      }
    })

    return values
  })()

  // Initialize form
  const form = useForm<Record<string, any>>({
    resolver: zodResolver(createSalaryTemplateSchema(templateConfig)),
    defaultValues: initialValues,
    mode: "onChange",
  })

  // Update form validation when template config changes
  useEffect(() => {
    form.reset(form.getValues())
  }, [templateConfig, form])

  // Handle toggling a field on/off
  const handleToggleField = (fieldKey: string, enabled: boolean) => {
    setTemplateConfig((prev) => {
      const newConfig = { ...prev }

      // Find and update the field in the appropriate array
      const updateFieldInArray = (fields: SalaryTemplateField[] = []) => {
        return fields.map((field) => (field.key === fieldKey ? { ...field, enabled } : field))
      }

      newConfig.mandatoryFields = updateFieldInArray(newConfig.mandatoryFields)
      newConfig.optionalFields = updateFieldInArray(newConfig.optionalFields)
      newConfig.customFields = updateFieldInArray(newConfig.customFields)

      return newConfig
    })
  }

  // Handle updating field default value
  const handleUpdateFieldValue = (fieldKey: string, value: string) => {
    setTemplateConfig((prev) => {
      const newConfig = { ...prev }

      const updateFieldInArray = (fields: SalaryTemplateField[] = []) => {
        return fields.map((field) =>
          field.key === fieldKey
            ? {
              ...field,
              rules: {
                ...field.rules,
                defaultValue: value,
              },
            }
            : field,
        )
      }

      newConfig.mandatoryFields = updateFieldInArray(newConfig.mandatoryFields)
      newConfig.optionalFields = updateFieldInArray(newConfig.optionalFields)
      newConfig.customFields = updateFieldInArray(newConfig.customFields)

      return newConfig
    })
  }

  // Handle adding a custom field
  const handleAddCustomField = () => {
    const newField: SalaryTemplateField = {
      key: `custom_field_${Date.now()}`,
      label: "New Custom Field",
      type: SalaryFieldType.TEXT,
      category: SalaryFieldCategory.CUSTOM,
      purpose: SalaryFieldPurpose.INFORMATION,
      enabled: true,
      rules: {
        defaultValue: "",
      },
      description: "Custom field description",
    }

    setTemplateConfig((prev) => ({
      ...prev,
      customFields: [...(prev.customFields || []), newField],
    }))
  }

  // Handle removing a custom field
  const handleRemoveCustomField = (fieldKey: string) => {
    setTemplateConfig((prev) => ({
      ...prev,
      customFields: (prev.customFields || []).filter((field) => field.key !== fieldKey),
    }))
  }

  // Handle form submission
  const onSubmit = (values: Record<string, any>) => {
    try {
      // Update the template config with form values
      const updatedConfig = { ...templateConfig }

      const updateFieldsWithValues = (fields: SalaryTemplateField[] = []) => {
        return fields.map((field) => ({
          ...field,
          rules: {
            ...field.rules,
            defaultValue: field.enabled
              ? String(values[field.key] || field.rules?.defaultValue || "")
              : field.rules?.defaultValue,
          },
        }))
      }

      updatedConfig.mandatoryFields = updateFieldsWithValues(updatedConfig.mandatoryFields)
      updatedConfig.optionalFields = updateFieldsWithValues(updatedConfig.optionalFields)
      updatedConfig.customFields = updateFieldsWithValues(updatedConfig.customFields)

      onSave(updatedConfig)

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

  // Render field based on type
  const renderField = (field: SalaryTemplateField) => {
    const isEnabled = field.enabled
    const currentValue = form.watch(field.key) || field.rules?.defaultValue || ""

    if (field.key === "basicDuty" && field.type === SalaryFieldType.NUMBER) {
      return (
        <Select
          disabled={!isEnabled}
          value={String(currentValue)}
          onValueChange={(value) => {
            form.setValue(field.key, value)
            handleUpdateFieldValue(field.key, value)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select basic duty" />
          </SelectTrigger>
          <SelectContent>
            {getBasicDutyOptions().map((option) => (
              <SelectItem key={option} value={option}>
                {option} days
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (field.type === SalaryFieldType.NUMBER) {
      return (
        <Input
          type="number"
          disabled={!isEnabled}
          value={currentValue}
          onChange={(e) => {
            form.setValue(field.key, e.target.value)
            handleUpdateFieldValue(field.key, e.target.value)
          }}
          placeholder={`Enter ${field.label.toLowerCase()}`}
        />
      )
    }

    return (
      <Input
        type="text"
        disabled={!isEnabled}
        value={currentValue}
        onChange={(e) => {
          form.setValue(field.key, e.target.value)
          handleUpdateFieldValue(field.key, e.target.value)
        }}
        placeholder={`Enter ${field.label.toLowerCase()}`}
      />
    )
  }

  // Render field card
  const renderFieldCard = (field: SalaryTemplateField, showRemove = false) => (
    <div key={field.key} className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <label
            htmlFor={`toggle-${field.key}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {field.label}
            {field.category === SalaryFieldCategory.MANDATORY_WITH_RULES && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.enabled ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id={`toggle-${field.key}`}
            checked={field.enabled}
            onCheckedChange={(checked) => handleToggleField(field.key, checked)}
            disabled={field.category === SalaryFieldCategory.MANDATORY_WITH_RULES}
          />
          {showRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveCustomField(field.key)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        <Badge variant="outline" className="text-xs">
          {field.type}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {field.purpose}
        </Badge>
        {field.category === SalaryFieldCategory.MANDATORY_WITH_RULES && (
          <Badge variant="destructive" className="text-xs">
            Required
          </Badge>
        )}
      </div>

      {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}

      {renderField(field)}
    </div>
  )

  // Check if we have valid data to render
  const hasMandatoryFields = Array.isArray(templateConfig?.mandatoryFields) && templateConfig.mandatoryFields.length > 0
  const hasOptionalFields = Array.isArray(templateConfig?.optionalFields) && templateConfig.optionalFields.length > 0
  const hasCustomFields = Array.isArray(templateConfig?.customFields) && templateConfig.customFields.length > 0

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
      <ScrollArea className="flex-1">
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Accordion type="multiple" defaultValue={["mandatory", "optional"]} className="w-full">
                {hasMandatoryFields && (
                  <AccordionItem value="mandatory">
                    <AccordionTrigger className="text-lg font-semibold">
                      Mandatory Fields ({templateConfig.mandatoryFields.filter((f) => f.enabled).length}/
                      {templateConfig.mandatoryFields.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        {templateConfig.mandatoryFields.map((field) => renderFieldCard(field))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {hasOptionalFields && (
                  <AccordionItem value="optional">
                    <AccordionTrigger className="text-lg font-semibold">
                      Optional Fields ({templateConfig.optionalFields.filter((f) => f.enabled).length}/
                      {templateConfig.optionalFields.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        {templateConfig.optionalFields.map((field) => renderFieldCard(field))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                <AccordionItem value="custom">
                  <AccordionTrigger className="text-lg font-semibold">
                    Custom Fields ({(templateConfig.customFields || []).filter((f) => f.enabled).length}/
                    {(templateConfig.customFields || []).length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <div className="flex justify-end">
                        <Button type="button" variant="outline" size="sm" onClick={handleAddCustomField}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Custom Field
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(templateConfig.customFields || []).map((field) => renderFieldCard(field, true))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <CardFooter className="flex justify-end px-0">
                <Button type="submit" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Template Configuration"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </ScrollArea>
    </Card>
  )
}

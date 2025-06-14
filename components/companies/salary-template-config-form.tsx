"use client"

import { useState, useEffect } from "react"
import { Plus, Save, Trash2, Edit, Info, AlertCircle, X, Check, ChevronDown } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import {
  type SalaryTemplateConfig,
  type SalaryTemplateField,
  type CustomSalaryField,
  SalaryFieldType,
  SalaryFieldCategory,
  SalaryFieldPurpose,
  type SalaryFieldRule,
  getDefaultSalaryTemplateConfig,
} from "@/types/company"

import { ApiErrorAlert } from "@/components/ui/api-error-alert"

// Add this validation function after the imports
const validateMandatoryFields = (config: SalaryTemplateConfig): string[] => {
  const errors: string[] = []

  if (!config.mandatoryFields || !Array.isArray(config.mandatoryFields)) {
    errors.push("Mandatory fields configuration is missing")
    return errors
  }

  const disabledMandatoryFields = config.mandatoryFields.filter((field) => !field.enabled)

  if (disabledMandatoryFields.length > 0) {
    errors.push(
      `The following mandatory fields must be enabled: ${disabledMandatoryFields.map((f) => f.label).join(", ")}`,
    )
  }

  return errors
}

// Add this function after the imports
const validateTemplateConfig = (config: SalaryTemplateConfig): string[] => {
  const errors: string[] = []

  // Check if config exists
  if (!config) {
    errors.push("Template configuration is missing")
    return errors
  }

  // Helper function to check fields for metadata properties
  const checkFields = (fields: any[], fieldType: string) => {
    if (!Array.isArray(fields)) return

    fields.forEach((field, index) => {
      if (!field) return

      // Check for metadata properties
      if (field.id) {
        errors.push(`${fieldType} field at index ${index} contains an 'id' property which should be removed`)
      }

      if (field.companyId) {
        errors.push(`${fieldType} field at index ${index} contains a 'companyId' property which should be removed`)
      }

      if (field.createdAt) {
        errors.push(`${fieldType} field at index ${index} contains a 'createdAt' property which should be removed`)
      }

      if (field.updatedAt) {
        errors.push(`${fieldType} field at index ${index} contains an 'updatedAt' property which should be removed`)
      }
    })
  }

  // Check all field arrays
  checkFields(config.mandatoryFields, "Mandatory")
  checkFields(config.optionalFields, "Optional")
  checkFields(config.customFields ?? [], "Custom")

  return errors
}

// Helper function to generate basicDuty options
const getBasicDutyOptions = () => {
  return Array.from({ length: 6 }, (_, i) => (26 + i).toString())
}

// Schema for custom field form
const customFieldSchema = z.object({
  key: z
    .string()
    .min(1, "Field key is required")
    .regex(/^[a-z][a-zA-Z0-9]*$/, "Key must be in camelCase (start with lowercase, no spaces or special characters)")
    .refine((val) => val === val.replace(/[^a-zA-Z0-9]/g, ""), "Key must contain only letters and numbers"),
  label: z.string().min(1, "Field label is required"),
  type: z.nativeEnum(SalaryFieldType),
  purpose: z.nativeEnum(SalaryFieldPurpose),
  description: z.string().min(1, "Description is required"),
  requiresAdminInput: z.boolean().optional(),
  defaultValue: z.string().optional(),
  requireRemarks: z.boolean().optional(),
  options: z.array(z.string()).optional(),
})

type CustomFieldFormValues = z.infer<typeof customFieldSchema>

interface SalaryTemplateConfigFormProps {
  initialConfig?: SalaryTemplateConfig
  onSave: (config: SalaryTemplateConfig) => void
  isLoading?: boolean
}

export function SalaryTemplateConfigForm({ initialConfig, onSave, isLoading = false }: SalaryTemplateConfigFormProps) {
  // Initialize with a safe default configuration
  const defaultConfig = getDefaultSalaryTemplateConfig()

  // Safely initialize the config state with defaults for any missing properties
  const [config, setConfig] = useState<SalaryTemplateConfig>(() => {
    if (!initialConfig) {
      return defaultConfig
    }

    // Create a safe copy with all required properties
    return {
      mandatoryFields: Array.isArray(initialConfig.mandatoryFields)
        ? [...initialConfig.mandatoryFields]
        : [...defaultConfig.mandatoryFields],
      optionalFields: Array.isArray(initialConfig.optionalFields)
        ? [...initialConfig.optionalFields]
        : [...defaultConfig.optionalFields],
      customFields: Array.isArray(initialConfig.customFields)
        ? [...initialConfig.customFields]
        : [...(defaultConfig.customFields ?? [])],
    }
  })

  const [activeTab, setActiveTab] = useState("mandatory")
  const [editingField, setEditingField] = useState<SalaryTemplateField | null>(null)
  const [isAddingCustomField, setIsAddingCustomField] = useState(false)
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({})
  const [selectOptions, setSelectOptions] = useState<string[]>([])
  const [newOption, setNewOption] = useState("")
  const [validationError, setValidationError] = useState<Error | null>(null)
  const [mandatoryFieldErrors, setMandatoryFieldErrors] = useState<string[]>([])

  // Form for custom fields
  const customFieldForm = useForm<CustomFieldFormValues>({
    resolver: zodResolver(customFieldSchema),
    defaultValues: {
      key: "",
      label: "",
      type: SalaryFieldType.TEXT,
      purpose: SalaryFieldPurpose.INFORMATION,
      description: "",
      requiresAdminInput: false,
      defaultValue: "",
      requireRemarks: false,
      options: [],
    },
  })

  // Update form when editing field changes
  useEffect(() => {
    if (editingField) {
      const options = editingField.options || (editingField.rules?.allowedValues as string[]) || []

      setSelectOptions(Array.isArray(options) ? options : [])

      customFieldForm.reset({
        key: editingField.key,
        label: editingField.label,
        type: editingField.type,
        purpose: editingField.purpose,
        description: editingField.description || "",
        requiresAdminInput: editingField.requiresAdminInput || false,
        defaultValue: editingField.defaultValue || "",
        requireRemarks: editingField.rules?.requireRemarks || false,
        options: options,
      })
    } else {
      setSelectOptions([])
    }
  }, [editingField, customFieldForm])

  // Helper functions to safely count enabled fields
  const countEnabledMandatoryFields = () => {
    return Array.isArray(config.mandatoryFields) ? config.mandatoryFields.filter((f) => f.enabled).length : 0
  }

  const countMandatoryFields = () => {
    return Array.isArray(config.mandatoryFields) ? config.mandatoryFields.length : 0
  }

  const countEnabledOptionalFields = () => {
    return Array.isArray(config.optionalFields) ? config.optionalFields.filter((f) => f.enabled).length : 0
  }

  const countOptionalFields = () => {
    return Array.isArray(config.optionalFields) ? config.optionalFields.length : 0
  }

  const countEnabledCustomFields = () => {
    return Array.isArray(config.customFields) ? config.customFields.filter((f) => f.enabled).length : 0
  }

  const countCustomFields = () => {
    return Array.isArray(config.customFields) ? config.customFields.length : 0
  }

  // Replace the existing toggleFieldEnabled function
  const toggleFieldEnabled = (fieldType: "mandatory" | "optional" | "custom", index: number) => {
    setConfig((prev) => {
      const newConfig = { ...prev }

      if (fieldType === "mandatory" && Array.isArray(prev.mandatoryFields)) {
        newConfig.mandatoryFields = [...prev.mandatoryFields]
        if (index >= 0 && index < newConfig.mandatoryFields.length) {
          newConfig.mandatoryFields[index] = {
            ...newConfig.mandatoryFields[index],
            enabled: !newConfig.mandatoryFields[index].enabled,
          }
        }

        // Validate mandatory fields after toggle
        const errors = validateMandatoryFields(newConfig)
        setMandatoryFieldErrors(errors)
      } else if (fieldType === "optional" && Array.isArray(prev.optionalFields)) {
        newConfig.optionalFields = [...prev.optionalFields]
        if (index >= 0 && index < newConfig.optionalFields.length) {
          newConfig.optionalFields[index] = {
            ...newConfig.optionalFields[index],
            enabled: !newConfig.optionalFields[index].enabled,
          }
        }
      } else if (fieldType === "custom" && Array.isArray(prev.customFields)) {
        newConfig.customFields = [...prev.customFields]
        if (index >= 0 && index < newConfig.customFields.length) {
          newConfig.customFields[index] = {
            ...newConfig.customFields[index],
            enabled: !newConfig.customFields[index].enabled,
          }
        }
      }

      return newConfig
    })
  }

  // Edit field rules
  const updateFieldRules = (
    fieldType: "mandatory" | "optional" | "custom",
    index: number,
    rules: Partial<SalaryFieldRule>,
  ) => {
    setConfig((prev) => {
      const newConfig = { ...prev }

      if (fieldType === "mandatory" && Array.isArray(prev.mandatoryFields)) {
        newConfig.mandatoryFields = [...prev.mandatoryFields]
        if (index >= 0 && index < newConfig.mandatoryFields.length) {
          newConfig.mandatoryFields[index] = {
            ...newConfig.mandatoryFields[index],
            rules: {
              ...(newConfig.mandatoryFields[index].rules || {}),
              ...rules,
            },
          }
        }
      } else if (fieldType === "optional" && Array.isArray(prev.optionalFields)) {
        newConfig.optionalFields = [...prev.optionalFields]
        if (index >= 0 && index < newConfig.optionalFields.length) {
          newConfig.optionalFields[index] = {
            ...newConfig.optionalFields[index],
            rules: {
              ...(newConfig.optionalFields[index].rules || {}),
              ...rules,
            },
          }
        }
      } else if (fieldType === "custom" && Array.isArray(prev.customFields)) {
        newConfig.customFields = [...prev.customFields]
        if (index >= 0 && index < newConfig.customFields.length) {
          newConfig.customFields[index] = {
            ...newConfig.customFields[index],
            rules: {
              ...(newConfig.customFields[index].rules || {}),
              ...rules,
            },
          }
        }
      }

      return newConfig
    })
  }

  // Update field default value
  const updateFieldDefaultValue = (
    fieldType: "mandatory" | "optional" | "custom",
    index: number,
    defaultValue: string,
  ) => {
    setConfig((prev) => {
      const newConfig = { ...prev }

      if (fieldType === "mandatory" && Array.isArray(prev.mandatoryFields)) {
        newConfig.mandatoryFields = [...prev.mandatoryFields]
        if (index >= 0 && index < newConfig.mandatoryFields.length) {
          newConfig.mandatoryFields[index] = {
            ...newConfig.mandatoryFields[index],
            defaultValue,
          }
        }
      } else if (fieldType === "optional" && Array.isArray(prev.optionalFields)) {
        newConfig.optionalFields = [...prev.optionalFields]
        if (index >= 0 && index < newConfig.optionalFields.length) {
          newConfig.optionalFields[index] = {
            ...newConfig.optionalFields[index],
            defaultValue,
          }
        }
      } else if (fieldType === "custom" && Array.isArray(prev.customFields)) {
        newConfig.customFields = [...prev.customFields]
        if (index >= 0 && index < newConfig.customFields.length) {
          newConfig.customFields[index] = {
            ...newConfig.customFields[index],
            defaultValue,
          }
        }
      }

      return newConfig
    })
  }

  // Update field options
  const updateFieldOptions = (fieldType: "mandatory" | "optional" | "custom", index: number, options: string[]) => {
    setConfig((prev) => {
      const newConfig = { ...prev }

      if (fieldType === "mandatory" && Array.isArray(prev.mandatoryFields)) {
        newConfig.mandatoryFields = [...prev.mandatoryFields]
        if (index >= 0 && index < newConfig.mandatoryFields.length) {
          newConfig.mandatoryFields[index] = {
            ...newConfig.mandatoryFields[index],
            options,
            rules: {
              ...(newConfig.mandatoryFields[index].rules || {}),
              allowedValues: options,
            },
          }
        }
      } else if (fieldType === "optional" && Array.isArray(prev.optionalFields)) {
        newConfig.optionalFields = [...prev.optionalFields]
        if (index >= 0 && index < newConfig.optionalFields.length) {
          newConfig.optionalFields[index] = {
            ...newConfig.optionalFields[index],
            options,
            rules: {
              ...(newConfig.optionalFields[index].rules || {}),
              allowedValues: options,
            },
          }
        }
      } else if (fieldType === "custom" && Array.isArray(prev.customFields)) {
        newConfig.customFields = [...prev.customFields]
        if (index >= 0 && index < newConfig.customFields.length) {
          newConfig.customFields[index] = {
            ...newConfig.customFields[index],
            options,
            rules: {
              ...(newConfig.customFields[index].rules || {}),
              allowedValues: options,
            },
          }
        }
      }

      return newConfig
    })
  }

  // Delete custom field
  const deleteCustomField = (index: number) => {
    setConfig((prev) => {
      const newConfig = { ...prev }
      if (Array.isArray(prev.customFields)) {
        newConfig.customFields = prev.customFields.filter((_, i) => i !== index)
      }
      return newConfig
    })

    toast({
      title: "Custom field deleted",
      description: "The custom field has been removed from the template",
    })
  }

  // Add custom field
  const addCustomField = (data: CustomFieldFormValues) => {
    const newField: CustomSalaryField = {
      key: data.key,
      label: data.label,
      type: data.type,
      category: SalaryFieldCategory.CUSTOM,
      purpose: data.purpose,
      enabled: true,
      description: data.description,
      requiresAdminInput: data.requiresAdminInput,
      defaultValue: data.defaultValue,
      options: data.type === SalaryFieldType.SELECT ? selectOptions : undefined,
      rules: {
        requireRemarks: data.requireRemarks,
        allowedValues: data.type === SalaryFieldType.SELECT ? selectOptions : undefined,
      },
    }

    setConfig((prev) => {
      const newConfig = { ...prev }
      newConfig.customFields = [...(Array.isArray(prev.customFields) ? prev.customFields : []), newField]
      return newConfig
    })

    setIsAddingCustomField(false)
    customFieldForm.reset()
    setSelectOptions([])

    toast({
      title: "Custom field added",
      description: "The custom field has been added to the template",
    })
  }

  // Edit custom field
  const editCustomField = (field: SalaryTemplateField) => {
    setEditingField(field)
  }

  // Update custom field
  const updateCustomField = (data: CustomFieldFormValues) => {
    if (!editingField) return

    const updatedField: CustomSalaryField = {
      key: data.key,
      label: data.label,
      type: data.type,
      category: SalaryFieldCategory.CUSTOM,
      purpose: data.purpose,
      enabled: editingField.enabled,
      description: data.description,
      requiresAdminInput: data.requiresAdminInput,
      defaultValue: data.defaultValue,
      options: data.type === SalaryFieldType.SELECT ? selectOptions : undefined,
      rules: {
        requireRemarks: data.requireRemarks,
        allowedValues: data.type === SalaryFieldType.SELECT ? selectOptions : undefined,
      },
    }

    setConfig((prev) => {
      const newConfig = { ...prev }
      if (Array.isArray(prev.customFields)) {
        newConfig.customFields = prev.customFields.map((field) =>
          field.key === editingField.key ? updatedField : field,
        )
      }
      return newConfig
    })

    setEditingField(null)
    customFieldForm.reset()
    setSelectOptions([])

    toast({
      title: "Custom field updated",
      description: "The custom field has been updated",
    })
  }

  // Toggle field expansion
  const toggleFieldExpansion = (fieldKey: string) => {
    setExpandedFields((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }))
  }

  // Add option to select field
  const addOption = () => {
    if (!newOption.trim()) return

    if (selectOptions.includes(newOption.trim())) {
      toast({
        variant: "destructive",
        title: "Duplicate option",
        description: "This option already exists",
      })
      return
    }

    setSelectOptions((prev) => [...prev, newOption.trim()])
    setNewOption("")
  }

  // Remove option from select field
  const removeOption = (option: string) => {
    setSelectOptions((prev) => prev.filter((o) => o !== option))
  }

  // Get purpose badge color
  const getPurposeBadgeColor = (purpose: SalaryFieldPurpose) => {
    switch (purpose) {
      case SalaryFieldPurpose.ALLOWANCE:
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case SalaryFieldPurpose.DEDUCTION:
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case SalaryFieldPurpose.CALCULATION:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case SalaryFieldPurpose.INFORMATION:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      default:
        return ""
    }
  }

  // Get type badge color
  const getTypeBadgeColor = (type: SalaryFieldType) => {
    switch (type) {
      case SalaryFieldType.TEXT:
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case SalaryFieldType.NUMBER:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case SalaryFieldType.DATE:
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      case SalaryFieldType.BOOLEAN:
        return "bg-teal-100 text-teal-800 hover:bg-teal-100"
      case SalaryFieldType.SELECT:
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100"
      default:
        return ""
    }
  }

  // Update the renderFieldCard function to add visual warning for disabled mandatory fields
  const renderFieldCard = (
    field: SalaryTemplateField,
    index: number,
    fieldType: "mandatory" | "optional" | "custom",
  ) => {
    if (!field) return null

    const isExpanded = expandedFields[field.key]
    const isCustom = fieldType === "custom"
    const hasRules = field.rules || (field.category && field.category.includes("WITH_RULES"))
    const isSelectType = field.type === SalaryFieldType.SELECT
    const isMandatoryDisabled = fieldType === "mandatory" && !field.enabled

    return (
      <Card
        key={field.key}
        className={cn(
          "mb-4 transition-all duration-200",
          field.enabled ? "border-primary/20" : "border-muted opacity-70",
          isMandatoryDisabled && "border-red-200 bg-red-50",
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={field.enabled}
                onCheckedChange={() => toggleFieldEnabled(fieldType, index)}
                id={`toggle-${field.key}`}
              />
              <Label
                htmlFor={`toggle-${field.key}`}
                className={cn(
                  "font-medium cursor-pointer",
                  field.enabled ? "text-foreground" : "text-muted-foreground",
                  isMandatoryDisabled && "text-red-700",
                )}
              >
                {field.label}
                {fieldType === "mandatory" && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {isMandatoryDisabled && (
                <Badge variant="destructive" className="ml-2">
                  Required
                </Badge>
              )}
              {field.purpose && (
                <Badge variant="outline" className={cn("ml-2", getPurposeBadgeColor(field.purpose))}>
                  {field.purpose}
                </Badge>
              )}
              {field.type && (
                <Badge variant="outline" className={cn("ml-1", getTypeBadgeColor(field.type))}>
                  {field.type}
                </Badge>
              )}
              {field.requiresAdminInput && (
                <Badge variant="outline" className="ml-1 bg-orange-100 text-orange-800 hover:bg-orange-100">
                  Admin Input
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isCustom && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => editCustomField(field)} title="Edit custom field">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCustomField(index)}
                    title="Delete custom field"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFieldExpansion(field.key)}
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <X className="h-4 w-4" /> : <Info className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="pt-0">
            <div className="text-sm space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-muted-foreground">Key:</p>
                  <p>{field.key}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">Category:</p>
                  <p>{field.category}</p>
                </div>
              </div>

              {field.description && (
                <div>
                  <p className="font-semibold text-muted-foreground">Description:</p>
                  <p>{field.description}</p>
                </div>
              )}

              {hasRules && (
                <div>
                  <p className="font-semibold text-muted-foreground mb-2">Rules:</p>
                  <div className="grid grid-cols-2 gap-4">
                    {field.type === SalaryFieldType.NUMBER && (
                      <>
                        <div>
                          <Label htmlFor={`default-${field.key}`}>Default Value</Label>
                          <Input
                            id={`default-${field.key}`}
                            type="number"
                            value={field.rules?.defaultValue || ""}
                            onChange={(e) =>
                              updateFieldRules(fieldType, index, {
                                defaultValue: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            placeholder="No default"
                          />
                        </div>
                      </>
                    )}

                    {field.type === SalaryFieldType.TEXT && (
                      <div>
                        <Label htmlFor={`default-${field.key}`}>Default Value</Label>
                        <Input
                          id={`default-${field.key}`}
                          value={field.defaultValue || ""}
                          onChange={(e) => updateFieldDefaultValue(fieldType, index, e.target.value)}
                          placeholder="No default"
                        />
                      </div>
                    )}

                    {isSelectType && (
                      <div className="col-span-2">
                        <Label>Options</Label>
                        <div className="mt-2 space-y-2">
                          {field.key === "basicDuty" ? (
                            <div>
                              <Label htmlFor={`default-select-${field.key}`}>Select Days</Label>
                              <Select
                                value={field.defaultValue || "30"}
                                onValueChange={(value) => updateFieldDefaultValue(fieldType, index, value)}
                              >
                                <SelectTrigger id={`default-select-${field.key}`}>
                                  <SelectValue placeholder="Select days" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getBasicDutyOptions().map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option} days
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground mt-1">
                                Select the number of days for basic duty calculation
                              </p>
                            </div>
                          ) : (
                            <>
                              <div className="flex flex-wrap gap-2">
                                {(field.options || []).map((option) => (
                                  <Badge key={option} variant="outline" className="text-sm">
                                    {option}
                                    {isCustom && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 ml-1"
                                        onClick={() => {
                                          const newOptions = (field.options || []).filter((o) => o !== option)
                                          updateFieldOptions(fieldType, index, newOptions)
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </Badge>
                                ))}
                              </div>
                              {isCustom && (
                                <div className="flex gap-2 mt-2">
                                  <Input
                                    placeholder="Add new option"
                                    value={newOption}
                                    onChange={(e) => setNewOption(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault()
                                        const newOptions = [...(field.options || []), newOption]
                                        updateFieldOptions(fieldType, index, newOptions)
                                        setNewOption("")
                                      }
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      const newOptions = [...(field.options || []), newOption]
                                      updateFieldOptions(fieldType, index, newOptions)
                                      setNewOption("")
                                    }}
                                  >
                                    Add
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        {field.key !== "basicDuty" && (
                          <div className="mt-2">
                            <Label htmlFor={`default-select-${field.key}`}>Default Value</Label>
                            <Select
                              value={field.defaultValue || ""}
                              onValueChange={(value) => updateFieldDefaultValue(fieldType, index, value)}
                            >
                              <SelectTrigger id={`default-select-${field.key}`}>
                                <SelectValue placeholder="Select default value" />
                              </SelectTrigger>
                              <SelectContent>
                                {(field.options || []).map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`remarks-${field.key}`}
                          checked={field.rules?.requireRemarks || false}
                          onCheckedChange={(checked) => updateFieldRules(fieldType, index, { requireRemarks: checked })}
                        />
                        <Label htmlFor={`remarks-${field.key}`}>Require remarks</Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  // Group fields by purpose with safe array handling
  const groupFieldsByPurpose = (fields: SalaryTemplateField[]) => {
    if (!Array.isArray(fields)) return {}

    const grouped: Record<SalaryFieldPurpose, SalaryTemplateField[]> = {
      [SalaryFieldPurpose.INFORMATION]: [],
      [SalaryFieldPurpose.CALCULATION]: [],
      [SalaryFieldPurpose.ALLOWANCE]: [],
      [SalaryFieldPurpose.DEDUCTION]: [],
    }

    fields.forEach((field) => {
      if (field && field.purpose) {
        grouped[field.purpose].push(field)
      }
    })

    return grouped
  }

  // Render fields grouped by purpose with null checks
  const renderGroupedFields = (fields: SalaryTemplateField[], fieldType: "mandatory" | "optional" | "custom") => {
    if (!Array.isArray(fields) || fields.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No fields available in this category</p>
        </div>
      )
    }

    const grouped = groupFieldsByPurpose(fields)

    return (
      <Accordion type="multiple" className="w-full">
        {Object.entries(grouped).map(([purpose, purposeFields]) => {
          if (!Array.isArray(purposeFields) || purposeFields.length === 0) return null

          return (
            <AccordionItem key={purpose} value={purpose}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getPurposeBadgeColor(purpose as SalaryFieldPurpose)}>
                    {purpose}
                  </Badge>
                  <span>
                    ({purposeFields.filter((f) => f.enabled).length}/{purposeFields.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {purposeFields.map((field, idx) => {
                    if (!field) return null

                    // Find the original index in the full array
                    const originalIndex =
                      fieldType === "mandatory" && Array.isArray(config.mandatoryFields)
                        ? config.mandatoryFields.findIndex((f) => f && f.key === field.key)
                        : fieldType === "optional" && Array.isArray(config.optionalFields)
                          ? config.optionalFields.findIndex((f) => f && f.key === field.key)
                          : fieldType === "custom" && Array.isArray(config.customFields)
                            ? config.customFields.findIndex((f) => f && f.key === field.key)
                            : -1

                    if (originalIndex === -1) return null

                    return renderFieldCard(field, originalIndex, fieldType)
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Salary Template Configuration
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>Configure which fields should appear in salary slips and their properties.</p>
                  <p className="mt-2">Toggle fields on/off and set rules for enabled fields.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>Customize which fields appear in employee salary slips for this company</CardDescription>
        </CardHeader>
        <CardContent>
          {validationError && (
            <ApiErrorAlert
              error={validationError}
              title="Validation Error"
              onDismiss={() => setValidationError(null)}
              className="mb-4"
            />
          )}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="mandatory">
                Mandatory Fields ({countEnabledMandatoryFields()}/{countMandatoryFields()})
              </TabsTrigger>
              <TabsTrigger value="optional">
                Optional Fields ({countEnabledOptionalFields()}/{countOptionalFields()})
              </TabsTrigger>
              <TabsTrigger value="custom">
                Custom Fields ({countEnabledCustomFields()}/{countCustomFields()})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mandatory" className="space-y-4">
              {mandatoryFieldErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Mandatory Fields Required</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc pl-5 space-y-1">
                          {mandatoryFieldErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">Mandatory Fields</h3>
                  <p className="text-sm text-muted-foreground">These fields are required for salary calculations</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Actions <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setConfig((prev) => {
                          if (!Array.isArray(prev.mandatoryFields)) return prev
                          return {
                            ...prev,
                            mandatoryFields: prev.mandatoryFields.map((field) => ({
                              ...field,
                              enabled: true,
                            })),
                          }
                        })
                      }}
                    >
                      <Check className="mr-2 h-4 w-4" /> Enable All
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        // Show confirmation dialog or warning
                        if (
                          confirm(
                            "Warning: Disabling mandatory fields will prevent you from saving the template. Are you sure?",
                          )
                        ) {
                          setConfig((prev) => {
                            if (!Array.isArray(prev.mandatoryFields)) return prev
                            const newConfig = {
                              ...prev,
                              mandatoryFields: prev.mandatoryFields.map((field) => ({
                                ...field,
                                enabled: false,
                              })),
                            }

                            // Validate and show errors
                            const errors = validateMandatoryFields(newConfig)
                            setMandatoryFieldErrors(errors)

                            return newConfig
                          })
                        }
                      }}
                    >
                      <X className="mr-2 h-4 w-4" /> Disable All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                {Array.isArray(config.mandatoryFields) && config.mandatoryFields.length > 0 ? (
                  renderGroupedFields(config.mandatoryFields, "mandatory")
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Mandatory Fields</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      There are no mandatory fields configured for this template.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="optional" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">Optional Fields</h3>
                  <p className="text-sm text-muted-foreground">
                    These fields provide additional information but are not required
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Actions <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setConfig((prev) => {
                          if (!Array.isArray(prev.optionalFields)) return prev
                          return {
                            ...prev,
                            optionalFields: prev.optionalFields.map((field) => ({
                              ...field,
                              enabled: true,
                            })),
                          }
                        })
                      }}
                    >
                      <Check className="mr-2 h-4 w-4" /> Enable All
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setConfig((prev) => {
                          if (!Array.isArray(prev.optionalFields)) return prev
                          return {
                            ...prev,
                            optionalFields: prev.optionalFields.map((field) => ({
                              ...field,
                              enabled: false,
                            })),
                          }
                        })
                      }}
                    >
                      <X className="mr-2 h-4 w-4" /> Disable All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                {Array.isArray(config.optionalFields) && config.optionalFields.length > 0 ? (
                  renderGroupedFields(config.optionalFields, "optional")
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Optional Fields</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      There are no optional fields configured for this template.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">Custom Fields</h3>
                  <p className="text-sm text-muted-foreground">Add your own custom fields to the salary template</p>
                </div>
                <div className="flex gap-2">
                  {Array.isArray(config.customFields) && config.customFields.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          Actions <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setConfig((prev) => {
                              if (!Array.isArray(prev.customFields)) return prev
                              return {
                                ...prev,
                                customFields: prev.customFields.map((field) => ({
                                  ...field,
                                  enabled: true,
                                })),
                              }
                            })
                          }}
                        >
                          <Check className="mr-2 h-4 w-4" /> Enable All
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setConfig((prev) => {
                              if (!Array.isArray(prev.customFields)) return prev
                              return {
                                ...prev,
                                customFields: prev.customFields.map((field) => ({
                                  ...field,
                                  enabled: false,
                                })),
                              }
                            })
                          }}
                        >
                          <X className="mr-2 h-4 w-4" /> Disable All
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Dialog open={isAddingCustomField} onOpenChange={setIsAddingCustomField}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Custom Field
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Add Custom Field</DialogTitle>
                        <DialogDescription>
                          Create a custom field for your salary template. This field will be available for all
                          employees.
                        </DialogDescription>
                      </DialogHeader>

                      <Form {...customFieldForm}>
                        <form onSubmit={customFieldForm.handleSubmit(addCustomField)} className="space-y-6">
                          {/* Required Fields Section */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <h4 className="text-sm font-semibold text-foreground">Required Information</h4>
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={customFieldForm.control}
                                name="key"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-1">
                                      Field Key <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g. advanceTaken, overtimeHours"
                                        {...field}
                                        className={customFieldForm.formState.errors.key ? "border-destructive" : ""}
                                      />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                      Must be camelCase (e.g. advanceTaken, overtimeHours)
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={customFieldForm.control}
                                name="label"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-1">
                                      Display Label <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g. Advance Taken, Overtime Hours"
                                        {...field}
                                        className={customFieldForm.formState.errors.label ? "border-destructive" : ""}
                                      />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                      How the field will appear on the salary slip
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={customFieldForm.control}
                                name="type"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-1">
                                      Field Type <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger
                                          className={customFieldForm.formState.errors.type ? "border-destructive" : ""}
                                        >
                                          <SelectValue placeholder="Select field type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value={SalaryFieldType.TEXT}>Text</SelectItem>
                                        <SelectItem value={SalaryFieldType.NUMBER}>Number</SelectItem>
                                        <SelectItem value={SalaryFieldType.DATE}>Date</SelectItem>
                                        <SelectItem value={SalaryFieldType.BOOLEAN}>Boolean</SelectItem>
                                        <SelectItem value={SalaryFieldType.SELECT}>Select</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormDescription className="text-xs">The data type of the field</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={customFieldForm.control}
                                name="purpose"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-1">
                                      Field Purpose <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger
                                          className={
                                            customFieldForm.formState.errors.purpose ? "border-destructive" : ""
                                          }
                                        >
                                          <SelectValue placeholder="Select field purpose" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value={SalaryFieldPurpose.INFORMATION}>Information</SelectItem>
                                        <SelectItem value={SalaryFieldPurpose.ALLOWANCE}>Allowance</SelectItem>
                                        <SelectItem value={SalaryFieldPurpose.DEDUCTION}>Deduction</SelectItem>
                                        <SelectItem value={SalaryFieldPurpose.CALCULATION}>Calculation</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormDescription className="text-xs">
                                      How this field will be used in calculations
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={customFieldForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1">
                                    Description <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Describe the purpose and usage of this field"
                                      className={cn(
                                        "resize-none",
                                        customFieldForm.formState.errors.description ? "border-destructive" : "",
                                      )}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription className="text-xs">
                                    Explain what this field is for and how it should be used
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={customFieldForm.control}
                              name="requiresAdminInput"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/50">
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Requires Admin Input</FormLabel>
                                    <FormDescription>
                                      If enabled, admin must fill this field for each employee every month during salary
                                      processing
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Optional Fields Section */}
                          <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center gap-2 mb-4">
                              <h4 className="text-sm font-semibold text-foreground">Optional Settings</h4>
                              <Badge variant="outline" className="text-xs">
                                Optional
                              </Badge>
                            </div>

                            {customFieldForm.watch("type") === SalaryFieldType.SELECT && (
                              <div>
                                <FormLabel>Options</FormLabel>
                                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                                  {selectOptions.map((option) => (
                                    <Badge key={option} variant="outline" className="text-sm">
                                      {option}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 ml-1"
                                        onClick={() => removeOption(option)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Add new option"
                                    value={newOption}
                                    onChange={(e) => setNewOption(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault()
                                        addOption()
                                      }
                                    }}
                                  />
                                  <Button type="button" onClick={addOption} disabled={!newOption.trim()}>
                                    Add
                                  </Button>
                                </div>
                                <FormDescription className="text-xs mt-2">
                                  Add options for the select field
                                </FormDescription>
                              </div>
                            )}

                            {customFieldForm.watch("type") === SalaryFieldType.TEXT && (
                              <FormField
                                control={customFieldForm.control}
                                name="defaultValue"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Default Value</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Default text value" {...field} />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                      The default value for this field (optional)
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}

                            {customFieldForm.watch("type") === SalaryFieldType.NUMBER && (
                              <FormField
                                control={customFieldForm.control}
                                name="defaultValue"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Default Value</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="Default number value" {...field} />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                      The default value for this field (optional)
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}

                            <FormField
                              control={customFieldForm.control}
                              name="requireRemarks"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Require Remarks</FormLabel>
                                    <FormDescription>
                                      If enabled, users will need to provide remarks when using this field
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>

                          <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsAddingCustomField(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={!customFieldForm.formState.isValid}>
                              Add Field
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {Array.isArray(config.customFields) && config.customFields.length > 0 ? (
                <div className="space-y-2">{renderGroupedFields(config.customFields, "custom")}</div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Plus className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your Custom Fields</h3>
                      <p className="text-sm text-gray-600 max-w-md mx-auto mb-4">
                        Custom fields let you add company-specific items to salary slips. Common examples include
                        bonuses, advances, overtime pay, or special allowances.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-500 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>Performance Bonus</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span>Salary Advance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>Overtime Pay</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span>Travel Allowance</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsAddingCustomField(true)}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Add Your First Custom Field
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setConfig(getDefaultSalaryTemplateConfig())
              toast({
                title: "Reset to Default",
                description: "Salary template configuration has been reset to default values",
              })
            }}
          >
            Reset to Default
          </Button>
          <Button
            onClick={() => {
              if (!config || !config.mandatoryFields || !config.optionalFields) {
                setValidationError(new Error("The template configuration is missing required fields"))
                return
              }

              // Validate mandatory fields
              const mandatoryErrors = validateMandatoryFields(config)
              if (mandatoryErrors.length > 0) {
                setMandatoryFieldErrors(mandatoryErrors)
                setValidationError(new Error("Please enable all mandatory fields before saving"))
                return
              }

              // Validate the configuration
              const validationErrors = validateTemplateConfig(config)
              if (validationErrors.length > 0) {
                setValidationError(new Error(validationErrors.join("\n")))
                return
              }

              // Clear any previous errors
              setValidationError(null)
              setMandatoryFieldErrors([])

              onSave(config)
              toast({
                title: "Configuration Saved",
                description: "Salary template configuration has been saved successfully",
              })
            }}
            disabled={isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Configuration"}
          </Button>
        </CardFooter>
      </Card>

      {/* Edit Custom Field Dialog */}
      <Dialog open={!!editingField} onOpenChange={(open) => !open && setEditingField(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Custom Field</DialogTitle>
            <DialogDescription>Update the properties of your custom field.</DialogDescription>
          </DialogHeader>

          <Form {...customFieldForm}>
            <form onSubmit={customFieldForm.handleSubmit(updateCustomField)} className="space-y-6">
              {/* Required Fields Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-sm font-semibold text-foreground">Required Information</h4>
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={customFieldForm.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Field Key <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. advanceTaken, overtimeHours"
                            {...field}
                            className={customFieldForm.formState.errors.key ? "border-destructive" : ""}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Must be camelCase (e.g. advanceTaken, overtimeHours)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={customFieldForm.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Display Label <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Advance Taken, Overtime Hours"
                            {...field}
                            className={customFieldForm.formState.errors.label ? "border-destructive" : ""}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          How the field will appear on the salary slip
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={customFieldForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Field Type <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger
                              className={customFieldForm.formState.errors.type ? "border-destructive" : ""}
                            >
                              <SelectValue placeholder="Select field type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={SalaryFieldType.TEXT}>Text</SelectItem>
                            <SelectItem value={SalaryFieldType.NUMBER}>Number</SelectItem>
                            <SelectItem value={SalaryFieldType.DATE}>Date</SelectItem>
                            <SelectItem value={SalaryFieldType.BOOLEAN}>Boolean</SelectItem>
                            <SelectItem value={SalaryFieldType.SELECT}>Select</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">The data type of the field</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={customFieldForm.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Field Purpose <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger
                              className={customFieldForm.formState.errors.purpose ? "border-destructive" : ""}
                            >
                              <SelectValue placeholder="Select field purpose" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={SalaryFieldPurpose.INFORMATION}>Information</SelectItem>
                            <SelectItem value={SalaryFieldPurpose.ALLOWANCE}>Allowance</SelectItem>
                            <SelectItem value={SalaryFieldPurpose.DEDUCTION}>Deduction</SelectItem>
                            <SelectItem value={SalaryFieldPurpose.CALCULATION}>Calculation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          How this field will be used in calculations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={customFieldForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Description <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the purpose and usage of this field"
                          className={cn(
                            "resize-none",
                            customFieldForm.formState.errors.description ? "border-destructive" : "",
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Explain what this field is for and how it should be used
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={customFieldForm.control}
                  name="requiresAdminInput"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/50">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Requires Admin Input</FormLabel>
                        <FormDescription>
                          If enabled, admin must fill this field for each employee every month during salary processing
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Optional Fields Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-sm font-semibold text-foreground">Optional Settings</h4>
                  <Badge variant="outline" className="text-xs">
                    Optional
                  </Badge>
                </div>

                {customFieldForm.watch("type") === SalaryFieldType.SELECT && (
                  <div>
                    <FormLabel>Options</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2 mb-4">
                      {selectOptions.map((option) => (
                        <Badge key={option} variant="outline" className="text-sm">
                          {option}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => removeOption(option)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new option"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addOption()
                          }
                        }}
                      />
                      <Button type="button" onClick={addOption} disabled={!newOption.trim()}>
                        Add
                      </Button>
                    </div>
                    <FormDescription className="text-xs mt-2">Add options for the select field</FormDescription>
                  </div>
                )}

                {customFieldForm.watch("type") === SalaryFieldType.TEXT && (
                  <FormField
                    control={customFieldForm.control}
                    name="defaultValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Value</FormLabel>
                        <FormControl>
                          <Input placeholder="Default text value" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          The default value for this field (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {customFieldForm.watch("type") === SalaryFieldType.NUMBER && (
                  <FormField
                    control={customFieldForm.control}
                    name="defaultValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Value</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Default number value" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          The default value for this field (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={customFieldForm.control}
                  name="requireRemarks"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Require Remarks</FormLabel>
                        <FormDescription>
                          If enabled, users will need to provide remarks when using this field
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingField(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!customFieldForm.formState.isValid}>
                  Update Field
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

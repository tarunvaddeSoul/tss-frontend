"use client"

import type { UseFormReturn } from "react-hook-form"
import { AlertCircle } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface SalaryTemplateFieldType {
  id: string
  label: string
  type: "text" | "number" | "select"
  required?: boolean
  options?: string[]
}

interface SalaryTemplateFieldProps {
  field: SalaryTemplateFieldType
  enabled: boolean
  onToggle: (enabled: boolean) => void
  form: UseFormReturn<Record<string, any>>
}

export function SalaryTemplateField({ field, enabled, onToggle, form }: SalaryTemplateFieldProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-200",
        enabled ? "border-primary/20 bg-primary/5" : "border-muted bg-background opacity-80",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Switch checked={enabled} onCheckedChange={onToggle} id={`toggle-${field.id}`} />
            <Label
              htmlFor={`toggle-${field.id}`}
              className={cn("font-medium cursor-pointer", enabled ? "text-foreground" : "text-muted-foreground")}
            >
              {field.label}
              {field.required && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="h-3 w-3 text-destructive ml-1 inline" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This field is required</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </Label>
          </div>
        </div>

        <FormField
          control={form.control}
          name={field.id}
          render={({ field: formField }) => (
            <FormItem>
              <FormControl>
                {field.type === "select" ? (
                  <Select disabled={!enabled} onValueChange={formField.onChange} value={formField.value || ""}>
                    <SelectTrigger className={cn(!enabled && "opacity-50")}>
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={field.type === "number" ? "number" : "text"}
                    placeholder={enabled ? `Enter ${field.label.toLowerCase()}` : "Disabled"}
                    disabled={!enabled}
                    className={cn(!enabled && "opacity-50")}
                    value={formField.value || ""}
                    onChange={(e) => {
                      formField.onChange(e.target.value)
                    }}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}

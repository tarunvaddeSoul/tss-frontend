"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Save, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { companyService } from "@/services/companyService"
import { SalaryTemplateForm } from "@/components/companies/salary-template-form"
import type { Company, SalaryTemplates } from "@/types/company"

// Form validation schema for basic company info
const companyFormSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  contactPersonName: z.string().min(2, "Contact person name must be at least 2 characters"),
  contactPersonNumber: z.string().regex(/^\d{10}$/, "Contact number must be 10 digits"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  companyOnboardingDate: z.date(),
})

// Default salary template with all fields enabled
const getDefaultSalaryTemplates = (): SalaryTemplates => {
  const templateFields = [
    "name",
    "fatherName",
    "companyName",
    "designation",
    "monthlyRate",
    "basicDuty",
    "dutyDone",
    "wagesPerDay",
    "basicPay",
    "epfWages",
    "otherAllowance",
    "otherAllowanceRemark",
    "bonus",
    "grossSalary",
    "pf",
    "esic",
    "advance",
    "uniform",
    "advanceGivenBy",
    "penalty",
    "lwf",
    "otherDeductions",
    "otherDeductionsRemark",
    "totalDeductions",
    "netSalary",
    "uanNumber",
    "pfPaidStatus",
    "esicNumber",
    "esicFilingStatus",
  ]

  const templates: SalaryTemplates = {}

  // Set required fields as enabled by default
  const requiredFields = [
    "name",
    "companyName",
    "designation",
    "monthlyRate",
    "basicDuty",
    "dutyDone",
    "wagesPerDay",
    "basicPay",
    "grossSalary",
    "totalDeductions",
    "netSalary",
  ]

  templateFields.forEach((field) => {
    templates[field] = {
      enabled: requiredFields.includes(field),
      value: "",
    }
  })

  return templates
}

export default function AddCompanyPage() {
  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(false)
  const [salaryTemplates, setSalaryTemplates] = useState<SalaryTemplates>(getDefaultSalaryTemplates())

  const router = useRouter()

  // Initialize form
  const form = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      address: "",
      contactPersonName: "",
      contactPersonNumber: "",
      status: "ACTIVE",
      companyOnboardingDate: new Date(),
    },
  })

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof companyFormSchema>) => {
    try {
      setIsLoading(true)

      // Format the date as DD-MM-YYYY
      const formattedDate = format(values.companyOnboardingDate, "dd-MM-yyyy")

      // Prepare the company data with the required structure
      const companyData: Company = {
        ...values,
        companyOnboardingDate: formattedDate,
        salaryTemplates: salaryTemplates,
      }

      await companyService.createCompany(companyData)

      toast({
        title: "Success",
        description: "Company created successfully",
      })

      router.push("/companies")
    } catch (error) {
      console.error("Error creating company:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create company. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle salary template updates
  const handleSalaryTemplatesChange = (templates: SalaryTemplates) => {
    setSalaryTemplates(templates)
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Company</h1>
          <p className="text-muted-foreground">Create a new company record with salary template configuration</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/companies")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="salary-templates">Salary Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Enter the basic details of the company</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} id="company-form" className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                              <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactPersonName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter contact person name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactPersonNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter 10-digit phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyOnboardingDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Onboarding Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>The date when the company was onboarded</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter company address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/companies")}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button onClick={() => handleTabChange("salary-templates")}>Next: Configure Salary Templates</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="salary-templates" className="space-y-4 pt-4">
          <SalaryTemplateForm initialTemplates={salaryTemplates} onSave={handleSalaryTemplatesChange} />

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => handleTabChange("basic")}>
              Back to Basic Information
            </Button>
            <Button
              type="submit"
              form="company-form"
              disabled={isLoading}
              onClick={() => {
                // Validate the form before submission
                form.trigger().then((isValid) => {
                  if (isValid) {
                    form.handleSubmit(onSubmit)()
                  } else {
                    // If form is invalid, switch back to basic tab
                    handleTabChange("basic")
                    toast({
                      variant: "destructive",
                      title: "Validation Error",
                      description: "Please fill in all required fields in the Basic Information tab.",
                    })
                  }
                })
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Company"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

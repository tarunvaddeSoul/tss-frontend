"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Save, ArrowLeft, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { companyService } from "@/services/companyService"
import { SalaryTemplateConfigForm } from "@/components/companies/salary-template-config-form"
import { SalarySlipPreview } from "@/components/companies/salary-slip-preview"
import {
  CompanyStatus,
  type SalaryTemplateConfig,
  getDefaultSalaryTemplateConfig,
  convertSalaryTemplatesToConfig,
} from "@/types/company"

// Form validation schema for basic company info
const companyFormSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  contactPersonName: z.string().min(2, "Contact person name must be at least 2 characters"),
  contactPersonNumber: z.string().regex(/^\d{10}$/, "Contact number must be 10 digits"),
  status: z.nativeEnum(CompanyStatus),
  companyOnboardingDate: z.date(),
})

export default function EditCompanyPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [salaryTemplateConfig, setSalaryTemplateConfig] = useState<SalaryTemplateConfig | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [originalCompany, setOriginalCompany] = useState<any>(null)

  const router = useRouter()
  const { id } = params

  // Initialize form
  const form = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      address: "",
      contactPersonName: "",
      contactPersonNumber: "",
      status: CompanyStatus.ACTIVE,
      companyOnboardingDate: new Date(),
    },
  })

  // Fetch company data
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setIsDataLoading(true)
        const response = await companyService.getCompanyById(id)
        const company = response.data

        console.log("Fetched company data:", company)
        setOriginalCompany(company)

        // Set form values
        if (company) {
          form.reset({
            name: company.name,
            address: company.address,
            contactPersonName: company.contactPersonName,
            contactPersonNumber: company.contactPersonNumber,
            status: company.status,
            companyOnboardingDate: company.companyOnboardingDate
              ? new Date(company.companyOnboardingDate.split("-").reverse().join("-"))
              : new Date(),
          })
        }

        // Convert salaryTemplates array to salaryTemplateConfig object
        let templateConfig: SalaryTemplateConfig

        if (company?.salaryTemplates && Array.isArray(company.salaryTemplates) && company.salaryTemplates.length > 0) {
          // Use existing saved template
          const convertedConfig = convertSalaryTemplatesToConfig(company.salaryTemplates)
          templateConfig = convertedConfig || getDefaultSalaryTemplateConfig()
          console.log("Using existing salary template config:", templateConfig)
        } else {
          // Use default template if none exists
          templateConfig = getDefaultSalaryTemplateConfig()
          console.log("Using default salary template config:", templateConfig)
        }

        setSalaryTemplateConfig(templateConfig)
      } catch (error) {
        console.error("Error fetching company:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load company data. Please try again.",
        })
        router.push("/companies")
      } finally {
        setIsDataLoading(false)
      }
    }

    fetchCompany()
  }, [id, form, router])

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof companyFormSchema>) => {
    try {
      setIsLoading(true)
      setValidationErrors([])

      console.log("Form values:", values)
      console.log("Salary template config before submission:", salaryTemplateConfig)

      // Format the date as DD-MM-YYYY
      const formattedDate = format(values.companyOnboardingDate, "dd-MM-yyyy")

      // Prepare the company data with the required structure
      const companyData = {
        ...values,
        companyOnboardingDate: formattedDate,
        salaryTemplates: salaryTemplateConfig ?? undefined,
      }

      console.log("Company data being submitted:", JSON.stringify(companyData, null, 2))

      await companyService.updateCompany(id, companyData)

      toast({
        title: "Success",
        description: "Company updated successfully",
      })

      router.push("/companies")
    } catch (error: any) {
      console.error("Error updating company:", error)
      console.error("Error response data:", error.response?.data)

      // Handle validation errors
      if (error.response?.status === 400) {
        const errorData = error.response.data

        if (errorData.message && Array.isArray(errorData.message)) {
          setValidationErrors(errorData.message)

          // Check if it's a validation error related to salary template
          if (errorData.message.some((msg: string) => msg.includes("salaryTemplateConfig"))) {
            toast({
              variant: "destructive",
              title: "Salary Template Validation Error",
              description:
                "There are validation errors in the salary template configuration. Please check the details below.",
            })

            // Switch to the salary templates tab to show the error
            setActiveTab("salary-templates")
          } else {
            // Generic validation error
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: "Please check the validation errors below and try again.",
            })
          }
        } else {
          // Single validation error
          setValidationErrors([errorData.message || "Validation failed"])
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: errorData.message || "Please check your input and try again.",
          })
        }
      } else {
        // Generic error
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to update company. Please try again.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle salary template updates
  const handleSalaryTemplateChange = (config: SalaryTemplateConfig) => {
    console.log("Salary template config changed:", config)
    setSalaryTemplateConfig(config)
    // Clear validation errors when config changes
    setValidationErrors([])
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Company</h1>
          <p className="text-muted-foreground">Update company information and salary template configuration</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/companies")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Button>
      </div>

      {/* Validation Errors Alert */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <p className="mb-2">Please fix the following issues:</p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isDataLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger
              value="salary-templates"
              className={validationErrors.some((e) => e.includes("salaryTemplateConfig")) ? "text-red-600" : ""}
            >
              Salary Templates
              {validationErrors.some((e) => e.includes("salaryTemplateConfig")) && (
                <AlertTriangle className="ml-2 h-4 w-4 text-red-600" />
              )}
            </TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Update the basic details of the company</CardDescription>
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
                                <SelectItem value={CompanyStatus.ACTIVE}>ACTIVE</SelectItem>
                                <SelectItem value={CompanyStatus.INACTIVE}>INACTIVE</SelectItem>
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
            <div className="flex justify-end mb-4">
              <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className={showPreview ? "lg:col-span-3" : "lg:col-span-5"}>
                {salaryTemplateConfig && (
                  <SalaryTemplateConfigForm
                    initialConfig={salaryTemplateConfig}
                    onSave={handleSalaryTemplateChange}
                  />
                )}

                {!salaryTemplateConfig && (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">Loading Template Configuration...</h3>
                      <p className="text-sm text-muted-foreground">
                        Please wait while we load the salary template configuration.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {showPreview && salaryTemplateConfig && (
                <div className="lg:col-span-2">
                  <SalarySlipPreview config={salaryTemplateConfig} />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => handleTabChange("basic")}>
                Back to Basic Information
              </Button>
              <Button variant="outline" onClick={() => handleTabChange("preview")}>
                Preview Salary Slip
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
                {isLoading ? "Saving..." : "Update Company"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Salary Slip Preview</CardTitle>
                <CardDescription>Preview how the salary slip will look with your configuration</CardDescription>
              </CardHeader>
              <CardContent>
                {salaryTemplateConfig ? (
                  <SalarySlipPreview config={salaryTemplateConfig} />
                ) : (
                  <div className="flex items-center justify-center p-8">
                    <p className="text-muted-foreground">No template configuration available for preview.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleTabChange("salary-templates")}>
                  Back to Salary Templates
                </Button>
                <Button
                  type="submit"
                  form="company-form"
                  disabled={isLoading || !salaryTemplateConfig}
                  onClick={() => {
                    form.trigger().then((isValid) => {
                      if (isValid) {
                        form.handleSubmit(onSubmit)()
                      } else {
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
                  {isLoading ? "Saving..." : "Update Company"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { Save, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { companyService } from "@/services/companyService"
import { SalaryTemplateConfigForm } from "@/components/companies/salary-template-config-form"
import { SalarySlipPreview } from "@/components/companies/salary-slip-preview"
import { CompanyStatus, type SalaryTemplateConfig, getDefaultSalaryTemplateConfig } from "@/types/company"
import { DatePicker } from "@/components/ui/date-picker"

// Form validation schema for basic company info
const companyFormSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  contactPersonName: z.string().min(2, "Contact person name must be at least 2 characters"),
  contactPersonNumber: z.string().regex(/^\d{10}$/, "Contact number must be 10 digits"),
  status: z.nativeEnum(CompanyStatus),
  companyOnboardingDate: z.date(),
})

export default function AddCompanyPage() {
  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(false)
  const [salaryTemplateConfig, setSalaryTemplateConfig] = useState<SalaryTemplateConfig>(
    getDefaultSalaryTemplateConfig(),
  )
  const [showPreview, setShowPreview] = useState(false)

  const router = useRouter()

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

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof companyFormSchema>) => {
    try {
      setIsLoading(true)

      // Format the date as DD-MM-YYYY
      const formattedDate = format(values.companyOnboardingDate, "dd-MM-yyyy")

      // Prepare the company data with the required structure
      const companyData = {
        ...values,
        companyOnboardingDate: formattedDate,
        salaryTemplates: salaryTemplateConfig,
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
  const handleSalaryTemplateChange = (config: SalaryTemplateConfig) => {
    setSalaryTemplateConfig(config)
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="salary-templates">Salary Templates</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
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
                          <DatePicker
                            date={field.value}
                            onSelect={field.onChange}
                            className="w-full"
                            yearRange={{ from: 1900, to: new Date().getFullYear() }}
                          />
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
              <SalaryTemplateConfigForm initialConfig={salaryTemplateConfig} onSave={handleSalaryTemplateChange} />
            </div>

            {showPreview && (
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
              {isLoading ? "Saving..." : "Save Company"}
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
              <SalarySlipPreview config={salaryTemplateConfig} />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleTabChange("salary-templates")}>
                Back to Salary Templates
              </Button>
              <Button
                type="submit"
                form="company-form"
                disabled={isLoading}
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
                {isLoading ? "Saving..." : "Save Company"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

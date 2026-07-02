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
import { label } from "@/lib/labels"
import { clientService } from "@/services/clientService"
import { ClientSalarySetup } from "@/components/clients/client-salary-setup"
import { SalarySlipPreview } from "@/components/clients/salary-slip-preview"
import { ClientStatus, type SalaryTemplateConfig, getDefaultSalaryTemplateConfig } from "@/types/client"
import { DatePicker } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/layout/page-header"

// Form validation schema for basic client info
const clientFormSchema = z.object({
  name: z.string().min(2, "Client name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  contactPersonName: z.string().min(2, "Contact person name must be at least 2 characters"),
  contactPersonNumber: z.string().regex(/^\d{10}$/, "Contact number must be 10 digits"),
  status: z.nativeEnum(ClientStatus),
  clientOnboardingDate: z.date(),
})

export default function AddClientPage() {
  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(false)
  const [salaryTemplateConfig, setSalaryTemplateConfig] = useState<SalaryTemplateConfig>(
    getDefaultSalaryTemplateConfig(),
  )

  const router = useRouter()

  // Initialize form
  const form = useForm<z.infer<typeof clientFormSchema>>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      address: "",
      contactPersonName: "",
      contactPersonNumber: "",
      status: ClientStatus.ACTIVE,
      clientOnboardingDate: new Date(),
    },
  })

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof clientFormSchema>) => {
    try {
      setIsLoading(true)

      // Format the date as DD-MM-YYYY
      const formattedDate = format(values.clientOnboardingDate, "dd-MM-yyyy")

      // Prepare the client data with the required structure
      const clientData = {
        ...values,
        clientOnboardingDate: formattedDate,
        salaryTemplates: salaryTemplateConfig,
      }

      await clientService.createClient(clientData)

      toast({
        title: "Success",
        description: "Client created successfully",
      })

      router.push("/clients")
    } catch (error) {
      console.error("Error creating client:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create client. Please try again.",
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
      <PageHeader
        no="05"
        eyebrow="Client register"
        title="Add New Client"
        description="Add a client and set up their salary slip"
        actions={
          <Button variant="outline" onClick={() => router.push("/clients")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="salary-templates">Salary Slip</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Enter the basic details of the client</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form noValidate onSubmit={form.handleSubmit(onSubmit)} id="client-form" className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter client name" {...field} />
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
                              <SelectItem value={ClientStatus.ACTIVE}>{label.status(ClientStatus.ACTIVE)}</SelectItem>
                              <SelectItem value={ClientStatus.INACTIVE}>{label.status(ClientStatus.INACTIVE)}</SelectItem>
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
                      name="clientOnboardingDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Onboarding Date</FormLabel>
                          <DatePicker
                            date={field.value}
                            onSelect={field.onChange}
                            className="w-full"
                            yearRange={{ from: 1900, to: new Date().getFullYear() }}
                          />
                          <FormDescription>The date when the client was onboarded</FormDescription>
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
                            <Input placeholder="Enter client address" {...field} />
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
              <Button variant="outline" onClick={() => router.push("/clients")}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button onClick={() => handleTabChange("salary-templates")}>Next: Set Up Salary Slip</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="salary-templates" className="space-y-4 pt-4">
          <ClientSalarySetup config={salaryTemplateConfig} onChange={handleSalaryTemplateChange} />

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => handleTabChange("basic")}>
              Back to Basic Information
            </Button>
            <Button variant="outline" onClick={() => handleTabChange("preview")}>
              Preview Salary Slip
            </Button>
            <Button
              type="submit"
              form="client-form"
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
              {isLoading ? "Saving..." : "Save Client"}
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
                form="client-form"
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
                {isLoading ? "Saving..." : "Save Client"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

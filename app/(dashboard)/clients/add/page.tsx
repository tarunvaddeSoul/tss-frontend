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
import { toast } from "@/components/ui/use-toast"
import { label } from "@/lib/labels"
import { clientService } from "@/services/clientService"
import { ClientStatus, getDefaultSalaryTemplateConfig } from "@/types/client"
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
  const [isLoading, setIsLoading] = useState(false)

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

      // Prepare the client data with the required structure.
      // A default salary slip template is applied; it is edited on the
      // dedicated Salary Slips page, not here.
      const clientData = {
        ...values,
        clientOnboardingDate: formattedDate,
        salaryTemplates: getDefaultSalaryTemplateConfig(),
      }

      const response = await clientService.createClient(clientData)
      const createdId = (response as any)?.data?.id

      toast({
        title: "Client created",
        description: "Now set up their salary slip template.",
      })

      router.push(createdId ? `/clients/salary-slips?clientId=${createdId}` : "/clients")
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

  return (
    <div className="space-y-6">
      <PageHeader
        no="05"
        eyebrow="Client register"
        title="Add New Client"
        description="Add a client, then set up their salary slip on the Salary Slips page"
        actions={
          <Button variant="outline" onClick={() => router.push("/clients")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        }
      />

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
              <Button type="submit" form="client-form" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save Client"}
              </Button>
            </CardFooter>
          </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Save, ArrowLeft, AlertTriangle, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { label } from "@/lib/labels"
import { clientService } from "@/services/clientService"
import { getErrorMessage } from "@/services/api"
import { PageHeader } from "@/components/layout/page-header"
import { ClientStatus } from "@/types/client"

// Form validation schema for basic client info
const clientFormSchema = z.object({
  name: z.string().min(2, "Client name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  contactPersonName: z.string().min(2, "Contact person name must be at least 2 characters"),
  contactPersonNumber: z.string().regex(/^\d{10}$/, "Contact number must be 10 digits"),
  status: z.nativeEnum(ClientStatus),
  clientOnboardingDate: z.date(),
})

export default function EditClientPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const router = useRouter()
  const { id } = params

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

  // Fetch client data
  useEffect(() => {
    const fetchClient = async () => {
      try {
        setIsDataLoading(true)
        const response = await clientService.getClientById(id)
        const client = response.data

        if (client) {
          form.reset({
            name: client.name,
            address: client.address,
            contactPersonName: client.contactPersonName,
            contactPersonNumber: client.contactPersonNumber,
            status: client.status,
            clientOnboardingDate: client.clientOnboardingDate
              ? new Date(client.clientOnboardingDate)
              : new Date(),
          })
        }
      } catch (error) {
        console.error("Error fetching client:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load client data. Please try again.",
        })
        router.push("/clients")
      } finally {
        setIsDataLoading(false)
      }
    }

    fetchClient()
  }, [id, form, router])

  // Handle form submission; the salary slip template is edited on the
  // dedicated Salary Slips page, so it is not sent from here.
  const onSubmit = async (values: z.infer<typeof clientFormSchema>) => {
    try {
      setIsLoading(true)
      setValidationErrors([])

      const clientData = {
        ...values,
        clientOnboardingDate: format(values.clientOnboardingDate, "dd-MM-yyyy"),
      }

      await clientService.updateClient(id, clientData)

      toast({
        title: "Success",
        description: "Client updated successfully",
      })

      router.push("/clients")
    } catch (error: any) {
      const errorMessage = getErrorMessage(error)
      const details = error.response?.data?.error?.details
      const messages = Array.isArray(details)
        ? details.map((d: any) => (typeof d === "string" ? d : d?.message ?? JSON.stringify(d)))
        : [errorMessage]

      setValidationErrors(messages)

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage || "Failed to update client. Please try again.",
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
        title="Edit Client"
        description="Update client information"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/clients/salary-slips?clientId=${id}`)}>
              <FileText className="mr-2 h-4 w-4" />
              Salary Slip
            </Button>
            <Button variant="outline" onClick={() => router.push("/clients")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clients
            </Button>
          </div>
        }
      />

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
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Update the basic details of the client</CardDescription>
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
              {isLoading ? "Saving..." : "Update Client"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

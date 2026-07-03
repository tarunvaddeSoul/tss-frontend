"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Briefcase, Loader2, Search, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { designationService } from "@/services/designationService"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/page-header"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const designationSchema = z.object({
  name: z.string().min(2, { message: "Designation name must be at least 2 characters" }),
})

type DesignationFormValues = z.infer<typeof designationSchema>

export default function DesignationSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [designations, setDesignations] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingDesignation, setIsAddingDesignation] = useState(false)
  const [designationToDelete, setDesignationToDelete] = useState<any | null>(null)

  const form = useForm<DesignationFormValues>({
    resolver: zodResolver(designationSchema),
    defaultValues: {
      name: "",
    },
  })

  useEffect(() => {
    fetchDesignations()
  }, [])

  const fetchDesignations = async () => {
    try {
      const data = await designationService.getDesignations()
      setDesignations(data)
    } catch (err) {
      console.error("Failed to fetch designations:", err)
      toast.error("Failed to fetch designations")
    }
  }

  const handleAddDesignation = async (data: DesignationFormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      await designationService.createDesignation(data.name)
      toast.success("Designation added successfully")
      form.reset()
      setIsAddingDesignation(false)
      fetchDesignations()
    } catch (err: any) {
      setError(err.message || "Failed to add designation")
      toast.error("Failed to add designation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDesignation = async () => {
    if (!designationToDelete) return

    try {
      await designationService.deleteDesignationById(designationToDelete.id)
      toast.success("Designation deleted successfully")
      setDesignationToDelete(null)
      fetchDesignations()
    } catch (err: any) {
      toast.error("Failed to delete designation")
    }
  }

  const filteredDesignations = designations.filter(designation =>
    designation.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        no="06"
        eyebrow="Settings register"
        title="Designation Management"
        description="Manage job designations and titles."
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                Designations
              </CardTitle>
              <CardDescription>
                Manage job designations and titles
              </CardDescription>
            </div>
            <Dialog open={isAddingDesignation} onOpenChange={setIsAddingDesignation}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Designation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Designation</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form noValidate onSubmit={form.handleSubmit(handleAddDesignation)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Designation Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter designation name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Designation"
                      )}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search designations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-[400px] rounded-md border">
              <div className="space-y-2 p-4">
                {filteredDesignations.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      No records on file
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      No designations match this list yet.
                    </p>
                  </div>
                ) : (
                  filteredDesignations.map((designation) => (
                    <div
                      key={designation.id}
                      className="flex items-center justify-between p-4 rounded-md border bg-card hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-md bg-surface flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">{designation.name}</h3>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDesignationToDelete(designation)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!designationToDelete} onOpenChange={() => setDesignationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the designation "{designationToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDesignation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 
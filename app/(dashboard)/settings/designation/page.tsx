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
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Designation Management
      </h1>

      <Card className="backdrop-blur-sm bg-white/5 border border-white/10 shadow-xl rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl z-0 opacity-50" />
        <CardHeader className="relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Designations
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Manage job designations and titles
              </CardDescription>
            </div>
            <Dialog open={isAddingDesignation} onOpenChange={setIsAddingDesignation}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Designation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Designation</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddDesignation)} className="space-y-4">
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
        <CardContent className="relative z-10">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search designations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>

            <ScrollArea className="h-[400px] rounded-lg border border-white/10">
              <div className="space-y-2 p-4">
                {filteredDesignations.map((designation) => (
                  <div
                    key={designation.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{designation.name}</h3>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-600 hover:bg-red-500/10"
                      onClick={() => setDesignationToDelete(designation)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 
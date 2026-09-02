"use client"

import { useCallback, useEffect, useState } from "react"
import type { LucideIcon } from "lucide-react"
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

interface LookupItem {
  id: string
  name: string
}

interface LookupManagerProps {
  /** Singular, lower case, e.g. "service type" */
  noun: string
  /** Plural heading, e.g. "Service Types" */
  pluralTitle: string
  description: string
  icon: LucideIcon
  fetchAll: () => Promise<LookupItem[]>
  create: (name: string) => Promise<unknown>
  update: (id: string, name: string) => Promise<unknown>
  remove: (id: string) => Promise<unknown>
}

export function LookupManager({
  noun,
  pluralTitle,
  description,
  icon: Icon,
  fetchAll,
  create,
  update,
  remove,
}: LookupManagerProps): JSX.Element {
  const [items, setItems] = useState<LookupItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [addName, setAddName] = useState("")
  const [itemToEdit, setItemToEdit] = useState<LookupItem | null>(null)
  const [editName, setEditName] = useState("")
  const [itemToDelete, setItemToDelete] = useState<LookupItem | null>(null)

  const refresh = useCallback(async () => {
    try {
      setItems(await fetchAll())
    } catch (error: any) {
      toast.error(error.message || `Failed to fetch ${noun}s`)
    }
  }, [fetchAll, noun])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleAdd = async () => {
    const name = addName.trim()
    if (name.length < 2) {
      toast.error("Name must be at least 2 characters")
      return
    }
    setIsSubmitting(true)
    try {
      await create(name)
      toast.success(`${pluralTitle.replace(/s$/, "")} added`)
      setAddName("")
      setAddOpen(false)
      refresh()
    } catch (error: any) {
      toast.error(error.message || `Failed to add ${noun}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRename = async () => {
    if (!itemToEdit) return
    const name = editName.trim()
    if (name.length < 2) {
      toast.error("Name must be at least 2 characters")
      return
    }
    setIsSubmitting(true)
    try {
      await update(itemToEdit.id, name)
      toast.success("Renamed")
      setItemToEdit(null)
      refresh()
    } catch (error: any) {
      toast.error(error.message || `Failed to rename ${noun}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    try {
      await remove(itemToDelete.id)
      toast.success("Deleted")
      setItemToDelete(null)
      refresh()
    } catch (error: any) {
      toast.error(error.message || `Failed to delete ${noun}`)
    }
  }

  const filtered = items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>{pluralTitle}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Search ${noun}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-10"
            />
          </div>

          <ScrollArea className="h-[380px] rounded-md border">
            <div className="space-y-1 p-2">
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    No records on file
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">No {noun}s match this list yet.</p>
                </div>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border bg-card px-3 py-2 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setItemToEdit(item)
                          setEditName(item.name)
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setItemToDelete(item)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">Add {noun}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleAdd()
            }}
          >
            <Input
              placeholder={`Enter ${noun} name`}
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              autoFocus
            />
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={!!itemToEdit} onOpenChange={(open) => !open && setItemToEdit(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">Rename {noun}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleRename()
            }}
          >
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setItemToEdit(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{itemToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

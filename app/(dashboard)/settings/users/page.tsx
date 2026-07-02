"use client"

import { useCallback, useEffect, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, MailPlus, RefreshCw, Send, UserCheck, UserPlus, UserX } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonLoader } from "@/components/ui/loader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { formatDate } from "@/lib/labels"
import { Role } from "@/types/auth"
import {
  userAdminService,
  type AdminUser,
  type UserDepartment,
} from "@/services/userAdminService"

const inviteSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Enter a valid email address" }),
  mobileNumber: z
    .string()
    .regex(/^\d{10}$/, { message: "Enter a 10-digit mobile number" }),
  role: z.nativeEnum(Role),
  departmentId: z.string().min(1, { message: "Select a department" }),
})

type InviteFormValues = z.infer<typeof inviteSchema>

const ROLE_OPTIONS = Object.values(Role)

export default function UsersSettingsPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [departments, setDepartments] = useState<UserDepartment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [busyUserId, setBusyUserId] = useState<string | null>(null)

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      name: "",
      email: "",
      mobileNumber: "",
      role: Role.USER,
      departmentId: "",
    },
  })

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [userList, departmentList] = await Promise.all([
        userAdminService.listUsers(),
        userAdminService.getUserDepartments(),
      ])
      setUsers(userList)
      setDepartments(departmentList)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load users.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  async function onInvite(values: InviteFormValues) {
    setIsInviting(true)
    try {
      const { resent } = await userAdminService.inviteUser(values)
      toast.success(
        resent
          ? `Invite re-sent to ${values.email}.`
          : `Invite sent. ${values.email} will receive a link to set their password.`,
      )
      setInviteOpen(false)
      form.reset()
      await fetchAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the user.")
    } finally {
      setIsInviting(false)
    }
  }

  async function handleRoleChange(target: AdminUser, role: Role) {
    setBusyUserId(target.id)
    try {
      await userAdminService.updateRole(target.id, role)
      toast.success(`${target.name} is now ${role}.`)
      await fetchAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not change the role.")
    } finally {
      setBusyUserId(null)
    }
  }

  async function handleToggleActive(target: AdminUser) {
    setBusyUserId(target.id)
    try {
      await userAdminService.setActive(target.id, !target.isActive)
      toast.success(
        target.isActive
          ? `${target.name} can no longer sign in.`
          : `${target.name} can sign in again.`,
      )
      await fetchAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the account.")
    } finally {
      setBusyUserId(null)
    }
  }

  async function handleResendInvite(target: AdminUser) {
    setBusyUserId(target.id)
    try {
      await userAdminService.inviteUser({
        name: target.name,
        email: target.email,
        mobileNumber: target.mobileNumber,
        role: target.role,
        departmentId: target.departmentId,
      })
      toast.success(`Invite re-sent to ${target.email}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not re-send the invite.")
    } finally {
      setBusyUserId(null)
    }
  }

  async function handleSendSetPassword(target: AdminUser) {
    setBusyUserId(target.id)
    try {
      await userAdminService.sendSetPasswordEmail(target.email)
      toast.success(`Set-password link sent to ${target.email}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send the email.")
    } finally {
      setBusyUserId(null)
    }
  }

  const isSelf = (u: AdminUser) => currentUser?.email === u.email

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Portal accounts for the internal team. Invited people set their own password through an
              emailed link.
            </CardDescription>
          </div>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite user
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite a user</DialogTitle>
                <DialogDescription>
                  Creates the account and emails a set-password link. No passwords change hands.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form noValidate onSubmit={form.handleSubmit(onInvite)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Anita Sharma" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="name@tulsyans.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile number</FormLabel>
                        <FormControl>
                          <Input inputMode="numeric" placeholder="10-digit mobile" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ROLE_OPTIONS.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="departmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                  {d.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isInviting}>
                    {isInviting ? (
                      <>
                        <ButtonLoader className="mr-2" />
                        Sending invite...
                      </>
                    ) : (
                      <>
                        <MailPlus className="mr-2 h-4 w-4" />
                        Send invite
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : loadError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Could not load users</AlertTitle>
            <AlertDescription className="mt-2">
              {loadError}
              <Button variant="outline" size="sm" onClick={() => fetchAll()} className="mt-3 block sm:ml-4 sm:mt-0 sm:inline-flex">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="registry-eyebrow">No records on file</span>
            <p className="text-sm text-muted-foreground">No users yet. Invite the first one.</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto scrollbar-sleek">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.name}
                      {isSelf(u) && <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">You</span>}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate font-mono text-[13px]" title={`${u.email} · ${u.mobileNumber} · joined ${formatDate(u.createdAt)}`}>{u.email}</TableCell>
                    <TableCell className="text-muted-foreground">{u.department?.name || "-"}</TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(value) => handleRoleChange(u, value as Role)}
                        disabled={isSelf(u) || busyUserId === u.id}
                      >
                        <SelectTrigger className="h-8 w-[132px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.invitePending ? "warning" : u.isActive ? "success" : "destructive"}
                      >
                        {u.invitePending ? "Invited" : u.isActive ? "Active" : "Deactivated"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => (u.invitePending ? handleResendInvite(u) : handleSendSetPassword(u))}
                          disabled={busyUserId === u.id}
                          title={u.invitePending ? "Re-send the invite email" : "Email a set-password link"}
                          aria-label={u.invitePending ? "Re-send invite" : "Send set-password link"}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn("h-8 w-8", u.isActive ? "text-destructive hover:text-destructive" : "text-success hover:text-success")}
                          onClick={() => handleToggleActive(u)}
                          disabled={isSelf(u) || busyUserId === u.id}
                          title={u.isActive ? "Deactivate account" : "Reactivate account"}
                          aria-label={u.isActive ? "Deactivate account" : "Reactivate account"}
                        >
                          {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

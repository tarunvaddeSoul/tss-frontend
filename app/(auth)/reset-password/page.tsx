"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Shield, Lock, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { ApiError } from "@/components/ui/api-error"
import { motion } from "framer-motion"
import { getErrorMessage } from "@/services/api"

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: ResetPasswordFormValues) {
    if (!token) {
      setError("Reset token is missing. Please use the link from your email.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await resetPassword({
        resetToken: token,
        newPassword: data.newPassword,
      })
      setSuccess(true)
    } catch (err) {
      setError(getErrorMessage(err))
      console.error("Reset password error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <Card className="border shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Invalid Reset Link</CardTitle>
        </CardHeader>
        <CardContent>
          <ApiError
            title="Invalid Reset Link"
            message="The password reset link is invalid or missing a token. Please request a new password reset."
          />
          <Button variant="outline" asChild className="w-full mt-4">
            <Link href="/forgot-password">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Forgot Password
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Shield className="h-12 w-12 text-primary" />
          </motion.div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">Enter your new password</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <div className="bg-green-500/10 text-green-500 p-4 rounded-lg border border-green-500/20">
              <h3 className="font-medium mb-2">Password Reset Successful!</h3>
              <p className="text-sm">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
            </div>
            <Button asChild className="mt-4">
              <Link href="/login">Go to Login</Link>
            </Button>
          </motion.div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ApiError title="Reset Failed" message={error} />
                </motion.div>
              )}

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t">
        <div className="text-sm text-center text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">
            Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Shield, Lock, ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import { AxiosError } from "axios"
import { toast } from "@/components/ui/use-toast"

// Password validation schema matching backend requirements:
// - 6-20 characters
// - At least one uppercase letter (A-Z)
// - At least one lowercase letter (a-z)
// - At least one number (0-9)
const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .max(20, { message: "Password must be at most 20 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const token = searchParams.get("token")

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Redirect to login after successful reset
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/login")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, router])

  async function onSubmit(data: ResetPasswordFormValues) {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.")
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
      const axiosError = err as AxiosError<{ message?: string; statusCode?: number }>
      const statusCode = axiosError.response?.status
      const errorMessage = axiosError.response?.data?.message || axiosError.message || "Unable to reset password. Please try again."

      // Handle specific error cases
      if (statusCode === 401) {
        const message = "This reset link has expired or is invalid. Please request a new password reset link."
        setError(message)
        toast({
          title: "Invalid Reset Link",
          description: message,
          variant: "destructive",
        })
      } else if (statusCode === 400) {
        // Backend validation error - show the message from API
        setError(errorMessage)
        toast({
          title: "Validation Error",
          description: errorMessage,
          variant: "destructive",
        })
      } else {
        setError(errorMessage)
        toast({
          title: "Reset Password Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show error if no token
  if (!token) {
    return (
      <Card className="w-full border shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Invalid Reset Link</CardTitle>
            <CardDescription className="text-center">
              The password reset link is invalid or missing a token.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Invalid Reset Link:</strong> The password reset link is invalid or missing a token. Please
                request a new password reset.
              </AlertDescription>
            </Alert>
            <Button variant="outline" asChild className="w-full">
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
    <Card className="w-full border shadow-lg">
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
              <Alert className="bg-green-500/10 border-green-500/20">
                <AlertCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-500">
                  <strong>Password Reset Successful!</strong>
                  <p className="mt-1 text-sm">
                    Your password has been reset successfully. You will be redirected to the login page in a few
                    seconds.
                  </p>
                </AlertDescription>
              </Alert>
              <Button asChild className="mt-4">
                <Link href="/login">Go to Login</Link>
              </Button>
            </motion.div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
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
                      <p className="text-xs text-muted-foreground mt-1">
                        Must be 6-20 characters with uppercase, lowercase, and number
                      </p>
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
          <Button variant="outline" asChild className="w-full">
            <Link href="/forgot-password">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Request New Reset Link
            </Link>
          </Button>
        </CardFooter>
      </Card>
  )
}


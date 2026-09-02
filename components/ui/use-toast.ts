"use client"

import type * as React from "react"
import { toast as sonner } from "sonner"

// Thin adapter so the ~25 shadcn style toast() call sites render through Sonner
// (one toast system, auto dismiss, top right) without touching every caller.
type ToastVariant = "default" | "destructive" | "success" | "info"

export interface Toast {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: ToastVariant
  duration?: number
  action?: React.ReactNode
}

interface ToastHandle {
  id: string | number
  dismiss: () => void
  update: (next: Toast) => void
}

function toast({ title, description, variant = "default", duration, action }: Toast): ToastHandle {
  const message = title ?? description ?? ""
  const options = { description: title ? description : undefined, duration, action }
  const id =
    variant === "destructive"
      ? sonner.error(message, options)
      : variant === "success"
        ? sonner.success(message, options)
        : variant === "info"
          ? sonner.info(message, options)
          : sonner(message, options)
  return {
    id,
    dismiss: () => sonner.dismiss(id),
    update: (next: Toast) => {
      sonner.dismiss(id)
      toast(next)
    },
  }
}

function useToast(): { toasts: Toast[]; toast: typeof toast; dismiss: (id?: string | number) => void } {
  return { toasts: [], toast, dismiss: (id?: string | number) => sonner.dismiss(id) }
}

export { useToast, toast }

"use client"

import { useState } from "react"
import type { DragEvent, ChangeEvent } from "react"
import { FileText, UploadCloud, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface FileDropZoneProps {
  id: string
  accept: string
  file: File | null
  onFileChange: (file: File | null) => void
  badges: string[]
  disabled?: boolean
  busyText?: string | null
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileDropZone({ id, accept, file, onFileChange, badges, disabled = false, busyText }: FileDropZoneProps): JSX.Element {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    event.stopPropagation()
    if (disabled) return
    setDragActive(event.type === "dragenter" || event.type === "dragover")
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    event.stopPropagation()
    setDragActive(false)
    if (disabled) return
    const dropped = event.dataTransfer.files?.[0]
    if (dropped) onFileChange(dropped)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const picked = event.target.files?.[0] ?? null
    event.target.value = ""
    onFileChange(picked)
  }

  if (file) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-md border bg-card p-4">
        <div className="flex min-w-0 items-center gap-3">
          <FileText className="h-8 w-8 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
              {busyText ? ` · ${busyText}` : ""}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remove file"
          onClick={() => onFileChange(null)}
          disabled={disabled}
          className="h-8 w-8 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative rounded-md border-2 border-dashed transition-colors duration-200",
        dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
        disabled && "opacity-60",
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Input
        id={id}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <div className="rounded-full bg-muted p-3">
          <UploadCloud className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{dragActive ? "Drop the file here" : "Drag a file here or click to choose"}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {badges.map((badge) => (
            <Badge key={badge} variant="outline">
              {badge}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

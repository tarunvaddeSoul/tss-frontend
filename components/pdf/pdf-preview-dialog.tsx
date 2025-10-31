"use client"

import { useEffect, useMemo, useState } from "react"
import { Download, FileText, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PdfPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fileName: string
  // Return a React-PDF <Document/> element. Accepts no args for simplicity; closure captures data.
  // Can be sync or async to support dynamic imports
  renderDocument: () => JSX.Element | Promise<JSX.Element>
  autoGenerate?: boolean
}

export function PdfPreviewDialog({
  open,
  onOpenChange,
  title,
  description,
  fileName,
  renderDocument,
  autoGenerate = true,
}: PdfPreviewDialogProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Cleanup object URL when dialog closes or component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
  }, [pdfUrl])

  // Auto-generate on open
  useEffect(() => {
    if (open && autoGenerate && !pdfUrl && !isGenerating) {
      void handleGenerate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)

      const [{ pdf }] = await Promise.all([import("@react-pdf/renderer")])
      // Handle both sync and async renderDocument functions
      const documentElement = await Promise.resolve(renderDocument())
      const blob = await pdf(documentElement).toBlob()
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (err) {
      console.error("Failed to generate PDF", err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!pdfUrl) {
      await handleGenerate()
    }
    if (!pdfUrl) return
    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[90vw] max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <div className="px-6 pb-4 flex justify-end gap-2">
          <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
            <FileText className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Regenerate"}
          </Button>
        </div>

        <div className="px-6 pb-6">
          <div className="border rounded-md overflow-hidden h-[65vh] bg-white">
            {pdfUrl ? (
              <iframe src={pdfUrl} className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                {isGenerating ? "Generating preview..." : "Click Regenerate to create a preview"}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 gap-2">
          <Button variant="outline" onClick={() => pdfUrl && window.open(pdfUrl, "_blank") } disabled={!pdfUrl}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



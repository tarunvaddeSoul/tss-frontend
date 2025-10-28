"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Eye, Download, Upload, X, FileText, ImageIcon, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { employeeService } from "@/services/employeeService"
import type { IEmployeeDocumentUploads, UpdateEmployeeDocumentUploadsDto } from "@/types/employee"

// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
const ALLOWED_DOCUMENT_TYPES = ["application/pdf"]
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES]

interface FileValidationResult {
  isValid: boolean
  error?: string
}

interface EmployeeDocumentManagerProps {
  employeeId: string
  onDocumentsUpdate?: () => void
}

interface DocumentField {
  key: keyof IEmployeeDocumentUploads
  label: string
  accept: string
}

const documentFields: DocumentField[] = [
  { key: "photo", label: "Photo", accept: "image/*" },
  { key: "aadhaar", label: "Aadhaar Card", accept: "application/pdf,image/*" },
  { key: "panCard", label: "PAN Card", accept: "application/pdf,image/*" },
  { key: "bankPassbook", label: "Bank Passbook", accept: "application/pdf,image/*" },
  { key: "markSheet", label: "Mark Sheet", accept: "application/pdf,image/*" },
  { key: "otherDocument", label: "Other Document", accept: "application/pdf,image/*" },
]

export function EmployeeDocumentManager({ employeeId, onDocumentsUpdate }: EmployeeDocumentManagerProps) {
  const [documents, setDocuments] = useState<IEmployeeDocumentUploads | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")
  const [previewTitle, setPreviewTitle] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({})
  const [otherDocumentRemarks, setOtherDocumentRemarks] = useState("")
  const [hasChanges, setHasChanges] = useState(false)
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null)
  const [previewIsPDF, setPreviewIsPDF] = useState(false)

  // Load documents
  useEffect(() => {
    loadDocuments()
  }, [employeeId])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      const response = await employeeService.getEmployeeDocumentUploads(employeeId)
      setDocuments(response.data)
      setOtherDocumentRemarks(response.data.otherDocumentRemarks || "")
    } catch (error) {
      console.error("Error loading documents:", error)
      toast.error("Failed to load documents")
    } finally {
      setIsLoading(false)
    }
  }

  // Validate file
  const validateFile = (file: File): FileValidationResult => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
      }
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: "Invalid file type. Only images and PDF files are allowed",
      }
    }

    return { isValid: true }
  }

  // Handle file selection
  const handleFileSelect = (documentType: string, file: File | null) => {
    if (file) {
      const validation = validateFile(file)
      if (!validation.isValid) {
        toast.error(validation.error || "Invalid file")
        return
      }
    }

    setSelectedFiles((prev) => ({
      ...prev,
      [documentType]: file,
    }))
    setHasChanges(true)
  }

  // Handle upload/update
  const handleUploadDocuments = async () => {
    try {
      setIsUploading(true)

      const documentData: UpdateEmployeeDocumentUploadsDto = {
        photo: selectedFiles.photo ?? undefined,
        aadhaar: selectedFiles.aadhaar ?? undefined,
        panCard: selectedFiles.panCard ?? undefined,
        bankPassbook: selectedFiles.bankPassbook ?? undefined,
        markSheet: selectedFiles.markSheet ?? undefined,
        otherDocument: selectedFiles.otherDocument ?? undefined,
        otherDocumentRemarks,
      }
      const response = await employeeService.updateEmployeeDocumentUploads(employeeId, documentData)

      setDocuments(response.data)
      setSelectedFiles({})
      setHasChanges(false)
      toast.success("Documents updated successfully!")

      if (onDocumentsUpdate) {
        onDocumentsUpdate()
      }
    } catch (error) {
      console.error("Error uploading documents:", error)
      toast.error("Failed to update documents")
    } finally {
      setIsUploading(false)
    }
  }

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl)
      }
    }
  }, [previewBlobUrl])

  // Handle document preview
  const handlePreview = async (url: string, title: string) => {
    if (!url) {
      toast.error("Document not available")
      return
    }

    try {
      // Fetch the file to check its Content-Type
      const response = await fetch(url)
      if (!response.ok) {
        toast.error("Failed to load document")
        return
      }

      const blob = await response.blob()
      const contentType = response.headers.get("Content-Type") || blob.type

      // Check if it's a PDF based on Content-Type
      const isPDF = contentType.includes("application/pdf") || contentType.includes("pdf")

      if (isPDF) {
        // For PDFs, use blob URL in iframe
        const blobUrl = URL.createObjectURL(blob)
        setPreviewBlobUrl(blobUrl)
        setPreviewUrl(blobUrl)
        setPreviewIsPDF(true)
      } else {
        // For images, use direct URL
        setPreviewUrl(url)
        setPreviewIsPDF(false)
      }

      setPreviewTitle(title)
      setShowPreview(true)
    } catch (error) {
      console.error("Error loading document for preview:", error)
      toast.error("Failed to load document preview")
    }
  }

  const handleClosePreview = () => {
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl)
      setPreviewBlobUrl(null)
    }
    setShowPreview(false)
    setPreviewUrl("")
    setPreviewTitle("")
    setPreviewIsPDF(false)
  }

  // Handle document download
  const handleDownload = async (url: string, filename: string) => {
    if (!url) {
      toast.error("Document not available")
      return
    }

    try {
      await employeeService.downloadEmployeeDocument(url, filename)
      toast.success("Document downloaded successfully!")
    } catch (error) {
      console.error("Error downloading document:", error)
      toast.error("Failed to download document")
    }
  }

  // Get file icon based on type
  const getFileIcon = (filename: string) => {
    const extension = filename?.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  // Check if document exists
  const hasDocument = (documentKey: keyof IEmployeeDocumentUploads) => {
    return documents?.[documentKey] && documents[documentKey] !== ""
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Document Management
            {hasChanges && (
              <Button onClick={handleUploadDocuments} disabled={isUploading} size="sm">
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>File Requirements</AlertTitle>
            <AlertDescription>
              Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB. Allowed formats: PDF, JPEG, PNG, GIF
            </AlertDescription>
          </Alert>
          {documentFields.map((field) => (
            <div key={field.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.key} className="text-sm font-medium">
                  {field.label}
                </Label>
                {hasDocument(field.key) && (
                  <Badge variant="secondary" className="text-xs">
                    Uploaded
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    id={field.key}
                    type="file"
                    accept={field.accept}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      handleFileSelect(field.key, file)
                    }}
                    className="file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>

                {hasDocument(field.key) && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(documents![field.key] as string, field.label)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(documents![field.key] as string, `${employeeId}_${field.key}.pdf`)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {selectedFiles[field.key] && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getFileIcon(selectedFiles[field.key]!.name)}
                  <span>Selected: {selectedFiles[field.key]!.name}</span>
                  <span className="text-xs">
                    ({(selectedFiles[field.key]!.size / 1024).toFixed(2)} KB)
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => handleFileSelect(field.key, null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}

          {/* Other Document Remarks */}
          <div className="space-y-2">
            <Label htmlFor="otherDocumentRemarks" className="text-sm font-medium">
              Other Document Remarks
            </Label>
            <Input
              id="otherDocumentRemarks"
              value={otherDocumentRemarks}
              onChange={(e) => {
                setOtherDocumentRemarks(e.target.value)
                setHasChanges(true)
              }}
              placeholder="Enter remarks for other document"
            />
          </div>

          {/* Current Documents Summary */}
          {documents && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Current Documents</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {documentFields.map((field) => (
                  <div key={field.key} className="flex items-center gap-2 text-sm">
                    {getFileIcon(field.label)}
                    <span className={hasDocument(field.key) ? "text-green-600" : "text-muted-foreground"}>
                      {field.label}
                    </span>
                    {hasDocument(field.key) && (
                      <Badge variant="outline" className="text-xs h-5">
                        ✓
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {previewTitle}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(previewUrl, `${employeeId}_${previewTitle}.pdf`)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </DialogTitle>
            <DialogDescription>Document preview for {employeeId}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-[60vh]">
            {previewUrl && (
              <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg p-4">
                {previewIsPDF ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-[60vh] border rounded"
                    title={previewTitle}
                  />
                ) : (
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt={previewTitle}
                    className="max-w-full max-h-[60vh] object-contain rounded"
                  />
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClosePreview}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Download,
  Edit,
  Building,
  Users,
  Briefcase,
  Heart,
  Shield,
  GraduationCap,
  AlertCircle,
  DollarSign,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react"
import { SalaryCategory, SalaryType } from "@/types/salary"
import { employeeService } from "@/services/employeeService"
import type { Employee, IEmployeeEmploymentHistory } from "@/types/employee"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import { formatDate } from "@/lib/utils"

const DynamicPdfPreviewDialog = dynamic(
  () => import("@/components/pdf/pdf-preview-dialog").then((mod) => ({ default: mod.PdfPreviewDialog })),
  { ssr: false }
)

export default function EmployeeViewPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false)
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string>("")
  const [documentPreviewTitle, setDocumentPreviewTitle] = useState<string>("")
  const [documentPreviewIsPDF, setDocumentPreviewIsPDF] = useState(false)
  const [documentPreviewBlobUrl, setDocumentPreviewBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchEmployee()
  }, [employeeId])

  const fetchEmployee = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await employeeService.getEmployeeById(employeeId)
      setEmployee(response.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch employee"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/employees/edit/${employeeId}`)
  }

  // Handle document preview
  const handleDocumentPreview = async (url: string, title: string) => {
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
        setDocumentPreviewBlobUrl(blobUrl)
        setDocumentPreviewUrl(blobUrl)
        setDocumentPreviewIsPDF(true)
      } else {
        // For images, use direct URL
        setDocumentPreviewUrl(url)
        setDocumentPreviewIsPDF(false)
      }

      setDocumentPreviewTitle(title)
      setDocumentPreviewOpen(true)
    } catch (error) {
      console.error("Error loading document for preview:", error)
      toast.error("Failed to load document preview")
    }
  }

  const handleCloseDocumentPreview = () => {
    if (documentPreviewBlobUrl) {
      URL.revokeObjectURL(documentPreviewBlobUrl)
      setDocumentPreviewBlobUrl(null)
    }
    setDocumentPreviewOpen(false)
    setDocumentPreviewUrl("")
    setDocumentPreviewTitle("")
    setDocumentPreviewIsPDF(false)
  }

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (documentPreviewBlobUrl) {
        URL.revokeObjectURL(documentPreviewBlobUrl)
      }
    }
  }, [documentPreviewBlobUrl])

  const handleDocumentDownload = async (url: string, filename: string) => {
    if (!url) {
      toast.error("Document not available")
      return
    }

    try {
      const response = await fetch(url)
      if (!response.ok) {
        toast.error("Failed to download document")
        return
      }

      const blob = await response.blob()
      const contentType = response.headers.get("Content-Type") || blob.type
      
      // Get file extension from Content-Type or URL
      let extension = ""
      if (contentType.includes("pdf")) {
        extension = ".pdf"
      } else if (contentType.includes("image/jpeg") || contentType.includes("image/jpg")) {
        extension = ".jpg"
      } else if (contentType.includes("image/png")) {
        extension = ".png"
      } else if (contentType.includes("image/gif")) {
        extension = ".gif"
      } else if (contentType.includes("image/webp")) {
        extension = ".webp"
      } else {
        // Try to get extension from URL
        const urlPath = url.split("?")[0] // Remove query params
        const urlExtension = urlPath.substring(urlPath.lastIndexOf("."))
        if (urlExtension && urlExtension.length <= 5) {
          extension = urlExtension
        } else {
          extension = "" // No extension if we can't determine
        }
      }

      // Remove any existing extension from filename and add the correct one
      const filenameWithoutExt = filename.replace(/\.[^/.]+$/, "")
      const finalFilename = extension ? `${filenameWithoutExt}${extension}` : filenameWithoutExt

      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = finalFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
      toast.success("Document downloaded successfully!")
    } catch (error) {
      console.error("Error downloading document:", error)
      toast.error("Failed to download document")
    }
  }

  if (loading) {
    return <EmployeeViewPageSkeleton />
  }

  if (error || !employee) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Employee not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // const formatDate = (dateString: string | undefined) => {
  //   if (!dateString) return "N/A"

  //   // Handle DD-MM-YYYY format
  //   const [day, month, year] = dateString.split('-')
  //   if (day && month && year) {
  //     // Create date using YYYY-MM-DD format (month is 0-based in JS Date)
  //     const date = new Date(`${year}-${month}-${day}`)
  //     return date.toLocaleDateString()
  //   }

  //   // Fallback to original format if the date doesn't match DD-MM-YYYY
  //   return new Date(dateString).toLocaleDateString()
  // }

  const currentEmployment = employee.employmentHistories?.[0]

  return (
    <div className="container mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 shrink-0">
                <AvatarFallback className="text-base sm:text-lg font-semibold bg-primary/10 text-primary">
                  {getInitials(employee.firstName, employee.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                    {employee.title} {employee.firstName} {employee.lastName}
                  </h1>
                  <Badge variant={employee.status === "ACTIVE" ? "default" : "destructive"} className="shrink-0">
                    {employee.status}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Employee ID: {employee.id}</p>
                {currentEmployment && (
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1 shrink-0">
                      <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                      <span className="truncate">{currentEmployment.designationName}</span>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <Building className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                      <span className="truncate">{currentEmployment.companyName}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
              <Button variant="outline" onClick={handleEdit} size="sm" className="w-full sm:w-auto">
                <Edit className="h-4 w-4 sm:mr-2 shrink-0" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              {employee && (
                <Button
                  onClick={() => setPdfPreviewOpen(true)}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 sm:mr-2 shrink-0" />
                  <span className="hidden sm:inline">View & Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="personal" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-sleek">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 h-auto gap-1 p-1">
            <TabsTrigger value="personal" className="flex items-center justify-center gap-2 text-sm px-4 py-2 min-w-[120px] shrink-0 whitespace-nowrap">
              <User className="h-4 w-4 shrink-0" />
              <span>Personal</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center justify-center gap-2 text-sm px-4 py-2 min-w-[120px] shrink-0 whitespace-nowrap">
              <Phone className="h-4 w-4 shrink-0" />
              <span>Contact</span>
            </TabsTrigger>
            <TabsTrigger value="employment" className="flex items-center justify-center gap-2 text-sm px-4 py-2 min-w-[140px] shrink-0 whitespace-nowrap">
              <Briefcase className="h-4 w-4 shrink-0" />
              <span>Employment</span>
            </TabsTrigger>
            <TabsTrigger value="salary" className="flex items-center justify-center gap-2 text-sm px-4 py-2 min-w-[120px] shrink-0 whitespace-nowrap">
              <DollarSign className="h-4 w-4 shrink-0" />
              <span>Salary</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center justify-center gap-2 text-sm px-4 py-2 min-w-[120px] shrink-0 whitespace-nowrap">
              <CreditCard className="h-4 w-4 shrink-0" />
              <span>Financial</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center justify-center gap-2 text-sm px-4 py-2 min-w-[140px] shrink-0 whitespace-nowrap">
              <FileText className="h-4 w-4 shrink-0" />
              <span>Documents</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem icon={<User className="h-4 w-4" />} label="Gender" value={employee.gender} />
                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Date of Birth"
                  value={formatDate(employee.dateOfBirth)}
                />
                <InfoItem icon={<Calendar className="h-4 w-4" />} label="Age" value={employee.age?.toString()} />
                <InfoItem icon={<Heart className="h-4 w-4" />} label="Blood Group" value={employee.bloodGroup} />
                <InfoItem icon={<Users className="h-4 w-4" />} label="Category" value={employee.category} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span>Reference Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem
                  icon={<User className="h-4 w-4" />}
                  label="Reference Name"
                  value={employee.referenceDetails?.referenceName}
                />
                <InfoItem
                  icon={<MapPin className="h-4 w-4" />}
                  label="Reference Address"
                  value={employee.referenceDetails?.referenceAddress}
                />
                <InfoItem
                  icon={<Phone className="h-4 w-4" />}
                  label="Reference Number"
                  value={employee.referenceDetails?.referenceNumber}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact Information Tab */}
        <TabsContent value="contact" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <InfoItem
                    icon={<Phone className="h-4 w-4" />}
                    label="Mobile Number"
                    value={employee.contactDetails?.mobileNumber}
                  />
                  {/* <InfoItem icon={<Mail className="h-4 w-4" />} label="Email" value={employee.email} /> */}
                  <InfoItem
                    icon={<MapPin className="h-4 w-4" />}
                    label="Present Address"
                    value={employee.contactDetails?.presentAddress}
                  />
                </div>
                <div className="space-y-4">
                  <InfoItem icon={<MapPin className="h-4 w-4" />} label="City" value={employee.contactDetails?.city} />
                  <InfoItem
                    icon={<MapPin className="h-4 w-4" />}
                    label="State"
                    value={employee.contactDetails?.state}
                  />
                  <InfoItem
                    icon={<MapPin className="h-4 w-4" />}
                    label="Pincode"
                    value={employee.contactDetails?.pincode?.toString()}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employment Information Tab */}
        <TabsContent value="employment" className="space-y-4 sm:space-y-6">
          <div className="space-y-4 sm:space-y-6">
            {(() => {
              const currentEmployment = employee.employmentHistories?.find(
                (h: IEmployeeEmploymentHistory) => h.status === "ACTIVE"
              );

              return (
                <>
                  {currentEmployment && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                        <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                        <span>Current Employment</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                          <InfoItem
                            icon={<Building className="h-4 w-4" />}
                            label="Company"
                            value={currentEmployment.companyName}
                          />
                          <InfoItem
                            icon={<Briefcase className="h-4 w-4" />}
                            label="Designation"
                            value={currentEmployment.designationName}
                          />
                          <InfoItem
                            icon={<Users className="h-4 w-4" />}
                            label="Department"
                            value={currentEmployment.departmentName}
                          />
                          <InfoItem
                            icon={<Calendar className="h-4 w-4" />}
                            label="Joining Date"
                            value={formatDate(currentEmployment.joiningDate)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                        <span>Employment History</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {employee.employmentHistories && employee.employmentHistories.length > 0 ? (
                        <div className="overflow-x-auto scrollbar-sleek">
                          <Table className="min-w-[1000px]">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="min-w-[120px]">Company</TableHead>
                                <TableHead className="min-w-[120px]">Designation</TableHead>
                                <TableHead className="min-w-[120px]">Department</TableHead>
                                <TableHead className="min-w-[110px]">Joining Date</TableHead>
                                <TableHead className="min-w-[110px]">Leaving Date</TableHead>
                                <TableHead className="min-w-[100px]">Salary Type</TableHead>
                                <TableHead className="min-w-[100px]">Salary Category</TableHead>
                                <TableHead className="min-w-[120px]">Salary Sub Category</TableHead>
                                <TableHead className="min-w-[130px]">Salary</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {employee.employmentHistories.map((history: IEmployeeEmploymentHistory, index: any) => (
                                <TableRow key={index}>
                                  <TableCell className="min-w-[120px]">
                                    <span className="truncate block">{history.companyName}</span>
                                  </TableCell>
                                  <TableCell className="min-w-[120px]">
                                    <span className="truncate block">{history.designationName}</span>
                                  </TableCell>
                                  <TableCell className="min-w-[120px]">
                                    <span className="truncate block">{history.departmentName}</span>
                                  </TableCell>
                                  <TableCell className="min-w-[110px] whitespace-nowrap">{formatDate(history.joiningDate)}</TableCell>
                                  <TableCell className="min-w-[110px] whitespace-nowrap">{history.leavingDate ? formatDate(history.leavingDate) : "Present"}</TableCell>
                                  <TableCell className="min-w-[100px]">
                                    {history.salaryType ? (
                                      <Badge variant="outline" className="text-xs">
                                        {history.salaryType === SalaryType.PER_DAY ? "Per Day" : "Per Month"}
                                      </Badge>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">N/A</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="min-w-[100px]">
                                    {employee.salaryCategory ? (
                                      <Badge variant="outline" className="text-xs">
                                        {employee.salaryCategory}
                                      </Badge>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">N/A</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="min-w-[120px]">
                                    {employee.salarySubCategory ? (
                                      <Badge variant="outline" className="text-xs">
                                        {employee.salarySubCategory}
                                      </Badge>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">N/A</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="min-w-[130px] whitespace-nowrap">
                                    {(() => {
                                      if (history.salaryType === SalaryType.PER_DAY && history.salaryPerDay) {
                                        return <span>₹{history.salaryPerDay.toLocaleString()}/day</span>
                                      }
                                      if (history.salaryType === SalaryType.PER_MONTH && history.salary) {
                                        return <span>₹{history.salary.toLocaleString()}/month</span>
                                      }
                                      if (history.salary) {
                                        return <span>₹{history.salary.toLocaleString()}</span>
                                      }
                                      return <span className="text-muted-foreground">Not specified</span>
                                    })()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No employment history available</p>
                      )}
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </div>
        </TabsContent>

        {/* Salary Information Tab */}
        <TabsContent value="salary" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {/* Salary Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span>Salary Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employee.salaryCategory ? (
                  <>
                    <InfoItem
                      icon={<DollarSign className="h-4 w-4" />}
                      label="Salary Category"
                      value={employee.salaryCategory}
                    />
                    {employee.salarySubCategory && (
                      <InfoItem
                        icon={<DollarSign className="h-4 w-4" />}
                        label="Salary Sub-Category"
                        value={employee.salarySubCategory}
                      />
                    )}
                    {employee.salaryCategory === SalaryCategory.SPECIALIZED && employee.monthlySalary ? (
                      <InfoItem
                        icon={<DollarSign className="h-4 w-4" />}
                        label="Monthly Salary"
                        value={`₹${employee.monthlySalary.toLocaleString()}`}
                      />
                    ) : employee.salaryPerDay ? (
                      <InfoItem
                        icon={<DollarSign className="h-4 w-4" />}
                        label="Rate Per Day"
                        value={`₹${employee.salaryPerDay.toLocaleString()}`}
                      />
                    ) : null}
                    <div className="flex items-center gap-4 pt-2 border-t">
                      <div className="flex items-center gap-2">
                        {employee.pfEnabled ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm">PF Enabled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {employee.esicEnabled ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm">ESIC Enabled</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Salary information not configured</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Information Tab */}
        <TabsContent value="financial" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span>Banking Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem
                  icon={<Building className="h-4 w-4" />}
                  label="Bank Name"
                  value={employee.bankDetails?.bankName}
                />
                <InfoItem
                  icon={<CreditCard className="h-4 w-4" />}
                  label="Account Number"
                  value={employee.bankDetails?.bankAccountNumber}
                />
                <InfoItem
                  icon={<FileText className="h-4 w-4" />}
                  label="IFSC Code"
                  value={employee.bankDetails?.ifscCode}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span>Government Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem
                  icon={<FileText className="h-4 w-4" />}
                  label="PF UAN Number"
                  value={employee.additionalDetails?.pfUanNumber}
                />
                <InfoItem
                  icon={<FileText className="h-4 w-4" />}
                  label="ESIC Number"
                  value={employee.additionalDetails?.esicNumber}
                />
                <InfoItem
                  icon={<Shield className="h-4 w-4" />}
                  label="Police Verification"
                  value={employee.additionalDetails?.policeVerificationNumber}
                />
                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Police Verification Date"
                  value={formatDate(employee.additionalDetails?.policeVerificationDate)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span>Training & Medical</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem
                  icon={<GraduationCap className="h-4 w-4" />}
                  label="Training Certificate"
                  value={employee.additionalDetails?.trainingCertificateNumber}
                />
                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Training Date"
                  value={formatDate(employee.additionalDetails?.trainingCertificateDate)}
                />
                <InfoItem
                  icon={<Heart className="h-4 w-4" />}
                  label="Medical Certificate"
                  value={employee.additionalDetails?.medicalCertificateNumber}
                />
                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Medical Date"
                  value={formatDate(employee.additionalDetails?.medicalCertificateDate)}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                <span>Document Uploads</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {employee.documentUploads ? (
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(employee.documentUploads)
                    // Only include allowed keys
                    .filter(([key]) =>
                      [
                        "photo",
                        "aadhaar",
                        "panCard",
                        "bankPassbook",
                        "markSheet",
                        "otherDocument",
                        "otherDocumentRemarks",
                      ].includes(key),
                    )
                    .map(([key, value]) => (
                      <div key={key} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                        </div>
                        {value ? (
                          key === "otherDocumentRemarks" ? (
                            <span className="text-gray-700 text-sm">{value as string}</span>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDocumentPreview(typeof value === "string" ? value : "", key.replace(/([A-Z])/g, " $1").trim())}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Document
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDocumentDownload(typeof value === "string" ? value : "", `${employee.id}_${key}`)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        ) : (
                          <span className="text-muted-foreground text-sm">Not uploaded</span>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No documents uploaded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* PDF Preview Dialog */}
      {employee && (
        <DynamicPdfPreviewDialog
          open={pdfPreviewOpen}
          onOpenChange={setPdfPreviewOpen}
          title={`Employee Profile - ${employee.firstName} ${employee.lastName}`}
          description={`Employee ID: ${employee.id}`}
          fileName={`employee-${employee.firstName}-${employee.lastName}.pdf`}
          renderDocument={async () => {
            const { default: EmployeeViewPDF } = await import("./employee-view-pdf")
            return <EmployeeViewPDF employee={employee} />
          }}
        />
      )}

      {/* Document Preview Dialog */}
      <Dialog open={documentPreviewOpen} onOpenChange={handleCloseDocumentPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4 border-b shrink-0">
            <div>
              <DialogTitle>{documentPreviewTitle}</DialogTitle>
              <DialogDescription>Document preview for {employee?.id}</DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (documentPreviewUrl) {
                  // Get the document type from the preview URL
                  try {
                    const response = await fetch(documentPreviewUrl)
                    const blob = await response.blob()
                    const contentType = response.headers.get("Content-Type") || blob.type
                    
                    let extension = ""
                    if (contentType.includes("pdf")) {
                      extension = ".pdf"
                    } else if (contentType.includes("image/jpeg") || contentType.includes("image/jpg")) {
                      extension = ".jpg"
                    } else if (contentType.includes("image/png")) {
                      extension = ".png"
                    } else if (contentType.includes("image/gif")) {
                      extension = ".gif"
                    } else if (contentType.includes("image/webp")) {
                      extension = ".webp"
                    } else {
                      const urlPath = documentPreviewUrl.split("?")[0]
                      const urlExtension = urlPath.substring(urlPath.lastIndexOf("."))
                      if (urlExtension && urlExtension.length <= 5) {
                        extension = urlExtension
                      }
                    }
                    
                    const filenameWithoutExt = `${employee?.id}_${documentPreviewTitle}`.replace(/\.[^/.]+$/, "")
                    const finalFilename = extension ? `${filenameWithoutExt}${extension}` : filenameWithoutExt
                    handleDocumentDownload(documentPreviewUrl, finalFilename)
                  } catch (error) {
                    // Fallback to original filename if detection fails
                    handleDocumentDownload(documentPreviewUrl, `${employee?.id}_${documentPreviewTitle}`)
                  }
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-hidden px-6 pb-6">
            {documentPreviewUrl && (
              <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg p-4">
                {documentPreviewIsPDF ? (
                  <iframe
                    src={documentPreviewUrl}
                    className="w-full h-full min-h-[60vh] border rounded"
                    title={documentPreviewTitle}
                  />
                ) : (
                  <img
                    src={documentPreviewUrl}
                    alt={documentPreviewTitle}
                    className="max-w-full max-h-[70vh] object-contain rounded"
                  />
                )}
              </div>
            )}
          </div>

          <DialogFooter className="px-6 pb-6 shrink-0 border-t pt-4">
            <Button variant="outline" onClick={handleCloseDocumentPreview}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmployeeViewPageSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="h-10 w-24 bg-muted rounded animate-pulse" />
              <div className="h-10 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Skeleton */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value?: string | null
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start space-x-2 sm:space-x-3 min-w-0">
      <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm sm:text-base text-foreground break-words">{value || "N/A"}</p>
      </div>
    </div>
  )
}

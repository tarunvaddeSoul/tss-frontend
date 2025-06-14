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
  Loader2,
} from "lucide-react"
import { employeeService } from "@/services/employeeService"
import type { Employee, IEmployeeEmploymentHistory } from "@/types/employee"
import { toast } from "sonner"
import { PDFDownloadLink } from "@react-pdf/renderer"
import EmployeeViewPDF from "./employee-view-pdf"
import { formatDate } from "@/lib/utils"

export default function EmployeeViewPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                  {getInitials(employee.firstName, employee.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-foreground">
                    {employee.title} {employee.firstName} {employee.lastName}
                  </h1>
                  <Badge variant={employee.status === "ACTIVE" ? "default" : "destructive"}>{employee.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Employee ID: {employee.id}</p>
                {currentEmployment && (
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{currentEmployment.designationName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span>{currentEmployment.companyName}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {employee && (
                <PDFDownloadLink
                  document={<EmployeeViewPDF employee={employee} />}
                  fileName={`employee-${employee.firstName}-${employee.lastName}.pdf`}
                >
                  {({ loading: pdfLoading }) => (
                    <Button disabled={pdfLoading}>
                      {pdfLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      {pdfLoading ? "Generating..." : "Download PDF"}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
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
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
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
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
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
        <TabsContent value="employment">
          <div className="space-y-6">
            {currentEmployment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5" />
                    <span>Current Employment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
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
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Employment History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employee.employmentHistories && employee.employmentHistories.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Joining Date</TableHead>
                        <TableHead>Leaving Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.employmentHistories.map((history: IEmployeeEmploymentHistory, index: any) => (
                        <TableRow key={index}>
                          <TableCell>{history.companyName}</TableCell>
                          <TableCell>{history.designationName}</TableCell>
                          <TableCell>{history.departmentName}</TableCell>
                          <TableCell>₹{history.salary?.toLocaleString()}</TableCell>
                          <TableCell>{formatDate(history.joiningDate)}</TableCell>
                          <TableCell>{history.leavingDate ? formatDate(history.leavingDate) : "Present"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No employment history available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Information Tab */}
        <TabsContent value="financial">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
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
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
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
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
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
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Document Uploads</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {employee.documentUploads ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={typeof value === "string" ? value : undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Document
                              </a>
                            </Button>
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
    <div className="flex items-start space-x-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value || "N/A"}</p>
      </div>
    </div>
  )
}

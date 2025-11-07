"use client"

import { useState } from "react"
import { X, Download, User, Phone, MapPin, Calendar, CreditCard, DollarSign, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { SalaryCategory, SalaryType } from "@/types/salary"
import { Alert, AlertDescription } from "@/components/ui/alert"
import dynamic from "next/dynamic"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import type { Employee, IEmployeeEmploymentHistory } from "@/types/employee"
import { EmployeeDocumentManager } from "@/components/employees/employee-document-manager"

const DynamicPdfPreviewDialog = dynamic(
  () => import("@/components/pdf/pdf-preview-dialog").then((mod) => ({ default: mod.PdfPreviewDialog })),
  { ssr: false }
)

interface EmployeeViewDialogProps {
  employee: Employee
  isOpen: boolean
  onClose: () => void
}

export function EmployeeViewDialog({ employee, isOpen, onClose }: EmployeeViewDialogProps) {
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {employee.firstName} {employee.lastName}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">{employee.designationName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPdfPreviewOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              View & Download PDF
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="shrink-0 px-6 pt-4">
            <TabsList>
              <TabsTrigger value="details">Employee Details</TabsTrigger>
              <TabsTrigger value="employment">Employment History</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-sleek px-6 pb-6">
            <TabsContent value="details" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">
                          {employee.title} {employee.firstName} {employee.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={employee.status === "ACTIVE" ? "default" : "secondary"}>
                          {employee.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">{employee.dateOfBirth || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="font-medium">{employee.gender || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Blood Group</p>
                        <p className="font-medium">{employee.bloodGroup || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium">{employee.category || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Father's Name</p>
                        <p className="font-medium">{employee.fatherName || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mother's Name</p>
                        <p className="font-medium">{employee.motherName || "Not specified"}</p>
                      </div>
                      {employee.gender === "FEMALE" && employee.husbandName && (
                        <div>
                          <p className="text-sm text-muted-foreground">Husband's Name</p>
                          <p className="font-medium">{employee.husbandName}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Mobile Number</p>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {employee.contactDetails?.mobileNumber || employee.mobileNumber || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Aadhaar Number</p>
                      <p className="font-medium">{employee.contactDetails?.aadhaarNumber || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Permanent Address</p>
                      <p className="font-medium flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <span>
                          {employee.contactDetails?.permanentAddress || employee.permanentAddress || "Not specified"}
                          {employee.contactDetails?.city && `, ${employee.contactDetails.city}`}
                          {employee.contactDetails?.state && `, ${employee.contactDetails.state}`}
                          {employee.contactDetails?.pincode && ` - ${employee.contactDetails.pincode}`}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Present Address</p>
                      <p className="font-medium flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <span>
                          {employee.contactDetails?.presentAddress || employee.presentAddress || "Not specified"}
                          {employee.contactDetails?.city && `, ${employee.contactDetails.city}`}
                          {employee.contactDetails?.state && `, ${employee.contactDetails.state}`}
                          {employee.contactDetails?.pincode && ` - ${employee.contactDetails.pincode}`}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Employment Information */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Current Employment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const activeEmployment = employee.employmentHistories?.find(
                        (h: IEmployeeEmploymentHistory) => h.status === "ACTIVE"
                      );

                      return (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Company</p>
                            <p className="font-medium">{activeEmployment?.companyName || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Department</p>
                            <p className="font-medium">{activeEmployment?.departmentName || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Designation</p>
                            <p className="font-medium">{activeEmployment?.designationName || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Date of Joining</p>
                            <p className="font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {activeEmployment?.joiningDate || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Recruited By</p>
                            <p className="font-medium">{employee.recruitedBy || "Not specified"}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Salary Information */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Salary Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {employee.salaryCategory ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Salary Category</p>
                          <p className="font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            {employee.salaryCategory}
                            {employee.salarySubCategory && ` - ${employee.salarySubCategory}`}
                          </p>
                        </div>
                        {employee.salaryCategory === SalaryCategory.SPECIALIZED && employee.monthlySalary ? (
                          <div>
                            <p className="text-sm text-muted-foreground">Monthly Salary</p>
                            <p className="font-medium">₹{employee.monthlySalary.toLocaleString()}</p>
                          </div>
                        ) : employee.salaryPerDay ? (
                          <div>
                            <p className="text-sm text-muted-foreground">Rate Per Day</p>
                            <p className="font-medium">₹{employee.salaryPerDay.toLocaleString()}</p>
                          </div>
                        ) : null}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {employee.pfEnabled ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-sm">PF</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {employee.esicEnabled ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-sm">ESIC</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Salary information not configured</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Bank Information */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Bank Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Bank Name</p>
                        <p className="font-medium">
                          {employee.bankDetails?.bankName || employee.bankName || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Account Number</p>
                        <p className="font-medium flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          {employee.bankDetails?.bankAccountNumber || employee.bankAccountNumber || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">IFSC Code</p>
                        <p className="font-medium">
                          {employee.bankDetails?.ifscCode || employee.ifscCode || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bank City</p>
                        <p className="font-medium">
                          {employee.bankDetails?.bankCity || employee.bankCity || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">PF UAN Number</p>
                        <p className="font-medium">
                          {employee.additionalDetails?.pfUanNumber || employee.pfUanNumber || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ESIC Number</p>
                        <p className="font-medium">
                          {employee.additionalDetails?.esicNumber || employee.esicNumber || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="employment" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Employment History</CardTitle>
                  <CardDescription>
                    Complete employment history for {employee.firstName} {employee.lastName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Joining Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.employmentHistories?.length ? (
                        employee.employmentHistories.map((history: IEmployeeEmploymentHistory) => (
                          <TableRow key={history.id}>
                            <TableCell>{history.companyName}</TableCell>
                            <TableCell>{history.designationName}</TableCell>
                            <TableCell>{history.departmentName}</TableCell>
                            <TableCell>{history.joiningDate}</TableCell>
                            <TableCell>{history.leavingDate || "-"}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>₹{history.salary?.toLocaleString() || "-"}</span>
                                {history.salaryType && (
                                  <span className="text-xs text-muted-foreground">
                                    ({history.salaryType === SalaryType.PER_DAY ? "Per Day" : "Per Month"})
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={history.status === "ACTIVE" ? "default" : "secondary"}>
                                {history.status === "ACTIVE" ? "Current" : "Previous"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                            No employment history found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Employee documents and certificates</CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployeeDocumentManager
                    employeeId={employee.id}
                    onDocumentsUpdate={() => {
                      // You can add refresh logic here if needed
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>

      {/* PDF Preview Dialog */}
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
    </Dialog>
  )
}

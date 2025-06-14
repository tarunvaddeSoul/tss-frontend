"use client"

import { X, Download, User, Phone, MapPin, Calendar, CreditCard } from "lucide-react"

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

interface EmployeeViewDialogProps {
  employee: Employee
  isOpen: boolean
  onClose: () => void
}

export function EmployeeViewDialog({ employee, isOpen, onClose }: EmployeeViewDialogProps) {
  const handleDownloadPDF = () => {
    toast.info("PDF download functionality coming soon!")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
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
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mx-6">
            <TabsTrigger value="details">Employee Details</TabsTrigger>
            <TabsTrigger value="employment">Employment History</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 p-6">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-medium">{employee.companyName || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Department</p>
                        <p className="font-medium">{employee.employeeDepartmentName || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Designation</p>
                        <p className="font-medium">{employee.designationName || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Joining</p>
                        <p className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {employee.dateOfJoining || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Salary</p>
                        <p className="font-medium">
                          {employee.salary ? `₹${employee.salary.toLocaleString()}` : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recruited By</p>
                        <p className="font-medium">{employee.recruitedBy || "Not specified"}</p>
                      </div>
                    </div>
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
                            <TableCell>₹{history.salary?.toLocaleString() || "-"}</TableCell>
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
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

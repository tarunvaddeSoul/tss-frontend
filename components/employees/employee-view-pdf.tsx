import { Document, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import type { Employee, IEmployeeEmploymentHistory } from "@/types/employee"
import { BRAND, BrandPage, PdfFooter, PdfHeader, Section, brandStyles } from "@/components/pdf/brand"
import { SalaryCategory, SalaryType } from "@/types/salary"

const styles = StyleSheet.create({
  headerSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: BRAND.colors.softBg,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BRAND.colors.border,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  photoContainer: {
    width: 80,
    height: 80,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    overflow: "hidden",
    marginBottom: 8,
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  column: {
    flexDirection: "column",
    flexGrow: 1,
    flexBasis: 0,
    marginRight: 10,
  },
  columnLast: {
    flexDirection: "column",
    flexGrow: 1,
    flexBasis: 0,
  },
  heading: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#4b5563",
    marginBottom: 2,
  },
  text: {
    fontSize: 9,
    color: "#111827",
  },
  textBold: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  badge: {
    fontSize: 8,
    color: "#ffffff",
    backgroundColor: BRAND.colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  table: {
    width: "100%",
    marginTop: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BRAND.colors.border,
    paddingVertical: 4,
  },
  tableHeader: {
    backgroundColor: BRAND.colors.tableHeaderBg,
    fontWeight: "bold",
  },
  tableCell: {
    fontSize: 8,
    padding: 4,
    flex: 1,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: "bold",
    padding: 4,
    flex: 1,
    color: BRAND.colors.text,
  },
  statusBadge: {
    fontSize: 7,
    color: "#ffffff",
    backgroundColor: "#10b981",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 2,
  },
  statusBadgeInactive: {
    fontSize: 7,
    color: "#ffffff",
    backgroundColor: "#ef4444",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 2,
  },
  emptyText: {
    fontSize: 8,
    color: BRAND.colors.muted,
    fontStyle: "italic",
  },
})

// Helper function to format date
const formatDateString = (dateString?: string | null): string => {
  if (!dateString) return "N/A"
  try {
    // Handle DD-MM-YYYY format
    if (dateString.includes("-") && dateString.split("-").length === 3) {
      const [day, month, year] = dateString.split("-")
      if (day && month && year) {
        return `${day}-${month}-${year}`
      }
    }
    // Try to parse as Date
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
    }
    return dateString
  } catch {
    return dateString
  }
}

// Helper function to check if value exists
const hasValue = (value: any): boolean => {
  return value !== null && value !== undefined && value !== ""
}

// Helper function to get value with fallback
const getValue = (primary: any, fallback: any = null): string => {
  if (hasValue(primary)) return String(primary)
  if (hasValue(fallback)) return String(fallback)
  return "N/A"
}

const EmployeeViewPDF = ({ employee }: { employee: Employee }) => {
  const currentEmployment = employee.employmentHistories?.find(
    (h: IEmployeeEmploymentHistory) => h.status === "ACTIVE"
  )

  const photoUrl = employee.documentUploads?.photo || employee.photo
  const generatedDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return (
    <Document
      title={`Employee Profile - ${employee.firstName} ${employee.lastName}`}
      author={BRAND.name}
      subject="Employee Profile"
      keywords="Tulsyan Security Solutions, Employee, Profile"
    >
      <BrandPage>
        {/* Company Branding Header */}
        <PdfHeader 
          title="Employee Profile" 
          subtitle={`${employee.firstName} ${employee.lastName}`}
        />

        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.textBold}>
                {employee.title || ""} {employee.firstName} {employee.lastName}
              </Text>
              <Text style={styles.heading}>Employee ID: {employee.id}</Text>
              <Text style={styles.text}>{generatedDate}</Text>
            </View>
            {photoUrl && (
              <View style={styles.headerRight}>
                <View style={styles.photoContainer}>
                  <Image src={typeof photoUrl === "string" ? photoUrl : ""} style={styles.photo} />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Personal Information */}
        <Section title="Personal Information">
          <View style={brandStyles.row}>
            <View style={styles.column}>
              <Text style={styles.heading}>Date of Birth</Text>
              <Text style={styles.text}>{formatDateString(employee.dateOfBirth)}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.heading}>Age</Text>
              <Text style={styles.text}>{employee.age || "N/A"}</Text>
            </View>
          </View>
          <View style={brandStyles.row}>
            <View style={styles.column}>
              <Text style={styles.heading}>Gender</Text>
              <Text style={styles.text}>{employee.gender || "N/A"}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.heading}>Blood Group</Text>
              <Text style={styles.text}>{employee.bloodGroup || "N/A"}</Text>
            </View>
          </View>
          {hasValue(employee.fatherName) && (
            <View style={brandStyles.row}>
              <View style={styles.column}>
                <Text style={styles.heading}>Father's Name</Text>
                <Text style={styles.text}>{employee.fatherName}</Text>
              </View>
            </View>
          )}
          {hasValue(employee.motherName) && (
            <View style={brandStyles.row}>
              <View style={styles.column}>
                <Text style={styles.heading}>Mother's Name</Text>
                <Text style={styles.text}>{employee.motherName}</Text>
              </View>
            </View>
          )}
          {hasValue(employee.husbandName) && (
            <View style={brandStyles.row}>
              <View style={styles.column}>
                <Text style={styles.heading}>Husband's Name</Text>
                <Text style={styles.text}>{employee.husbandName}</Text>
              </View>
            </View>
          )}
          {hasValue(employee.category) && (
            <View style={brandStyles.row}>
              <View style={styles.column}>
                <Text style={styles.heading}>Category</Text>
                <Text style={styles.text}>{employee.category}</Text>
              </View>
            </View>
          )}
        </Section>

        {/* Contact Details */}
        {(hasValue(employee.contactDetails?.mobileNumber) ||
          hasValue(employee.mobileNumber) ||
          hasValue(employee.contactDetails?.aadhaarNumber) ||
          hasValue(employee.aadhaarNumber) ||
          hasValue(employee.contactDetails?.presentAddress) ||
          hasValue(employee.presentAddress) ||
          hasValue(employee.contactDetails?.permanentAddress) ||
          hasValue(employee.permanentAddress) ||
          hasValue(employee.contactDetails?.city) ||
          hasValue(employee.city) ||
          hasValue(employee.contactDetails?.district) ||
          hasValue(employee.district) ||
          hasValue(employee.contactDetails?.state) ||
          hasValue(employee.state) ||
          hasValue(employee.contactDetails?.pincode) ||
          hasValue(employee.pincode)) && (
          <Section title="Contact Details">
            {(hasValue(employee.contactDetails?.mobileNumber) || hasValue(employee.mobileNumber)) && (
              <View style={brandStyles.row}>
                <View style={styles.column}>
                  <Text style={styles.heading}>Mobile Number</Text>
                  <Text style={styles.text}>{getValue(employee.contactDetails?.mobileNumber, employee.mobileNumber)}</Text>
                </View>
                {(hasValue(employee.contactDetails?.aadhaarNumber) || hasValue(employee.aadhaarNumber)) && (
                  <View style={styles.column}>
                    <Text style={styles.heading}>Aadhaar Number</Text>
                    <Text style={styles.text}>{getValue(employee.contactDetails?.aadhaarNumber, employee.aadhaarNumber)}</Text>
                  </View>
                )}
              </View>
            )}
            {(hasValue(employee.contactDetails?.permanentAddress) || hasValue(employee.permanentAddress)) && (
              <View style={brandStyles.row}>
                <View style={styles.column}>
                  <Text style={styles.heading}>Permanent Address</Text>
                  <Text style={styles.text}>{getValue(employee.contactDetails?.permanentAddress, employee.permanentAddress)}</Text>
                </View>
              </View>
            )}
            {(hasValue(employee.contactDetails?.presentAddress) || hasValue(employee.presentAddress)) && (
              <View style={brandStyles.row}>
                <View style={styles.column}>
                  <Text style={styles.heading}>Present Address</Text>
                  <Text style={styles.text}>{getValue(employee.contactDetails?.presentAddress, employee.presentAddress)}</Text>
                </View>
              </View>
            )}
            {((hasValue(employee.contactDetails?.city) || hasValue(employee.city)) ||
              (hasValue(employee.contactDetails?.district) || hasValue(employee.district)) ||
              (hasValue(employee.contactDetails?.state) || hasValue(employee.state)) ||
              (hasValue(employee.contactDetails?.pincode) || hasValue(employee.pincode))) && (
              <View style={brandStyles.row}>
                {(hasValue(employee.contactDetails?.city) || hasValue(employee.city)) && (
                  <View style={styles.column}>
                    <Text style={styles.heading}>City</Text>
                    <Text style={styles.text}>{getValue(employee.contactDetails?.city, employee.city)}</Text>
                  </View>
                )}
                {(hasValue(employee.contactDetails?.district) || hasValue(employee.district)) && (
                  <View style={styles.column}>
                    <Text style={styles.heading}>District</Text>
                    <Text style={styles.text}>{getValue(employee.contactDetails?.district, employee.district)}</Text>
                  </View>
                )}
              </View>
            )}
            {((hasValue(employee.contactDetails?.state) || hasValue(employee.state)) ||
              (hasValue(employee.contactDetails?.pincode) || hasValue(employee.pincode))) && (
              <View style={brandStyles.row}>
                {(hasValue(employee.contactDetails?.state) || hasValue(employee.state)) && (
                  <View style={styles.column}>
                    <Text style={styles.heading}>State</Text>
                    <Text style={styles.text}>{getValue(employee.contactDetails?.state, employee.state)}</Text>
                  </View>
                )}
                {(hasValue(employee.contactDetails?.pincode) || hasValue(employee.pincode)) && (
                  <View style={styles.column}>
                    <Text style={styles.heading}>Pincode</Text>
                    <Text style={styles.text}>{getValue(employee.contactDetails?.pincode, employee.pincode)}</Text>
                  </View>
                )}
              </View>
            )}
          </Section>
        )}

        {/* Current Employment Information */}
        {currentEmployment && (
          <Section title="Current Employment Information">
            <View style={brandStyles.row}>
              <View style={styles.column}>
                <Text style={styles.heading}>Company Name</Text>
                <Text style={styles.text}>{getValue(currentEmployment.companyName, employee.companyName)}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.heading}>Designation</Text>
                <Text style={styles.text}>{getValue(currentEmployment.designationName, employee.designationName)}</Text>
              </View>
            </View>
            <View style={brandStyles.row}>
              <View style={styles.column}>
                <Text style={styles.heading}>Department</Text>
                <Text style={styles.text}>{getValue(currentEmployment.departmentName, employee.employeeDepartmentName)}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.heading}>Joining Date</Text>
                <Text style={styles.text}>{formatDateString(getValue(currentEmployment.joiningDate, employee.dateOfJoining))}</Text>
              </View>
            </View>
            <View style={brandStyles.row}>
              <View style={styles.column}>
                <Text style={styles.heading}>Status</Text>
                <Text style={styles.statusBadge}>{currentEmployment.status || employee.status || "N/A"}</Text>
              </View>
              {hasValue(employee.recruitedBy) && (
                <View style={styles.column}>
                  <Text style={styles.heading}>Recruited By</Text>
                  <Text style={styles.text}>{employee.recruitedBy}</Text>
                </View>
              )}
            </View>
          </Section>
        )}

        {/* Salary Information */}
        {employee.salaryCategory && (
          <Section title="Salary Information">
            <View style={brandStyles.row}>
              <View style={styles.column}>
                <Text style={styles.heading}>Salary Category</Text>
                <Text style={styles.text}>{employee.salaryCategory}</Text>
              </View>
              {employee.salarySubCategory && (
                <View style={styles.column}>
                  <Text style={styles.heading}>Salary Sub-Category</Text>
                  <Text style={styles.text}>{employee.salarySubCategory}</Text>
                </View>
              )}
            </View>
            {employee.salaryCategory === SalaryCategory.SPECIALIZED && employee.monthlySalary ? (
              <View style={brandStyles.row}>
                <View style={styles.column}>
                  <Text style={styles.heading}>Monthly Salary</Text>
                  <Text style={styles.text}>₹{employee.monthlySalary.toLocaleString()}</Text>
                </View>
              </View>
            ) : employee.salaryPerDay ? (
              <View style={brandStyles.row}>
                <View style={styles.column}>
                  <Text style={styles.heading}>Per Day Rate</Text>
                  <Text style={styles.text}>₹{employee.salaryPerDay.toLocaleString()}</Text>
                </View>
              </View>
            ) : null}
            <View style={brandStyles.row}>
              <View style={styles.column}>
                <Text style={styles.heading}>PF Enabled</Text>
                <Text style={styles.text}>{employee.pfEnabled ? "Yes" : "No"}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.heading}>ESIC Enabled</Text>
                <Text style={styles.text}>{employee.esicEnabled ? "Yes" : "No"}</Text>
              </View>
            </View>
          </Section>
        )}

        {/* Bank Details */}
        {(hasValue(employee.bankDetails?.bankName) ||
          hasValue(employee.bankName) ||
          hasValue(employee.bankDetails?.bankAccountNumber) ||
          hasValue(employee.bankAccountNumber) ||
          hasValue(employee.bankDetails?.ifscCode) ||
          hasValue(employee.ifscCode) ||
          hasValue(employee.bankDetails?.bankCity) ||
          hasValue(employee.bankCity) ||
          hasValue(employee.additionalDetails?.pfUanNumber) ||
          hasValue(employee.pfUanNumber) ||
          hasValue(employee.additionalDetails?.esicNumber) ||
          hasValue(employee.esicNumber)) && (
          <Section title="Bank Details">
            {(hasValue(employee.bankDetails?.bankName) || hasValue(employee.bankName)) && (
              <View style={brandStyles.row}>
                <View style={styles.column}>
                  <Text style={styles.heading}>Bank Name</Text>
                  <Text style={styles.text}>{getValue(employee.bankDetails?.bankName, employee.bankName)}</Text>
                </View>
                {(hasValue(employee.bankDetails?.bankAccountNumber) || hasValue(employee.bankAccountNumber)) && (
                  <View style={styles.column}>
                    <Text style={styles.heading}>Account Number</Text>
                    <Text style={styles.text}>{getValue(employee.bankDetails?.bankAccountNumber, employee.bankAccountNumber)}</Text>
                  </View>
                )}
              </View>
            )}
            {((hasValue(employee.bankDetails?.ifscCode) || hasValue(employee.ifscCode)) ||
              (hasValue(employee.bankDetails?.bankCity) || hasValue(employee.bankCity))) && (
              <View style={brandStyles.row}>
                {(hasValue(employee.bankDetails?.ifscCode) || hasValue(employee.ifscCode)) && (
                  <View style={styles.column}>
                    <Text style={styles.heading}>IFSC Code</Text>
                    <Text style={styles.text}>{getValue(employee.bankDetails?.ifscCode, employee.ifscCode)}</Text>
                  </View>
                )}
                {(hasValue(employee.bankDetails?.bankCity) || hasValue(employee.bankCity)) && (
                  <View style={styles.column}>
                    <Text style={styles.heading}>Bank City</Text>
                    <Text style={styles.text}>{getValue(employee.bankDetails?.bankCity, employee.bankCity)}</Text>
                  </View>
                )}
              </View>
            )}
            {((hasValue(employee.additionalDetails?.pfUanNumber) || hasValue(employee.pfUanNumber)) ||
              (hasValue(employee.additionalDetails?.esicNumber) || hasValue(employee.esicNumber))) && (
              <View style={brandStyles.row}>
                {(hasValue(employee.additionalDetails?.pfUanNumber) || hasValue(employee.pfUanNumber)) && (
                  <View style={styles.column}>
                    <Text style={styles.heading}>PF UAN Number</Text>
                    <Text style={styles.text}>{getValue(employee.additionalDetails?.pfUanNumber, employee.pfUanNumber)}</Text>
                  </View>
                )}
                {(hasValue(employee.additionalDetails?.esicNumber) || hasValue(employee.esicNumber)) && (
                  <View style={styles.column}>
                    <Text style={styles.heading}>ESIC Number</Text>
                    <Text style={styles.text}>{getValue(employee.additionalDetails?.esicNumber, employee.esicNumber)}</Text>
                  </View>
                )}
              </View>
            )}
          </Section>
        )}

        {/* Educational Qualifications */}
        {hasValue(employee.highestEducationQualification) && (
          <Section title="Educational Qualifications">
            <View style={brandStyles.row}>
              <View style={styles.column}>
                <Text style={styles.heading}>Highest Education Qualification</Text>
                <Text style={styles.text}>{employee.highestEducationQualification}</Text>
              </View>
            </View>
          </Section>
        )}

        {/* Employment History */}
        {employee.employmentHistories && employee.employmentHistories.length > 0 && (
          <Section title="Employment History">
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableHeaderCell}>Company</Text>
                <Text style={styles.tableHeaderCell}>Designation</Text>
                <Text style={styles.tableHeaderCell}>Department</Text>
                <Text style={styles.tableHeaderCell}>Joining Date</Text>
                <Text style={styles.tableHeaderCell}>Leaving Date</Text>
                <Text style={styles.tableHeaderCell}>Salary</Text>
              </View>
              {employee.employmentHistories.map((history: IEmployeeEmploymentHistory, index: number) => {
                const salaryDisplay =
                  history.salaryType === SalaryType.PER_DAY && history.salaryPerDay
                    ? `₹${history.salaryPerDay.toLocaleString()}/day`
                    : history.salaryType === SalaryType.PER_MONTH && history.salary
                      ? `₹${history.salary.toLocaleString()}/month`
                      : history.salary
                        ? `₹${history.salary.toLocaleString()}`
                        : "N/A"

                return (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{history.companyName || "N/A"}</Text>
                    <Text style={styles.tableCell}>{history.designationName || "N/A"}</Text>
                    <Text style={styles.tableCell}>{history.departmentName || "N/A"}</Text>
                    <Text style={styles.tableCell}>{formatDateString(history.joiningDate)}</Text>
                    <Text style={styles.tableCell}>
                      {history.leavingDate ? formatDateString(history.leavingDate) : "Present"}
                    </Text>
                    <Text style={styles.tableCell}>{salaryDisplay}</Text>
                  </View>
                )
              })}
            </View>
          </Section>
        )}

        {/* Reference Details */}
        {(hasValue(employee.referenceDetails?.referenceName) ||
          hasValue(employee.referenceDetails?.referenceAddress) ||
          hasValue(employee.referenceDetails?.referenceNumber)) && (
          <Section title="Reference Details">
            {hasValue(employee.referenceDetails?.referenceName) && (
              <View style={brandStyles.row}>
                <View style={styles.column}>
                  <Text style={styles.heading}>Reference Name</Text>
                  <Text style={styles.text}>{employee.referenceDetails?.referenceName}</Text>
                </View>
              </View>
            )}
            {hasValue(employee.referenceDetails?.referenceAddress) && (
              <View style={brandStyles.row}>
                <View style={styles.column}>
                  <Text style={styles.heading}>Reference Address</Text>
                  <Text style={styles.text}>{employee.referenceDetails?.referenceAddress}</Text>
                </View>
              </View>
            )}
            {hasValue(employee.referenceDetails?.referenceNumber) && (
              <View style={brandStyles.row}>
                <View style={styles.column}>
                  <Text style={styles.heading}>Reference Contact Number</Text>
                  <Text style={styles.text}>{employee.referenceDetails?.referenceNumber}</Text>
                </View>
              </View>
            )}
          </Section>
        )}

        {/* Documents & Certificates */}
        {(hasValue(employee.additionalDetails?.policeVerificationNumber) ||
          hasValue(employee.additionalDetails?.policeVerificationDate) ||
          hasValue(employee.additionalDetails?.trainingCertificateNumber) ||
          hasValue(employee.additionalDetails?.trainingCertificateDate) ||
          hasValue(employee.additionalDetails?.medicalCertificateNumber) ||
          hasValue(employee.additionalDetails?.medicalCertificateDate)) && (
          <Section title="Documents & Certificates">
            {(hasValue(employee.additionalDetails?.policeVerificationNumber) ||
              hasValue(employee.additionalDetails?.policeVerificationDate)) && (
              <View style={brandStyles.row}>
                {hasValue(employee.additionalDetails?.policeVerificationNumber) && (
                  <View style={styles.column}>
                    <Text style={styles.heading}>Police Verification Number</Text>
                    <Text style={styles.text}>{employee.additionalDetails?.policeVerificationNumber}</Text>
                  </View>
                )}
                {hasValue(employee.additionalDetails?.policeVerificationDate) && (
                  <View style={styles.column}>
                    <Text style={styles.heading}>Police Verification Date</Text>
                    <Text style={styles.text}>
                      {formatDateString(employee.additionalDetails?.policeVerificationDate)}
                    </Text>
                  </View>
                )}
              </View>
            )}
            {(hasValue(employee.additionalDetails?.trainingCertificateNumber) ||
              hasValue(employee.additionalDetails?.trainingCertificateDate)) && (
              <View style={brandStyles.row}>
                {hasValue(employee.additionalDetails?.trainingCertificateNumber) && (
                  <View style={styles.column}>
                    <Text style={styles.heading}>Training Certificate Number</Text>
                    <Text style={styles.text}>{employee.additionalDetails?.trainingCertificateNumber}</Text>
                  </View>
                )}
                {hasValue(employee.additionalDetails?.trainingCertificateDate) && (
                  <View style={styles.column}>
                    <Text style={styles.heading}>Training Certificate Date</Text>
                    <Text style={styles.text}>
                      {formatDateString(employee.additionalDetails?.trainingCertificateDate)}
                    </Text>
                  </View>
                )}
              </View>
            )}
            {(hasValue(employee.additionalDetails?.medicalCertificateNumber) ||
              hasValue(employee.additionalDetails?.medicalCertificateDate)) && (
              <View style={brandStyles.row}>
                {hasValue(employee.additionalDetails?.medicalCertificateNumber) && (
                  <View style={styles.column}>
                    <Text style={styles.heading}>Medical Certificate Number</Text>
                    <Text style={styles.text}>{employee.additionalDetails?.medicalCertificateNumber}</Text>
                  </View>
                )}
                {hasValue(employee.additionalDetails?.medicalCertificateDate) && (
                  <View style={styles.column}>
                    <Text style={styles.heading}>Medical Certificate Date</Text>
                    <Text style={styles.text}>
                      {formatDateString(employee.additionalDetails?.medicalCertificateDate)}
                    </Text>
                  </View>
                )}
              </View>
            )}
            {/* Document Status */}
            <View style={brandStyles.row}>
              <View style={styles.column}>
                <Text style={styles.heading}>Document Status</Text>
                <Text style={styles.text}>
                  {employee.documentUploads?.photo ||
                  employee.documentUploads?.aadhaar ||
                  employee.documentUploads?.panCard ||
                  employee.documentUploads?.bankPassbook ||
                  employee.documentUploads?.markSheet
                    ? "Available"
                    : "Not Available"}
                </Text>
              </View>
            </View>
          </Section>
        )}

        {/* Additional Information */}
        {(hasValue(employee.employeeOnboardingDate) ||
          hasValue(employee.status) ||
          employee.employmentHistories?.some((h: IEmployeeEmploymentHistory) => h.leavingDate)) && (
          <Section title="Additional Information">
            {hasValue(employee.employeeOnboardingDate) && (
              <View style={brandStyles.row}>
                <View style={styles.column}>
                  <Text style={styles.heading}>Employee Onboarding Date</Text>
                  <Text style={styles.text}>{formatDateString(employee.employeeOnboardingDate)}</Text>
                </View>
              </View>
            )}
            {employee.employmentHistories?.some((h: IEmployeeEmploymentHistory) => h.leavingDate) && (
              <View style={brandStyles.row}>
                <View style={styles.column}>
                  <Text style={styles.heading}>Employee Relieving Date</Text>
                  <Text style={styles.text}>
                    {formatDateString(
                      employee.employmentHistories?.find((h: IEmployeeEmploymentHistory) => h.leavingDate)?.leavingDate
                    )}
                  </Text>
                </View>
              </View>
            )}
            {hasValue(employee.status) && (
              <View style={brandStyles.row}>
                <View style={styles.column}>
                  <Text style={styles.heading}>Status</Text>
                  <Text
                    style={employee.status === "ACTIVE" ? styles.statusBadge : styles.statusBadgeInactive}
                  >
                    {employee.status}
                  </Text>
                </View>
              </View>
            )}
          </Section>
        )}

        <PdfFooter rightNote="Confidential - System Generated Document" />
      </BrandPage>
    </Document>
  )
}

export default EmployeeViewPDF

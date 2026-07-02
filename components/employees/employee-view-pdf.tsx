import { Document, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import type { Employee, IEmployeeEmploymentHistory } from "@/types/employee"
import { BRAND, BrandPage, PdfFooter, PdfHeader, Section, brandStyles } from "@/components/pdf/brand"
import { SalaryCategory, SalaryType } from "@/types/salary"
import { label, formatDate } from "@/lib/labels"

const styles = StyleSheet.create({
  headerSection: {
    marginBottom: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
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
  photoInitials: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND.colors.softBg,
  },
  photoInitialsText: {
    fontFamily: "Archivo",
    fontSize: 24,
    fontWeight: "bold",
    color: BRAND.colors.primary,
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
    fontFamily: "IBMPlexMono",
    fontSize: 7.5,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: BRAND.colors.muted,
    marginBottom: 2,
  },
  text: {
    fontSize: 9,
    color: BRAND.colors.text,
  },
  textBold: {
    fontSize: 10,
    fontWeight: 600,
    color: BRAND.colors.text,
  },
  badge: {
    fontFamily: "IBMPlexMono",
    fontSize: 8,
    fontWeight: 600,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: BRAND.colors.primary,
    borderWidth: 1,
    borderColor: BRAND.colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 2,
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
    borderRightWidth: 1,
    borderRightColor: BRAND.colors.border,
  },
  tableHeaderCell: {
    fontFamily: "IBMPlexMono",
    fontSize: 7,
    fontWeight: 600,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    padding: 4,
    flex: 1,
    color: BRAND.colors.muted,
    borderRightWidth: 1,
    borderRightColor: BRAND.colors.border,
  },
  statusBadge: {
    fontFamily: "IBMPlexMono",
    fontSize: 7,
    fontWeight: 600,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#17693F",
    borderWidth: 1,
    borderColor: "#17693F",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 2,
  },
  statusBadgeInactive: {
    fontFamily: "IBMPlexMono",
    fontSize: 7,
    fontWeight: 600,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: BRAND.colors.primary,
    borderWidth: 1,
    borderColor: BRAND.colors.primary,
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

  const rawPhoto = employee.documentUploads?.photo || employee.photo
  const photoUrl = typeof rawPhoto === "string" && rawPhoto.trim() !== "" ? rawPhoto : ""
  const initials =
    `${(employee.firstName?.[0] ?? "")}${(employee.lastName?.[0] ?? "")}`.toUpperCase() || "?"
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
      keywords="Tulsyan Security Services, Employee, Profile"
    >
      <BrandPage>
        {/* Client Branding Header */}
        <PdfHeader 
          title="Employee Profile" 
          subtitle={`${employee.firstName} ${employee.lastName}`}
        />

        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.textBold}>
                {[employee.title ? label.title(employee.title) : "", employee.firstName, employee.lastName].filter(Boolean).join(" ")}
              </Text>
              <Text style={styles.heading}>Employee ID: {employee.id}</Text>
              <Text style={styles.text}>{generatedDate}</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.photoContainer}>
                {photoUrl ? (
                  <Image src={photoUrl} style={styles.photo} />
                ) : (
                  <View style={styles.photoInitials}>
                    <Text style={styles.photoInitialsText}>{initials}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <Section title="Personal Information">
          <View style={brandStyles.row}>
            <View style={styles.column}>
              <Text style={styles.heading}>Date of Birth</Text>
              <Text style={styles.text}>{formatDate(employee.dateOfBirth)}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.heading}>Age</Text>
              <Text style={styles.text}>{employee.age || "N/A"}</Text>
            </View>
          </View>
          <View style={brandStyles.row}>
            <View style={styles.column}>
              <Text style={styles.heading}>Gender</Text>
              <Text style={styles.text}>{employee.gender ? label.gender(employee.gender) : "N/A"}</Text>
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
                <Text style={styles.text}>{label.category(employee.category)}</Text>
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
                <Text style={styles.heading}>Client Name</Text>
                <Text style={styles.text}>{getValue(currentEmployment.clientName, employee.clientName)}</Text>
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
                <Text style={styles.text}>{formatDate(currentEmployment.joiningDate || employee.dateOfJoining)}</Text>
              </View>
            </View>
            <View style={brandStyles.row}>
              <View style={styles.column}>
                <Text style={styles.heading}>Status</Text>
                <Text
                  style={
                    (currentEmployment.status || employee.status) === "ACTIVE"
                      ? styles.statusBadge
                      : styles.statusBadgeInactive
                  }
                >
                  {label.status(currentEmployment.status || employee.status)}
                </Text>
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
                <Text style={styles.text}>{label.salaryCategory(employee.salaryCategory)}</Text>
              </View>
              {employee.salarySubCategory && (
                <View style={styles.column}>
                  <Text style={styles.heading}>Salary Sub-Category</Text>
                  <Text style={styles.text}>{label.salarySubCategory(employee.salarySubCategory)}</Text>
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
                <Text style={styles.text}>{label.education(employee.highestEducationQualification)}</Text>
              </View>
            </View>
          </Section>
        )}

        {/* Employment History */}
        {employee.employmentHistories && employee.employmentHistories.length > 0 && (
          <Section title="Employment History">
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]} fixed>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Client</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.6 }]}>Designation</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.6 }]}>Department</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.3 }]}>Joining Date</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.3 }]}>Leaving Date</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: "right" }]}>Salary</Text>
              </View>
              {employee.employmentHistories.map((history: IEmployeeEmploymentHistory, index: number) => {
                const salaryDisplay =
                  history.salaryType === SalaryType.PER_DAY && history.salaryPerDay
                    ? `₹${history.salaryPerDay.toLocaleString("en-IN")}/day`
                    : history.salaryType === SalaryType.PER_MONTH && history.salary
                      ? `₹${history.salary.toLocaleString("en-IN")}/month`
                      : history.salary
                        ? `₹${history.salary.toLocaleString("en-IN")}`
                        : "N/A"

                return (
                  <View key={index} style={styles.tableRow} wrap={false}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{history.clientName || "N/A"}</Text>
                    <Text style={[styles.tableCell, { flex: 1.6 }]}>{history.designationName || "N/A"}</Text>
                    <Text style={[styles.tableCell, { flex: 1.6 }]}>{history.departmentName || "N/A"}</Text>
                    <Text style={[styles.tableCell, { flex: 1.3 }]}>{formatDate(history.joiningDate)}</Text>
                    <Text style={[styles.tableCell, { flex: 1.3 }]}>
                      {history.leavingDate ? formatDate(history.leavingDate) : "Present"}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1.5, textAlign: "right" }]}>{salaryDisplay}</Text>
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
                      {formatDate(employee.additionalDetails?.policeVerificationDate)}
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
                      {formatDate(employee.additionalDetails?.trainingCertificateDate)}
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
                      {formatDate(employee.additionalDetails?.medicalCertificateDate)}
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
                  <Text style={styles.text}>{formatDate(employee.employeeOnboardingDate)}</Text>
                </View>
              </View>
            )}
            {employee.employmentHistories?.some((h: IEmployeeEmploymentHistory) => h.leavingDate) && (
              <View style={brandStyles.row}>
                <View style={styles.column}>
                  <Text style={styles.heading}>Employee Relieving Date</Text>
                  <Text style={styles.text}>
                    {formatDate(
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
                    {label.status(employee.status)}
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

import { Document, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { Employee } from "@/types/employee"
import { BRAND, BrandPage, PdfFooter, PdfHeader, Section, brandStyles } from "@/components/pdf/brand"

const styles = StyleSheet.create({
  column: {
    flexDirection: "column",
    flexGrow: 1,
    flexBasis: 0,
    marginRight: 10,
  },
  heading: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4b5563",
    marginBottom: 2,
  },
  text: {
    fontSize: 10,
    color: "#111827",
  },
})

const EmployeeViewPDF = ({ employee }: { employee: Employee }) => (
  <Document
    title={`Employee Profile - ${employee.firstName} ${employee.lastName}`}
    author={BRAND.name}
    subject="Employee Profile"
    keywords="Tulsyan Security Solutions, Employee, Profile"
  >
    <BrandPage>
      <PdfHeader title="Employee Profile" subtitle={`${employee.firstName} ${employee.lastName}`} />

      <Section title="Personal Information">
        <View style={brandStyles.row}>
          <View style={styles.column}>
            <Text style={styles.heading}>Name</Text>
            <Text style={styles.text}>{`${employee.title || ""} ${employee.firstName} ${employee.lastName}`}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.heading}>Employee ID</Text>
            <Text style={styles.text}>{employee.id}</Text>
          </View>
        </View>
        <View style={brandStyles.row}>
          <View style={styles.column}>
            <Text style={styles.heading}>Date of Birth</Text>
            <Text style={styles.text}>{employee.dateOfBirth}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.heading}>Gender</Text>
            <Text style={styles.text}>{employee.gender}</Text>
          </View>
        </View>
        <View style={brandStyles.row}>
          <View style={styles.column}>
            <Text style={styles.heading}>Father's Name</Text>
            <Text style={styles.text}>{employee.fatherName}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.heading}>Mother's Name</Text>
            <Text style={styles.text}>{employee.motherName}</Text>
          </View>
        </View>
        {employee.husbandName && (
          <View style={brandStyles.row}>
            <View style={styles.column}>
              <Text style={styles.heading}>Husband's Name</Text>
              <Text style={styles.text}>{employee.husbandName}</Text>
            </View>
          </View>
        )}
      </Section>

      <Section title="Employment Details">
        <View style={brandStyles.row}>
          <View style={styles.column}>
            <Text style={styles.heading}>Designation</Text>
            <Text style={styles.text}>{employee.designationName}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.heading}>Department</Text>
            <Text style={styles.text}>{employee.employeeDepartmentName}</Text>
          </View>
        </View>
        <View style={brandStyles.row}>
          <View style={styles.column}>
            <Text style={styles.heading}>Company</Text>
            <Text style={styles.text}>{employee.companyName}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.heading}>Date of Joining</Text>
            <Text style={styles.text}>{employee.dateOfJoining}</Text>
          </View>
        </View>
        <View style={brandStyles.row}>
          <View style={styles.column}>
            <Text style={styles.heading}>Recruited By</Text>
            <Text style={styles.text}>{employee.recruitedBy}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.heading}>Salary</Text>
            <Text style={styles.text}>{employee.salary}</Text>
          </View>
        </View>
      </Section>

      <Section title="Contact Information">
        <View style={brandStyles.row}>
          <View style={styles.column}>
            <Text style={styles.heading}>Mobile Number</Text>
            <Text style={styles.text}>{employee.mobileNumber}</Text>
          </View>
        </View>
        <View style={brandStyles.row}>
          <View style={styles.column}>
            <Text style={styles.heading}>Present Address</Text>
            <Text style={styles.text}>{employee.presentAddress}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.heading}>Permanent Address</Text>
            <Text style={styles.text}>{employee.permanentAddress}</Text>
          </View>
        </View>
        <View style={brandStyles.row}>
          <View style={styles.column}>
            <Text style={styles.heading}>City</Text>
            <Text style={styles.text}>{employee.city}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.heading}>District</Text>
            <Text style={styles.text}>{employee.district}</Text>
          </View>
        </View>
        <View style={brandStyles.row}>
          <View style={styles.column}>
            <Text style={styles.heading}>State</Text>
            <Text style={styles.text}>{employee.state}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.heading}>Pincode</Text>
            <Text style={styles.text}>{employee.pincode}</Text>
          </View>
        </View>
      </Section>

      <Section title="Additional Information">
        <View style={brandStyles.row}>
          <View style={styles.column}>
            <Text style={styles.heading}>Category</Text>
            <Text style={styles.text}>{employee.category}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.heading}>Blood Group</Text>
            <Text style={styles.text}>{employee.bloodGroup}</Text>
          </View>
        </View>
        <View style={brandStyles.row}>
          <View style={styles.column}>
            <Text style={styles.heading}>Highest Education</Text>
            <Text style={styles.text}>{employee.highestEducationQualification}</Text>
          </View>
        </View>
      </Section>

      <Section title="Bank Details">
        <View style={brandStyles.row}>
          <View style={styles.column}>
            <Text style={styles.heading}>Bank Name</Text>
            <Text style={styles.text}>{employee.bankName}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.heading}>Account Number</Text>
            <Text style={styles.text}>{employee.bankAccountNumber}</Text>
          </View>
        </View>
        <View style={brandStyles.row}>
          <View style={styles.column}>
            <Text style={styles.heading}>IFSC Code</Text>
            <Text style={styles.text}>{employee.ifscCode}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.heading}>Bank City</Text>
            <Text style={styles.text}>{employee.bankCity}</Text>
          </View>
        </View>
      </Section>

      <Section title="Other Details">
        <View style={brandStyles.row}>
          <View style={styles.column}>
            <Text style={styles.heading}>PF UAN Number</Text>
            <Text style={styles.text}>{employee.pfUanNumber}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.heading}>ESIC Number</Text>
            <Text style={styles.text}>{employee.esicNumber}</Text>
          </View>
        </View>
        <View style={brandStyles.row}>
          <View style={styles.column}>
            <Text style={styles.heading}>Aadhaar Number</Text>
            <Text style={styles.text}>{employee.aadhaarNumber}</Text>
          </View>
        </View>
      </Section>

      <PdfFooter rightNote="This is a computer-generated document" />
    </BrandPage>
  </Document>
)

export default EmployeeViewPDF

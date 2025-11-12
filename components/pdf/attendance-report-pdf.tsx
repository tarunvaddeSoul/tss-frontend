import { Document, Text, View } from "@react-pdf/renderer"
import type { AttendanceRecord } from "@/types/attendance"
import { BRAND, BrandPage, PdfFooter, PdfHeader, Section, brandStyles } from "@/components/pdf/brand"

interface AttendanceReportPDFProps {
  title: string
  month?: string
  records: AttendanceRecord[]
}

const AttendanceReportPDF = ({ title, month, records }: AttendanceReportPDFProps) => {
  return (
    <Document
      title={`${title} - Attendance Report`}
      author={BRAND.name}
      subject="Attendance Report"
      keywords="Tulsyan Security Services, Attendance, Report"
    >
      <BrandPage>
        <PdfHeader title={title} subtitle={month ? `Attendance Report • ${month}` : "Attendance Report"} />

        <Section title="Summary">
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total Employees:</Text>
            <Text style={brandStyles.value}>{records.length}</Text>
          </View>
        </Section>

        <Section title="Details">
          <View style={[brandStyles.table, { marginTop: 0 }]}>
            <View style={[brandStyles.tableRow, brandStyles.tableHeader]}>
              <Text style={[brandStyles.tableHeaderCell, { width: "12%" }]}>Employee ID</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "22%" }]}>Employee Name</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "22%" }]}>Company</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "16%" }]}>Designation</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "16%" }]}>Department</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "12%" }]}>Present</Text>
            </View>

            {records.map((rec) => (
              <View key={`${rec.employeeID}-${rec.companyName}`} style={brandStyles.tableRow}>
                <Text style={[brandStyles.tableCell, { width: "12%" }]}>{rec.employeeID}</Text>
                <Text style={[brandStyles.tableCell, { width: "22%" }]}>{rec.employeeName}</Text>
                <Text style={[brandStyles.tableCell, { width: "22%" }]}>{rec.companyName}</Text>
                <Text style={[brandStyles.tableCell, { width: "16%" }]}>{rec.designationName}</Text>
                <Text style={[brandStyles.tableCell, { width: "16%" }]}>{rec.departmentName}</Text>
                <Text style={[brandStyles.tableCell, { width: "12%", textAlign: "right" }]}>{rec.presentCount}</Text>
              </View>
            ))}
          </View>
        </Section>

        <PdfFooter rightNote="This is a computer-generated report" />
      </BrandPage>
    </Document>
  )
}

export default AttendanceReportPDF



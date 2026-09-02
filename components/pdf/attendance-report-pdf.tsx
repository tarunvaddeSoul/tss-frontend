import { Document, StyleSheet, Text, View } from "@react-pdf/renderer"
import { BRAND, BrandPage, PdfFooter, PdfHeader, Section, brandStyles } from "@/components/pdf/brand"

export interface AttendanceReportRow {
  employeeID: string
  employeeName: string
  designationName: string
  departmentName: string
  presentCount: number
}

export interface AttendanceReportTotals {
  totalEmployees: number
  totalPresent: number
  averageAttendance: number
  minPresent: number
  maxPresent: number
}

interface AttendanceReportPDFProps {
  title: string
  month?: string
  records: AttendanceReportRow[]
  totals?: AttendanceReportTotals
}

const COL = { id: "13%", name: "35%", designation: "22%", department: "20%", present: "10%" }

const styles = StyleSheet.create({
  headerCell: {
    fontFamily: "IBMPlexMono",
    fontSize: 7,
    fontWeight: 600,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: BRAND.colors.muted,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: BRAND.colors.border,
  },
  cell: {
    fontSize: 8,
    color: BRAND.colors.text,
    paddingVertical: 2.5,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: BRAND.colors.border,
  },
  mono: {
    fontFamily: "IBMPlexMono",
    fontSize: 7.5,
  },
})

const summarize = (records: AttendanceReportRow[]): AttendanceReportTotals => {
  const counts = records.map((record) => record.presentCount || 0)
  const totalPresent = counts.reduce((total, count) => total + count, 0)
  return {
    totalEmployees: records.length,
    totalPresent,
    averageAttendance: records.length ? totalPresent / records.length : 0,
    minPresent: counts.length ? Math.min(...counts) : 0,
    maxPresent: counts.length ? Math.max(...counts) : 0,
  }
}

const AttendanceReportPDF = ({ title, month, records, totals }: AttendanceReportPDFProps): JSX.Element => {
  const summary = totals ?? summarize(records)
  const summaryRows: Array<[string, string]> = [
    ["Total Employees", String(summary.totalEmployees)],
    ["Total Present Days", String(summary.totalPresent)],
    ["Average Present Days", summary.averageAttendance.toFixed(1)],
    ["Minimum Present", String(summary.minPresent)],
    ["Maximum Present", String(summary.maxPresent)],
  ]

  return (
    <Document
      title={`${title} - Attendance Report`}
      author={BRAND.name}
      subject="Attendance Report"
      keywords="Tulsyan Security Services, Attendance, Report"
    >
      <BrandPage>
        <PdfHeader title={title} subtitle={month ? `Attendance Report • ${month}` : "Attendance Report"} fixed />

        <Section title="Summary">
          {summaryRows.map(([text, value]) => (
            <View key={text} style={brandStyles.row}>
              <Text style={brandStyles.label}>{text}:</Text>
              <Text style={[brandStyles.value, { fontFamily: "IBMPlexMono", fontSize: 9 }]}>{value}</Text>
            </View>
          ))}
        </Section>

        <Section title="Details">
          <View style={[brandStyles.table, { marginTop: 0 }]}>
            <View style={[brandStyles.tableRow, brandStyles.tableHeader]} fixed>
              <Text style={[styles.headerCell, { width: COL.id }]}>Employee ID</Text>
              <Text style={[styles.headerCell, { width: COL.name }]}>Employee Name</Text>
              <Text style={[styles.headerCell, { width: COL.designation }]}>Designation</Text>
              <Text style={[styles.headerCell, { width: COL.department }]}>Department</Text>
              <Text style={[styles.headerCell, { width: COL.present, textAlign: "right" }]}>Present</Text>
            </View>

            {records.length === 0 ? (
              <View style={brandStyles.tableRow}>
                <Text style={[styles.cell, { width: "100%", textAlign: "center", color: BRAND.colors.muted }]}>
                  No attendance records for this period.
                </Text>
              </View>
            ) : (
              records.map((rec) => (
                <View key={rec.employeeID} style={brandStyles.tableRow} wrap={false}>
                  <Text style={[styles.cell, styles.mono, { width: COL.id }]}>{rec.employeeID || "-"}</Text>
                  <Text style={[styles.cell, { width: COL.name }]}>{rec.employeeName || "-"}</Text>
                  <Text style={[styles.cell, { width: COL.designation }]}>{rec.designationName || "-"}</Text>
                  <Text style={[styles.cell, { width: COL.department }]}>{rec.departmentName || "-"}</Text>
                  <Text style={[styles.cell, styles.mono, { width: COL.present, textAlign: "right" }]}>{rec.presentCount}</Text>
                </View>
              ))
            )}
          </View>
        </Section>

        <PdfFooter rightNote="This is a computer-generated report" />
      </BrandPage>
    </Document>
  )
}

export default AttendanceReportPDF

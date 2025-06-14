import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer"
import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentDateTime, type PayrollReportRecord } from "@/utils/payroll-export"

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 10,
  },
  metadata: {
    fontSize: 9,
    color: "#888888",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000000",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    borderBottomStyle: "solid",
    minHeight: 25,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCell: {
    padding: 4,
    fontSize: 8,
    textAlign: "left",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    borderRightStyle: "solid",
  },
  col1: { width: "12%" }, // Employee ID
  col2: { width: "15%" }, // Company
  col3: { width: "8%" }, // Month
  col4: { width: "10%" }, // Basic Pay
  col5: { width: "10%" }, // Gross
  col6: { width: "10%" }, // Net
  col7: { width: "8%" }, // PF
  col8: { width: "8%" }, // ESIC
  col9: { width: "8%" }, // Bonus
  col10: { width: "11%" }, // Deductions
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderStyle: "solid",
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#666666",
  },
})

interface PayrollReportPDFProps {
  data: PayrollReportRecord[]
  title: string
  totalRecords: number
}

const PayrollReportPDF = ({ data, title, totalRecords }: PayrollReportPDFProps) => {
  // Calculate summary statistics
  const totalGrossSalary = data.reduce((sum, record) => sum + (record.salaryData.grossSalary || 0), 0)
  const totalNetSalary = data.reduce((sum, record) => sum + (record.salaryData.netSalary || 0), 0)
  const totalDeductions = data.reduce((sum, record) => sum + (record.salaryData.totalDeductions || 0), 0)
  const totalPF = data.reduce((sum, record) => sum + (record.salaryData.pf || 0), 0)
  const totalESIC = data.reduce((sum, record) => sum + (record.salaryData.esic || 0), 0)

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Payroll Report</Text>
          <Text style={styles.metadata}>
            Generated on {new Date().toLocaleDateString()} | Total Records: {totalRecords} | Showing: {data.length}{" "}
            records
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.col1]}>Employee ID</Text>
            <Text style={[styles.tableCell, styles.col2]}>Company</Text>
            <Text style={[styles.tableCell, styles.col3]}>Month</Text>
            <Text style={[styles.tableCell, styles.col4]}>Basic Pay</Text>
            <Text style={[styles.tableCell, styles.col5]}>Gross</Text>
            <Text style={[styles.tableCell, styles.col6]}>Net</Text>
            <Text style={[styles.tableCell, styles.col7]}>PF</Text>
            <Text style={[styles.tableCell, styles.col8]}>ESIC</Text>
            <Text style={[styles.tableCell, styles.col9]}>Bonus</Text>
            <Text style={[styles.tableCell, styles.col10]}>Deductions</Text>
          </View>

          {/* Data Rows */}
          {data.map((record, index) => (
            <View key={record.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}>{record.employeeId}</Text>
              <Text style={[styles.tableCell, styles.col2]}>{record.companyName || "N/A"}</Text>
              <Text style={[styles.tableCell, styles.col3]}>{record.month}</Text>
              <Text style={[styles.tableCell, styles.col4]}>₹{(record.salaryData.basicPay || 0).toLocaleString()}</Text>
              <Text style={[styles.tableCell, styles.col5]}>
                ₹{(record.salaryData.grossSalary || 0).toLocaleString()}
              </Text>
              <Text style={[styles.tableCell, styles.col6]}>
                ₹{(record.salaryData.netSalary || 0).toLocaleString()}
              </Text>
              <Text style={[styles.tableCell, styles.col7]}>₹{(record.salaryData.pf || 0).toLocaleString()}</Text>
              <Text style={[styles.tableCell, styles.col8]}>₹{(record.salaryData.esic || 0).toLocaleString()}</Text>
              <Text style={[styles.tableCell, styles.col9]}>₹{(record.salaryData.bonus || 0).toLocaleString()}</Text>
              <Text style={[styles.tableCell, styles.col10]}>
                ₹{(record.salaryData.totalDeductions || 0).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Gross Salary:</Text>
            <Text style={styles.summaryValue}>₹{totalGrossSalary.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Net Salary:</Text>
            <Text style={styles.summaryValue}>₹{totalNetSalary.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Deductions:</Text>
            <Text style={styles.summaryValue}>₹{totalDeductions.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total PF:</Text>
            <Text style={styles.summaryValue}>₹{totalPF.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total ESIC:</Text>
            <Text style={styles.summaryValue}>₹{totalESIC.toLocaleString()}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>This is a computer-generated report. Generated by TSS Payroll System.</Text>
      </Page>
    </Document>
  )
}

interface PayrollReportPDFDownloadButtonProps {
  data: PayrollReportRecord[]
  title: string
  totalRecords: number
  disabled?: boolean
  className?: string
}

export const PayrollReportPDFDownloadButton = ({
  data,
  title,
  totalRecords,
  disabled = false,
  className,
}: PayrollReportPDFDownloadButtonProps) => {
  const fileName = `${title.replace(/\s+/g, "_")}_Payroll_Report_${getCurrentDateTime()}.pdf`

  return (
    <PDFDownloadLink
      document={<PayrollReportPDF data={data} title={title} totalRecords={totalRecords} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <Button variant="outline" disabled={disabled || loading} className={className}>
          <FileDown className="mr-2 h-4 w-4" />
          {loading ? "Generating PDF..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  )
}

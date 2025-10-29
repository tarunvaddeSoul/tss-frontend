import { Document, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer"
import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentDateTime, type PayrollReportRecord } from "@/utils/payroll-export"
import { BRAND, BrandPage, PdfFooter, PdfHeader, Section, brandStyles } from "@/components/pdf/brand"

const styles = StyleSheet.create({
  table: brandStyles.table,
  tableRow: { ...brandStyles.tableRow, minHeight: 22, alignItems: "center" },
  tableHeader: brandStyles.tableHeader,
  tableCell: { ...brandStyles.tableCell, fontSize: 9 },
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
  summaryRow: brandStyles.row,
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
    <Document
      title={`${title} - Payroll Report`}
      author={BRAND.name}
      subject="Payroll Report"
      keywords="Tulsyan Security Solutions, Payroll, Report"
    >
      <BrandPage orientation="landscape">
        <PdfHeader title={title} subtitle={`Payroll Report • Total: ${totalRecords} • Showing: ${data.length}`} />

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
        <Section title="Summary">
          <View style={styles.summaryRow}>
            <Text style={brandStyles.label}>Total Gross Salary:</Text>
            <Text style={brandStyles.value}>₹{totalGrossSalary.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={brandStyles.label}>Total Net Salary:</Text>
            <Text style={brandStyles.value}>₹{totalNetSalary.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={brandStyles.label}>Total Deductions:</Text>
            <Text style={brandStyles.value}>₹{totalDeductions.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={brandStyles.label}>Total PF:</Text>
            <Text style={brandStyles.value}>₹{totalPF.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={brandStyles.label}>Total ESIC:</Text>
            <Text style={brandStyles.value}>₹{totalESIC.toLocaleString()}</Text>
          </View>
        </Section>

        <PdfFooter rightNote="This is a computer-generated report" />
      </BrandPage>
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

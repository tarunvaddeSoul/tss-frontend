import { Document, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer"
import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CompanyPayrollMonth } from "@/types/payroll"
import { BRAND, BrandPage, PdfFooter, PdfHeader, Section, brandStyles } from "@/components/pdf/brand"

function getCurrentDateTime(): string {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, "-").slice(0, 19)
}

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
  monthSection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  monthTitle: {
    fontSize: 12,
    fontWeight: "bold",
  },
  monthStats: {
    fontSize: 9,
    color: "#6b7280",
  },
  table: brandStyles.table,
  tableRow: { ...brandStyles.tableRow, minHeight: 22, alignItems: "center" },
  tableHeader: brandStyles.tableHeader,
  tableCell: { ...brandStyles.tableCell, fontSize: 9 },
  col1: { width: "25%" }, // Employee
  col2: { width: "15%" }, // Basic Pay
  col3: { width: "15%" }, // Gross
  col4: { width: "15%" }, // Net
  col5: { width: "30%" }, // Deductions
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

interface CompanyPayrollPDFProps {
  data: CompanyPayrollMonth[]
  companyName: string
}

const CompanyPayrollPDF = ({ data, companyName }: CompanyPayrollPDFProps) => {
  const totalEmployees = data.reduce((sum, month) => sum + month.employeeCount, 0)
  const totalNetSalary = data.reduce((sum, month) => sum + month.totalNetSalary, 0)

  return (
    <Document
      title={`${companyName} - Payroll Report`}
      author={BRAND.name}
      subject="Company Payroll Report"
      keywords="Tulsyan Security Solutions, Payroll, Company"
    >
      <BrandPage>
        <PdfHeader title={`${companyName} - Payroll Report`} subtitle="Company Payroll Summary" />

        {/* Monthly Data */}
        {data.map((month) => (
          <View key={month.month} style={styles.monthSection}>
            <View style={styles.monthHeader}>
              <Text style={styles.monthTitle}>{month.month}</Text>
              <Text style={styles.monthStats}>
                Employees: {month.employeeCount} | Total Net: ₹{month.totalNetSalary.toLocaleString()}
              </Text>
            </View>

            {/* Employee Details Table */}
            <View style={styles.table}>
              {/* Header Row */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.col1]}>Employee</Text>
                <Text style={[styles.tableCell, styles.col2]}>Basic Pay</Text>
                <Text style={[styles.tableCell, styles.col3]}>Gross Salary</Text>
                <Text style={[styles.tableCell, styles.col4]}>Net Salary</Text>
                <Text style={[styles.tableCell, styles.col5]}>Deductions</Text>
              </View>

              {/* Data Rows */}
              {month.records.map((record) => (
                <View key={record.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.col1]}>
                    {record.employee
                      ? `${record.employee.firstName} ${record.employee.lastName}`
                      : record.employeeId}
                  </Text>
                  <Text style={[styles.tableCell, styles.col2]}>
                    ₹{(record.salaryData.basicPay || 0).toLocaleString()}
                  </Text>
                  <Text style={[styles.tableCell, styles.col3]}>
                    ₹{(record.salaryData.grossSalary || 0).toLocaleString()}
                  </Text>
                  <Text style={[styles.tableCell, styles.col4]}>
                    ₹{(record.salaryData.netSalary || 0).toLocaleString()}
                  </Text>
                  <Text style={[styles.tableCell, styles.col5]}>
                    ₹{(record.salaryData.totalDeductions || 0).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Summary */}
        <Section title="Overall Summary">
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total Months:</Text>
            <Text style={brandStyles.value}>{data.length}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total Employees:</Text>
            <Text style={brandStyles.value}>{totalEmployees}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total Net Salary:</Text>
            <Text style={brandStyles.value}>₹{totalNetSalary.toLocaleString()}</Text>
          </View>
        </Section>

        <PdfFooter rightNote="This is a computer-generated report" />
      </BrandPage>
    </Document>
  )
}

interface CompanyPayrollPDFDownloadButtonProps {
  data: CompanyPayrollMonth[]
  companyName: string
  disabled?: boolean
  className?: string
}

export const CompanyPayrollPDFDownloadButton = ({
  data,
  companyName,
  disabled = false,
  className,
}: CompanyPayrollPDFDownloadButtonProps) => {
  const fileName = `${companyName.replace(/\s+/g, "_")}_Payroll_${getCurrentDateTime()}.pdf`

  return (
    <PDFDownloadLink
      document={<CompanyPayrollPDF data={data} companyName={companyName} />}
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


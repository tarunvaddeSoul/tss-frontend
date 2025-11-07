import { Document, Text, View } from "@react-pdf/renderer"
import type { PayrollReportRecord } from "@/utils/payroll-export"
import { BRAND, BrandPage, PdfFooter, PdfHeader, Section, brandStyles } from "@/components/pdf/brand"

interface PayrollReportPDFProps {
  data: PayrollReportRecord[]
  title: string
  totalRecords: number
  startMonth?: string
  endMonth?: string
}

const PayrollReportPDF = ({ data, title, totalRecords, startMonth, endMonth }: PayrollReportPDFProps) => {
  // Calculate summary statistics
  const totalGrossSalary = data.reduce((sum, record) => sum + (record.salaryData.grossSalary || 0), 0)
  const totalNetSalary = data.reduce((sum, record) => sum + (record.salaryData.netSalary || 0), 0)
  const totalDeductions = data.reduce((sum, record) => sum + (record.salaryData.totalDeductions || 0), 0)
  const totalBasicPay = data.reduce((sum, record) => sum + (record.salaryData.basicPay || 0), 0)
  const totalPF = data.reduce((sum, record) => sum + (record.salaryData.pf || 0), 0)
  const totalESIC = data.reduce((sum, record) => sum + (record.salaryData.esic || 0), 0)
  const totalBonus = data.reduce((sum, record) => sum + (record.salaryData.bonus || 0), 0)

  const periodText = startMonth && endMonth 
    ? `${startMonth} to ${endMonth}`
    : startMonth 
      ? startMonth
      : "All Periods"

  return (
    <Document
      title={`${title} - Payroll Report`}
      author={BRAND.name}
      subject="Payroll Report"
      keywords="Tulsyan Security Solutions, Payroll, Report"
    >
      <BrandPage orientation="landscape">
        <PdfHeader 
          title={`${title} Payroll Report`} 
          subtitle={`Period: ${periodText} • Total Records: ${totalRecords} • Showing: ${data.length}`} 
        />

        {/* Summary Section */}
        <Section title="Summary">
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total Gross Salary:</Text>
            <Text style={brandStyles.value}>₹{totalGrossSalary.toLocaleString("en-IN")}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total Net Salary:</Text>
            <Text style={brandStyles.value}>₹{totalNetSalary.toLocaleString("en-IN")}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total Deductions:</Text>
            <Text style={brandStyles.value}>₹{totalDeductions.toLocaleString("en-IN")}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total Basic Pay:</Text>
            <Text style={brandStyles.value}>₹{totalBasicPay.toLocaleString("en-IN")}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total PF:</Text>
            <Text style={brandStyles.value}>₹{totalPF.toLocaleString("en-IN")}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total ESIC:</Text>
            <Text style={brandStyles.value}>₹{totalESIC.toLocaleString("en-IN")}</Text>
          </View>
          {totalBonus > 0 && (
            <View style={brandStyles.row}>
              <Text style={brandStyles.label}>Total Bonus:</Text>
              <Text style={brandStyles.value}>₹{totalBonus.toLocaleString("en-IN")}</Text>
            </View>
          )}
        </Section>

        {/* Report Data Table */}
        <Section title="Report Data">
          <View style={[brandStyles.table, { marginTop: 0 }]}>
            {/* Header Row */}
            <View style={[brandStyles.tableRow, brandStyles.tableHeader]}>
              <Text style={[brandStyles.tableHeaderCell, { width: "10%" }]}>Employee ID</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "12%" }]}>Company</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "7%" }]}>Month</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "8%" }]}>Category</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "8%" }]}>Rate</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "9%" }]}>Basic Pay</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "10%" }]}>Gross Salary</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "7%" }]}>PF</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "7%" }]}>ESIC</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "10%" }]}>Net Salary</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "9%" }]}>Deductions</Text>
            </View>

            {/* Data Rows */}
            {data.map((record) => {
              const salaryData = record.salaryData as any
              const salaryCategory = salaryData?.salaryCategory || salaryData?.category
              const isSpecialized = salaryCategory === "SPECIALIZED"
              const showPF = salaryData?.pf !== undefined && salaryData?.pf > 0
              const showESIC = salaryData?.esic !== undefined && salaryData?.esic > 0
              
              return (
                <View key={record.id} style={brandStyles.tableRow}>
                  <Text style={[brandStyles.tableCell, { width: "10%" }]}>{record.employeeId}</Text>
                  <Text style={[brandStyles.tableCell, { width: "12%" }]}>{record.companyName || "N/A"}</Text>
                  <Text style={[brandStyles.tableCell, { width: "7%" }]}>{record.month}</Text>
                  <Text style={[brandStyles.tableCell, { width: "8%" }]}>
                    {salaryCategory || "N/A"}
                    {salaryData?.salarySubCategory ? `\n${salaryData.salarySubCategory}` : ""}
                  </Text>
                  <Text style={[brandStyles.tableCell, { width: "8%", textAlign: "right" }]}>
                    {isSpecialized && salaryData?.monthlySalary
                      ? `₹${(salaryData.monthlySalary || 0).toLocaleString("en-IN")}\n/mo`
                      : salaryData?.salaryPerDay
                        ? `₹${(salaryData.salaryPerDay || 0).toLocaleString("en-IN")}\n/day`
                        : salaryData?.wagesPerDay
                          ? `₹${(salaryData.wagesPerDay || 0).toLocaleString("en-IN")}\n/day`
                          : "N/A"}
                  </Text>
                  <Text style={[brandStyles.tableCell, { width: "9%", textAlign: "right" }]}>
                    ₹{(salaryData?.basicPay || 0).toLocaleString("en-IN")}
                </Text>
                  <Text style={[brandStyles.tableCell, { width: "10%", textAlign: "right" }]}>
                    ₹{(salaryData?.grossSalary || 0).toLocaleString("en-IN")}
                  </Text>
                  <Text style={[brandStyles.tableCell, { width: "7%", textAlign: "right" }]}>
                    {showPF ? `₹${(salaryData.pf || 0).toLocaleString("en-IN")}` : "-"}
                  </Text>
                  <Text style={[brandStyles.tableCell, { width: "7%", textAlign: "right" }]}>
                    {showESIC ? `₹${(salaryData.esic || 0).toLocaleString("en-IN")}` : "-"}
                  </Text>
                  <Text style={[brandStyles.tableCell, { width: "10%", textAlign: "right" }]}>
                    ₹{(salaryData?.netSalary || 0).toLocaleString("en-IN")}
                  </Text>
                  <Text style={[brandStyles.tableCell, { width: "9%", textAlign: "right" }]}>
                    ₹{(salaryData?.totalDeductions || 0).toLocaleString("en-IN")}
                  </Text>
                </View>
              )
            })}
          </View>
        </Section>

        <PdfFooter rightNote="This is a computer-generated report" />
      </BrandPage>
    </Document>
  )
}

export default PayrollReportPDF

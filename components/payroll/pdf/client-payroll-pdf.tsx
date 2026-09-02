import { Document, Text, View, PDFDownloadLink } from "@react-pdf/renderer"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ClientPayrollMonth } from "@/types/payroll"
import { formatDate, formatMoney } from "@/lib/labels"
import { downloadFileName } from "@/lib/filenames"
import { BRAND, BrandPage, PdfFooter, PdfHeader, Section, brandStyles } from "@/components/pdf/brand"
import { SalarySlipPDFPage, payrollRecordToSalarySlip } from "@/components/pdf/salary-slip-pdf"

interface ClientDetails {
  address?: string
  contactPersonName?: string
  contactPersonNumber?: string
  clientOnboardingDate?: string
}

interface ClientPayrollPDFProps {
  data: ClientPayrollMonth[]
  clientName: string
  clientDetails?: ClientDetails
}

const ClientPayrollPDF = ({ data, clientName, clientDetails }: ClientPayrollPDFProps): JSX.Element => {
  const totalEmployees = data.reduce((sum, month) => sum + month.employeeCount, 0)
  const totalNetSalary = data.reduce((sum, month) => sum + month.totalNetSalary, 0)

  return (
    <Document
      title={`${clientName} - Payroll Report`}
      author={BRAND.name}
      subject="Client Payroll Report"
      keywords="Tulsyan Security Services, Payroll, Client"
    >
      <BrandPage>
        <PdfHeader title={`${clientName} - Payroll Report`} subtitle="Client Payroll Summary" />

        <Section title="Client Information">
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Client Name:</Text>
            <Text style={brandStyles.value}>{clientName}</Text>
          </View>
          {clientDetails?.address && (
            <View style={brandStyles.row}>
              <Text style={brandStyles.label}>Address:</Text>
              <Text style={brandStyles.value}>{clientDetails.address}</Text>
            </View>
          )}
          {clientDetails?.contactPersonName && (
            <View style={brandStyles.row}>
              <Text style={brandStyles.label}>Contact Person:</Text>
              <Text style={brandStyles.value}>{clientDetails.contactPersonName}</Text>
            </View>
          )}
          {clientDetails?.contactPersonNumber && (
            <View style={brandStyles.row}>
              <Text style={brandStyles.label}>Contact Number:</Text>
              <Text style={[brandStyles.value, { fontFamily: "IBMPlexMono", fontSize: 9 }]}>{clientDetails.contactPersonNumber}</Text>
            </View>
          )}
          {clientDetails?.clientOnboardingDate && (
            <View style={brandStyles.row}>
              <Text style={brandStyles.label}>Onboarding Date:</Text>
              <Text style={brandStyles.value}>{formatDate(clientDetails.clientOnboardingDate)}</Text>
            </View>
          )}
        </Section>

        <Section title="Payroll Summary">
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
            <Text style={[brandStyles.value, { fontFamily: "IBMPlexMono", fontSize: 9 }]}>{formatMoney(totalNetSalary)}</Text>
          </View>
        </Section>

        <PdfFooter rightNote="This is a computer-generated report" />
      </BrandPage>

      {data.flatMap((monthData) =>
        monthData.records.map((record) => (
          <SalarySlipPDFPage
            key={record.id}
            data={payrollRecordToSalarySlip({ ...record, month: record.month || monthData.month }, clientName)}
          />
        )),
      )}
    </Document>
  )
}

interface ClientPayrollPDFDownloadButtonProps {
  data: ClientPayrollMonth[]
  clientName: string
  clientDetails?: ClientDetails
  disabled?: boolean
  className?: string
}

export const ClientPayrollPDFDownloadButton = ({
  data,
  clientName,
  clientDetails,
  disabled = false,
  className,
}: ClientPayrollPDFDownloadButtonProps): JSX.Element => {
  const fileName = downloadFileName(
    "payroll",
    clientName,
    data.map((month) => month.month),
    "pdf",
  )

  return (
    <PDFDownloadLink
      document={<ClientPayrollPDF data={data} clientName={clientName} clientDetails={clientDetails} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <Button variant="outline" size="lg" disabled={disabled || loading} className={`min-w-0 ${className || ""}`}>
          <FileText className="mr-2 h-5 w-5 shrink-0" />
          {loading ? (
            <>
              <span className="hidden sm:inline truncate">Generating PDF...</span>
              <span className="sm:hidden truncate">Generating...</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline truncate">View & Download PDF</span>
              <span className="sm:hidden truncate">PDF</span>
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  )
}

import type { EmployeeTitle, Gender, Category, EducationQualification, Status } from "../enums/employee.enum"

// Interface for Employee
export interface IEmployee {
  id: string
  firstName: string
  lastName: string
  companyName: string
  avatar?: string
  // Add other properties as needed
}

export interface Employee {
  id: string
  employeeId?: string
  title?: EmployeeTitle
  firstName: string
  lastName: string
  avatar?: string
  employeeOnboardingDate?: string
  designationName?: string
  designationId?: string
  employeeDepartmentId?: string
  employeeDepartmentName?: string
  status?: Status | ""
  mobileNumber?: string
  companyName?: string
  companyId?: string
  recruitedBy?: string
  gender?: Gender
  fatherName?: string
  motherName?: string
  husbandName?: string | null
  category?: Category
  dateOfBirth?: string
  age?: number
  dateOfJoining?: string
  highestEducationQualification?: EducationQualification | undefined
  bloodGroup?: string
  permanentAddress?: string
  presentAddress?: string
  city?: string
  district?: string
  state?: string
  pincode?: number
  referenceName?: string
  referenceAddress?: string
  referenceNumber?: string
  bankAccountNumber?: string
  ifscCode?: string
  bankCity?: string
  bankName?: string
  pfUanNumber?: string
  esicNumber?: string
  policeVerificationNumber?: string
  policeVerificationDate?: string
  trainingCertificateNumber?: string
  trainingCertificateDate?: string
  medicalCertificateNumber?: string
  medicalCertificateDate?: string
  photo?: string
  aadhaar?: string
  panCard?: string
  bankPassbook?: string
  markSheet?: string
  otherDocument?: string
  salary?: number
  aadhaarNumber?: string
  contactDetails?: IEmployeeContactInformation
  bankDetails?: IEmployeeBankingInformation
  additionalDetails?: IEmployeeAdditionalDetails
  referenceDetails?: IEmployeeReferenceDetails
  documentUploads?: IEmployeeDocumentUploads
  employmentHistories?: IEmployeeEmploymentHistory | any
  otherDocumentRemarks?: string
}

export interface IEmployeeContactInformation {
  id?: string
  employeeId?: string
  mobileNumber?: string
  aadhaarNumber?: string
  permanentAddress?: string
  presentAddress?: string
  city?: string
  district?: string
  state?: string
  pincode?: string | number
}

export interface IEmployeeBankingInformation {
  id?: string
  employeeId?: string
  bankAccountNumber?: string
  ifscCode?: string
  bankName?: string
  bankCity?: string
}

export interface IEmployeeAdditionalDetails {
  id?: string
  employeeId?: string
  pfUanNumber?: string
  esicNumber?: string
  policeVerificationNumber?: string
  policeVerificationDate?: string
  trainingCertificateNumber?: string
  trainingCertificateDate?: string
  medicalCertificateNumber?: string
  medicalCertificateDate?: string
}

export interface IEmployeeReferenceDetails {
  id?: string
  employeeId?: string
  referenceName?: string
  referenceAddress?: string
  referenceNumber?: string
}

export interface IEmployeeDocumentUploads {
  id?: string
  employeeId?: string
  photo?: string | File
  aadhaar?: string | File
  panCard?: string | File
  bankPassbook?: string | File
  markSheet?: string | File
  otherDocument?: string | File
  otherDocumentRemarks?: string
  createdAt?: string
  updatedAt?: string
}

export interface IEmployeeEmploymentHistory {
  id?: string
  employeeId?: string
  companyName?: string
  designationName?: string
  departmentName?: string
  companyId?: string
  designationId?: string
  departmentId?: string
  salary?: number
  joiningDate?: string
  leavingDate?: string | null
  endDate?: string | null
  status?: string
  isActive?: boolean
  reason?: string
  createdAt?: string
  updatedAt?: string
}

// New DTO interfaces based on the provided DTOs

export interface UpdateEmployeeDto {
  title?: EmployeeTitle
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  gender?: Gender
  fatherName?: string
  motherName?: string
  husbandName?: string
  bloodGroup?: string
  employeeOnboardingDate?: string
  employeeRelievingDate?: string
  status?: Status
  category?: Category
  recruitedBy?: string
  age?: number
}

export interface UpdateEmployeeContactDetailsDto {
  mobileNumber?: string
  aadhaarNumber?: string
  permanentAddress?: string
  presentAddress?: string
  city?: string
  district?: string
  state?: string
  pincode?: number
}

export interface UpdateEmployeeBankDetailsDto {
  bankAccountNumber?: string
  ifscCode?: string
  bankName?: string
  bankCity?: string
}

export interface UpdateEmployeeAdditionalDetailsDto {
  pfUanNumber?: string
  esicNumber?: string
  policeVerificationNumber?: string
  policeVerificationDate?: string
  trainingCertificateNumber?: string
  trainingCertificateDate?: string
  medicalCertificateNumber?: string
  medicalCertificateDate?: string
}

export interface UpdateEmployeeReferenceDetailsDto {
  referenceName?: string
  referenceAddress?: string
  referenceNumber?: string
}

export interface UpdateEmployeeDocumentUploadsDto {
  photo?: File
  aadhaar?: File
  panCard?: File
  bankPassbook?: File
  markSheet?: File
  otherDocument?: File
  otherDocumentRemarks?: string
}

export interface CreateEmploymentHistoryDto {
  employeeId?: string
  companyId: string
  designationId: string
  departmentId: string
  salary: number
  joiningDate: string
  status?: Status
}

export interface UpdateEmploymentHistoryDto {
  companyId?: string
  designationId?: string
  departmentId?: string
  salary?: number
  leavingDate?: string
  status?: Status
}

export interface LeavingDateDto {
  leavingDate: string
}

export interface Designation {
  id: string
  name: string
}

export interface EmployeeDepartments {
  id: string
  name: string
}

export interface Companies {
  id: string
  name: string
  address: string
}

export interface EmployeeFormValues {
  title: EmployeeTitle | ""
  firstName: string
  lastName: string
  mobileNumber: string
  currentCompanyId?: string
  currentCompanyDesignationId?: string
  currentCompanyDepartmentId?: string
  currentCompanySalary?: number
  currentCompanyJoiningDate?: Date | string
  recruitedBy: string
  gender: Gender | ""
  fatherName: string
  motherName: string
  husbandName: string | null
  category: Category | ""
  status: Status | ""
  dateOfBirth: Date
  employeeOnboardingDate: Date
  highestEducationQualification: EducationQualification | ""
  bloodGroup: string
  permanentAddress: string
  presentAddress: string
  city: string
  district: string
  state: string
  pincode: number
  referenceName: string
  referenceAddress: string
  referenceNumber: string
  bankAccountNumber: string
  ifscCode: string
  bankCity: string
  bankName: string
  pfUanNumber: string
  esicNumber: string
  policeVerificationNumber: string
  policeVerificationDate: Date
  trainingCertificateNumber: string
  trainingCertificateDate: Date
  medicalCertificateNumber: string
  medicalCertificateDate: Date
  photo: File | null | undefined | string
  aadhaar: File | null | undefined | string
  panCard: File | null | undefined | string
  bankPassbook: File | null | undefined | string
  markSheet: File | null | undefined | string
  otherDocument: File | null | undefined | string
  otherDocumentRemarks?: string
  // salary: number;
  aadhaarNumber: string
}

export interface EmployeeSearchParams {
  page: number
  limit: number
  searchText?: string
  designationId?: string
  employeeDepartmentId?: string
  companyId?: string
  gender?: string
  category?: string
  highestEducationQualification?: string
  minAge?: number
  maxAge?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  startDate?: string
  endDate?: string
}

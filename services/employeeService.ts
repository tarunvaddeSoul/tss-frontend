import api, { getErrorMessage } from "./api"
import { convertToCustomDateFormat } from "@/lib/utils"

// Types will be imported from types/employee.ts
import type {
  EmployeeFormValues,
  EmployeeSearchParams,
  UpdateEmployeeDto,
  UpdateEmployeeContactDetailsDto,
  UpdateEmployeeBankDetailsDto,
  UpdateEmployeeAdditionalDetailsDto,
  UpdateEmployeeReferenceDetailsDto,
  UpdateEmployeeDocumentUploadsDto,
  CreateEmploymentHistoryDto,
  UpdateEmploymentHistoryDto,
  LeavingDateDto,
} from "@/types/employee"

export const employeeService = {
  // Get all employees with optional search parameters
  async getEmployees(params?: EmployeeSearchParams) {
    try {
      const response = await api.get("/employees", { params })
      // Return the full response including data array and total count
      return response.data
    } catch (error) {
      console.error("Error fetching employees:", error)
      throw new Error(getErrorMessage(error))
    }
  },

  // Get a single employee by ID
  async getEmployeeById(id: string) {
    try {
      const response = await api.get(`/employees/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching employee with ID ${id}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  // Create a new employee
  async createEmployee(employeeData: EmployeeFormValues) {
    try {
      const formData = new FormData()

      // Process form values
      Object.entries(employeeData).forEach(([key, value]) => {
        if (value instanceof Date) {
          formData.append(key, convertToCustomDateFormat(value))
        } else if (value instanceof File) {
          // Only append the file if a file has been selected
          if (value.name) {
            formData.append(key, value)
          }
        } else if (value !== null && value !== undefined) {
          // Append non-null and non-undefined values
          formData.append(key, String(value))
        }
      })

      const response = await api.post("/employees", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      console.error("Error creating employee:", error)
      throw new Error(getErrorMessage(error))
    }
  },

  // Update an employee's basic information
  async updateEmployee(id: string, employeeData: UpdateEmployeeDto) {
    try {
      const response = await api.patch(`/employees/${id}`, employeeData)
      return response.data
    } catch (error) {
      console.error(`Error updating employee with ID ${id}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  // Delete an employee
  async deleteEmployee(id: string) {
    try {
      const response = await api.delete(`/employees/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting employee with ID ${id}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  // Delete multiple employees
  async deleteMultipleEmployees(ids: string[]) {
    try {
      const response = await api.delete("/employees", { data: { ids } })
      return response.data
    } catch (error) {
      console.error("Error deleting multiple employees:", error)
      throw new Error(getErrorMessage(error))
    }
  },

  // Contact Details
  async getEmployeeContactDetails(employeeId: string) {
    try {
      const response = await api.get(`/employees/${employeeId}/contact-details`)
      return response.data
    } catch (error) {
      console.error(`Error fetching contact details for employee ${employeeId}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  async updateEmployeeContactDetails(employeeId: string, contactDetails: UpdateEmployeeContactDetailsDto) {
    try {
      const response = await api.patch(`/employees/${employeeId}/contact-details`, contactDetails)
      return response.data
    } catch (error) {
      console.error(`Error updating contact details for employee ${employeeId}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  // Bank Details
  async getEmployeeBankingInformation(employeeId: string) {
    try {
      const response = await api.get(`/employees/${employeeId}/bank-details`)
      return response.data
    } catch (error) {
      console.error(`Error fetching bank details for employee ${employeeId}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  async updateEmployeeBankingInformation(employeeId: string, bankDetails: UpdateEmployeeBankDetailsDto) {
    try {
      const response = await api.patch(`/employees/${employeeId}/bank-details`, bankDetails)
      return response.data
    } catch (error) {
      console.error(`Error updating bank details for employee ${employeeId}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  // Additional Details
  async getEmployeeAdditionalDetails(employeeId: string) {
    try {
      const response = await api.get(`/employees/${employeeId}/additional-details`)
      return response.data
    } catch (error) {
      console.error(`Error fetching additional details for employee ${employeeId}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  async updateEmployeeAdditionalDetails(employeeId: string, additionalDetails: UpdateEmployeeAdditionalDetailsDto) {
    try {
      const response = await api.patch(`/employees/${employeeId}/additional-details`, additionalDetails)
      return response.data
    } catch (error) {
      console.error(`Error updating additional details for employee ${employeeId}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  // Reference Details
  async getEmployeeReferenceDetails(employeeId: string) {
    try {
      const response = await api.get(`/employees/${employeeId}/reference-details`)
      return response.data
    } catch (error) {
      console.error(`Error fetching reference details for employee ${employeeId}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  async updateEmployeeReferenceDetails(employeeId: string, referenceDetails: UpdateEmployeeReferenceDetailsDto) {
    try {
      const response = await api.patch(`/employees/${employeeId}/reference-details`, referenceDetails)
      return response.data
    } catch (error) {
      console.error(`Error updating reference details for employee ${employeeId}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  // Document Uploads
  async getEmployeeDocuments(employeeId: string) {
    try {
      const response = await api.get(`/employees/${employeeId}/document-uploads`)
      return response.data
    } catch (error) {
      console.error(`Error fetching documents for employee ${employeeId}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  async uploadEmployeeDocument(employeeId: string, document: File, documentType: string) {
    try {
      const formData = new FormData()
      formData.append("document", document)
      formData.append("documentType", documentType)

      const response = await api.patch(`/employees/${employeeId}/document-uploads`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      console.error(`Error uploading document for employee ${employeeId}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  // Get employee documents
  async getEmployeeDocumentUploads(employeeId: string) {
    try {
      const response = await api.get(`/employees/${employeeId}/document-uploads`)
      return response.data
    } catch (error) {
      console.error(`Error fetching document uploads for employee ${employeeId}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  // Update employee documents
  async updateEmployeeDocumentUploads(employeeId: string, documentData: UpdateEmployeeDocumentUploadsDto) {
    try {
      const formData = new FormData()

      // Process document data
      Object.entries(documentData).forEach(([key, value]) => {
        if (value instanceof File) {
          // Only append the file if a file has been selected
          if (value.name) {
            formData.append(key, value)
          }
        } else if (value !== null && value !== undefined) {
          // Append non-null and non-undefined values (like otherDocumentRemarks)
          formData.append(key, String(value))
        }
      })

      const response = await api.patch(`/employees/${employeeId}/document-uploads`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error(`Error updating document uploads for employee ${employeeId}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  // Download document
  async downloadEmployeeDocument(documentUrl: string, filename: string) {
    try {
      const response = await fetch(documentUrl);

      if (!response.ok) {
        throw new Error("Failed to download document");
      }
  
      const blob = await response.blob();
  
      // ✅ Detect mime and extension
      const contentType = response.headers.get("Content-Type") || "application/octet-stream";
      let extension = "";
  
      if (contentType.includes("jpeg")) extension = ".jpg";
      if (contentType.includes("png")) extension = ".png";
      if (contentType.includes("pdf")) extension = ".pdf";
  
      const finalName = filename ? filename + extension : `file${extension}`;
  
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = finalName;
      a.click();
  
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error)
      throw new Error(getErrorMessage(error))
    }
  },

  // Employment History
  async getEmployeeEmploymentHistory(employeeId: string) {
    try {
      const response = await api.get(`/employees/${employeeId}/employment-history`)
      return response.data
    } catch (error) {
      console.error(`Error fetching employment history for employee ${employeeId}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  async createEmploymentHistory(employeeId: string, historyData: CreateEmploymentHistoryDto) {
    try {
      const response = await api.post(`/employees/${employeeId}/employment-history`, historyData)
      return response.data
    } catch (error) {
      console.error(`Error creating employment history for employee ${employeeId}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  async updateEmploymentHistory(id: string, historyData: UpdateEmploymentHistoryDto) {
    try {
      const response = await api.patch(`/employees/employment-history/${id}`, historyData)
      return response.data
    } catch (error) {
      console.error(`Error updating employment history for employee ${id}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  async closeEmployment(employeeId: string, closureData: LeavingDateDto) {
    try {
      const response = await api.patch(`/employees/${employeeId}/close-employment`, closureData)
      return response.data
    } catch (error) {
      console.error(`Error closing employment for employee ${employeeId}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },

  // Get active employment for an employee
  async getActiveEmployment(employeeId: string) {
    try {
      const response = await api.get(`/employees/active/${employeeId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching active employment for employee ${employeeId}:`, error)
      throw new Error(getErrorMessage(error))
    }
  },
}

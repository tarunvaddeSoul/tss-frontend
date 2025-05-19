export interface Attendance {
  id: string
  employeeId: string
  employeeName?: string
  date: string
  checkIn: string
  checkOut?: string
  hours?: number
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY"
  notes?: string
  location?: {
    checkIn?: {
      latitude: number
      longitude: number
    }
    checkOut?: {
      latitude: number
      longitude: number
    }
  }
  createdAt: string
  updatedAt: string
}

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToCustomDateFormat(date: Date): string {
  // Format: YYYY-MM-DD
  return date.toISOString().split("T")[0]
}


export function formatDate(dateString?: string): string {
  if (!dateString) return "N/A"

  try {
    // Handle different date formats
    let date: Date

    // Check if the date is in dd-mm-yyyy format
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split("-").map(Number)
      date = new Date(year, month - 1, day)
    } else {
      date = new Date(dateString)
    }

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return dateString
    }

    // Return formatted date
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch (error) {
    return dateString
  }
}
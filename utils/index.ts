/**
 * Utility function to handle API errors
 */
export function handleApiError(error: any): string {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const statusCode = error.response.status
    const responseData = error.response.data

    if (statusCode === 401) {
      return "Unauthorized. Please login again."
    } else if (statusCode === 403) {
      return "You don't have permission to access this resource."
    } else if (statusCode === 404) {
      return "The requested resource was not found."
    } else if (statusCode === 429) {
      return "Too many requests. Please try again later."
    } else if (responseData && responseData.message) {
      return responseData.message
    } else {
      return "An error occurred. Please try again."
    }
  } else if (error.request) {
    // The request was made but no response was received
    return "No response from server. Please check your internet connection."
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || "An unexpected error occurred. Please try again."
  }
}

/**
 * Utility function to format date
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Utility function to format currency
 */
export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount)
}

/**
 * Utility function to create a delay (useful for testing)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

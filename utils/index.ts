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
      return "Your session has expired. Please log in again."
    } else if (statusCode === 403) {
      return "You do not have permission to do this."
    } else if (statusCode === 404) {
      return "We could not find what you were looking for."
    } else if (statusCode === 429) {
      return "Too many requests. Please wait a minute and try again."
    } else if (responseData && responseData.message) {
      return responseData.message
    } else {
      return "Something went wrong. Please try again."
    }
  } else if (error.code === "ECONNABORTED") {
    // The request timed out
    return "The request took too long. Please try again."
  } else if (error.request) {
    // The request was made but no response was received
    return "Cannot reach the server. Please check your connection and try again."
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || "Something went wrong. Please try again."
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

export function ageFromDateOfBirth(dateOfBirth?: string | Date | null): number | null {
  if (!dateOfBirth) return null
  let dob: Date
  if (dateOfBirth instanceof Date) {
    dob = dateOfBirth
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateOfBirth)) {
    const [day, month, year] = dateOfBirth.split("-").map(Number)
    dob = new Date(year, month - 1, day)
  } else {
    dob = new Date(dateOfBirth)
  }
  if (Number.isNaN(dob.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const beforeBirthday =
    today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  if (beforeBirthday) age -= 1
  return age >= 0 ? age : null
}

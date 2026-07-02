import api, { getErrorMessage } from "./api"
import type { Role } from "@/types/auth"

export interface AdminUser {
  id: string
  name: string
  email: string
  mobileNumber: string
  role: Role
  isActive: boolean
  createdAt: string
  updatedAt: string
  departmentId: string
  department?: { id: string; name: string }
}

export interface UserDepartment {
  id: string
  name: string
}

export interface InviteUserInput {
  name: string
  email: string
  mobileNumber: string
  role: Role
  departmentId: string
}

// Invited users never receive this password; they set their own through the
// emailed reset link. It only has to satisfy the register endpoint's rules.
function generateThrowawayPassword(): string {
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  const body = Array.from(bytes, (b) => "abcdefghjkmnpqrstuvwxyz23456789"[b % 31]).join("")
  return `Xt7${body}`.slice(0, 18)
}

export const userAdminService = {
  async listUsers(): Promise<AdminUser[]> {
    try {
      const response = await api.get<{ data: AdminUser[] }>("/users")
      return response.data.data ?? []
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  async getUserDepartments(): Promise<UserDepartment[]> {
    try {
      const response = await api.get<{ data: UserDepartment[] }>("/departments/user-departments")
      return response.data.data ?? []
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  /**
   * Invite = create the account with a throwaway password, then trigger the
   * reset-password email so the person sets their own password. Returns whether
   * the invite email went out (the account exists either way).
   */
  async inviteUser(input: InviteUserInput): Promise<{ emailSent: boolean }> {
    try {
      await api.post("/users/register", {
        ...input,
        password: generateThrowawayPassword(),
      })
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }

    try {
      await api.post(
        "/users/forgot-password",
        { email: input.email },
        { skipErrorToast: true } as Parameters<typeof api.post>[2],
      )
      return { emailSent: true }
    } catch {
      return { emailSent: false }
    }
  },

  async sendSetPasswordEmail(email: string): Promise<void> {
    try {
      await api.post("/users/forgot-password", { email })
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  async updateRole(userId: string, role: Role): Promise<void> {
    try {
      await api.put(`/users/update/${userId}`, { role })
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  async setActive(userId: string, isActive: boolean): Promise<void> {
    try {
      await api.put(`/users/update/${userId}`, { isActive })
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },
}

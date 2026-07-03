import api, { getErrorMessage } from "./api"
import type { Role } from "@/types/auth"

export interface AdminUser {
  id: string
  name: string
  email: string
  mobileNumber: string
  role: Role
  isActive: boolean
  invitePending?: boolean
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
   * Invite (or re-invite) a user. The backend creates a pending account and
   * emails a set-password link that expires in 72 hours; nobody picks a
   * password for anyone else. Returns resent=true when the account already
   * existed as a pending invite.
   */
  async inviteUser(input: InviteUserInput): Promise<{ resent: boolean }> {
    try {
      const response = await api.post<{ data: { resent?: boolean } }>("/users/invite", input)
      return { resent: response.data.data?.resent === true }
    } catch (error) {
      throw new Error(getErrorMessage(error))
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

  async deleteUser(userId: string): Promise<void> {
    try {
      await api.delete(`/users/${userId}`)
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },
}

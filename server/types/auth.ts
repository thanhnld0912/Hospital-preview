export const USER_ROLES = ['ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

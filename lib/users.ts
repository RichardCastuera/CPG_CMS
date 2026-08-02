export type UserRole = "admin" | "author" | "reviewer";
export type UserStatus = "active" | "invited";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastActiveAt: string;
  status: UserStatus;
}
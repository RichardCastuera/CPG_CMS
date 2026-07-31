export type UserRole = "admin" | "author" | "reviewer";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastActiveAt: string; // ISO date; "now" is computed from recency, not stored literally
}
import { AppUser } from "@/lib/users";

export const mockUsers: AppUser[] = [
  { id: "u1", name: "Admin", email: "admin@gmail.com", role: "admin", lastActiveAt: new Date().toISOString() },
  { id: "u2", name: "Sara Lin", email: "sara.lin@cpg.org", role: "author", lastActiveAt: new Date(Date.now() - 2 * 3600_000).toISOString() },
  { id: "u3", name: "M. Okafor", email: "m.okafor@cpg.org", role: "reviewer", lastActiveAt: new Date(Date.now() - 26 * 3600_000).toISOString() },
  { id: "u4", name: "J. Alvarez", email: "j.alvarez@cpg.org", role: "author", lastActiveAt: new Date(Date.now() - 3 * 24 * 3600_000).toISOString() },
];
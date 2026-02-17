import type { User } from "@shared/models/auth";

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.role === "admin" || user.role === "superadmin") return true;
  // Backwards-compatible fallback for older DBs
  return (user.email ?? "").toLowerCase().includes("admin");
}


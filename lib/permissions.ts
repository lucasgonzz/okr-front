import type { AuthUser } from "@/lib/auth-context";

/**
 * Admin y super_admin pueden gestionar cualquier departamento.
 * Usuarios "user" solo su departamento asignado.
 */
export function canManageDepartmentResource(
  user: AuthUser | null,
  departmentId: string | number | null | undefined
): boolean {
  if (!user) return false;
  if (user.role === "admin" || user.role === "super_admin") return true;
  if (!user.departmentId) return false;
  return String(user.departmentId) === String(departmentId ?? "");
}

import type { Department } from "@/lib/types";

export const NO_DEPARTMENT_LABEL = "Sin departamento";
export const NO_DEPARTMENT_COLOR = "#94a3b8";

export function objectiveDepartmentName(
  department: Department | null | undefined
): string {
  return department?.name ?? NO_DEPARTMENT_LABEL;
}

export function objectiveDepartmentColor(
  department: Department | null | undefined
): string {
  return department?.color ?? NO_DEPARTMENT_COLOR;
}

export function objectiveDepartmentId(
  department: Department | null | undefined
): string | null {
  return department?.id ?? null;
}

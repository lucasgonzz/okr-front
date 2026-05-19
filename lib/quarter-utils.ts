import type { QuarterModel } from "@/lib/types";

/** Posición del cuatrimestre (1–4) según el mes calendario (1–12). */
export function getCalendarQuarterPosition(month: number): number {
  return Math.ceil(month / 3);
}

export function buildQuarterName(year: number, position: number): string {
  return `Q${position}-${year}`;
}

/**
 * Resuelve el nombre del cuatrimestre vigente según la fecha.
 * Si no existe en la lista (p. ej. año futuro sin datos), usa el más cercano anterior.
 */
export function resolveCurrentQuarterName(
  quarters: QuarterModel[],
  date: Date = new Date()
): string | null {
  if (quarters.length === 0) return null;

  const year = date.getFullYear();
  const position = getCalendarQuarterPosition(date.getMonth() + 1);
  const targetName = buildQuarterName(year, position);

  const exact = quarters.find((q) => q.name === targetName);
  if (exact) return exact.name;

  const byYearPosition = quarters.find(
    (q) => q.year === year && q.position === position
  );
  if (byYearPosition) return byYearPosition.name;

  const sorted = [...quarters].sort(
    (a, b) => b.year - a.year || b.position - a.position
  );

  const pastOrCurrent = sorted.find(
    (q) => q.year < year || (q.year === year && q.position <= position)
  );
  if (pastOrCurrent) return pastOrCurrent.name;

  return sorted[sorted.length - 1]?.name ?? null;
}

import type { Objective, ObjectiveStatus } from "@/lib/types";

/**
 * Calcula progreso y estado de objetivo respetando el modo manual/automatico.
 */
export function calculateObjectiveProgress(objective: Objective): {
  progress: number;
  status: ObjectiveStatus;
} {
  if (objective.calculationMode === "manual") {
    return {
      progress: objective.manualProgress ?? 0,
      status: objective.manualStatus ?? "",
    };
  }

  const relevant_key_results = objective.keyResults.filter(
    (kr) => kr.sumsToObjective
  );

  if (relevant_key_results.length === 0) {
    return { progress: 0, status: "" };
  }

  const progress = Math.round(
    relevant_key_results.reduce((sum, kr) => sum + kr.progress, 0) /
      relevant_key_results.length
  );

  const all_completed = relevant_key_results.every(
    (kr) => kr.status === "completado"
  );
  const any_at_risk = relevant_key_results.some(
    (kr) => kr.status === "en-riesgo"
  );

  if (all_completed) {
    return { progress, status: "completado" };
  }

  if (any_at_risk) {
    return { progress, status: "en-riesgo" };
  }

  return { progress, status: "" };
}

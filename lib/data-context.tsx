"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";
import type { Department, Objective, KeyResult, QuarterModel, REMI, User } from "@/lib/types";
import { resolveCurrentQuarterName } from "@/lib/quarter-utils";

interface DataContextType {
  objectives: Objective[];
  remis: REMI[];
  users: User[];
  departments: Department[];
  quarters: QuarterModel[];
  selected_quarter: string;
  set_selected_quarter: (quarter: string) => void;
  is_loading: boolean;
  refreshObjectives: (quarterOverride?: string) => Promise<void>;
  refreshRemis: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshDepartments: () => Promise<void>;
  refreshQuarters: () => Promise<void>;
  refreshData: () => Promise<void>;
  addObjective: (objective: Objective) => Promise<void>;
  updateObjective: (id: string, updates: Partial<Objective>) => Promise<void>;
  deleteObjective: (id: string) => Promise<void>;
  addKeyResult: (objectiveId: string, kr: KeyResult) => Promise<Objective | null>;
  updateKeyResult: (objectiveId: string, krId: string, updates: Partial<KeyResult>) => Promise<Objective | null>;
  deleteKeyResult: (objectiveId: string, krId: string) => Promise<Objective | null>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function applyObjectiveToState(
  setObjectives: React.Dispatch<React.SetStateAction<Objective[]>>,
  objectiveId: string,
  objective: Objective
) {
  setObjectives((prev) => {
    const idx = prev.findIndex((o) => String(o.id) === String(objectiveId));
    if (idx >= 0) {
      return prev.map((o) => (String(o.id) === String(objectiveId) ? objective : o));
    }
    return [objective, ...prev];
  });
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [remis, setRemis] = useState<REMI[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [quarters, setQuarters] = useState<QuarterModel[]>([]);
  const [selected_quarter, set_selected_quarter] = useState<string>("Q4-2024");
  const [quarter_initialized, set_quarter_initialized] = useState(false);
  const [is_loading, set_is_loading] = useState<boolean>(true);

  const refreshObjectives = useCallback(async (quarterOverride?: string) => {
    const quarter = quarterOverride ?? selected_quarter;
    set_is_loading(true);
    try {
      const objectives_res = await apiFetch<{ data: Objective[] }>(
        `/objectives${quarter ? `?quarter=${encodeURIComponent(quarter)}` : ""}`
      );
      setObjectives(objectives_res.data || []);
    } catch {
      setObjectives([]);
    } finally {
      set_is_loading(false);
    }
  }, [selected_quarter]);

  const refreshRemis = useCallback(async () => {
    set_is_loading(true);
    try {
      const remis_res = await apiFetch<{ data: REMI[] }>("/remis");
      setRemis(remis_res.data || []);
    } catch {
      setRemis([]);
    } finally {
      set_is_loading(false);
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    set_is_loading(true);
    try {
      const users_res = await apiFetch<{ data: User[] }>("/users");
      setUsers(users_res.data || []);
    } catch {
      setUsers([]);
    } finally {
      set_is_loading(false);
    }
  }, []);

  const refreshDepartments = useCallback(async () => {
    set_is_loading(true);
    try {
      const departments_res = await apiFetch<{ data: Department[] }>("/departments");
      setDepartments(departments_res.data || []);
    } catch {
      setDepartments([]);
    } finally {
      set_is_loading(false);
    }
  }, []);

  const refreshQuarters = useCallback(async () => {
    set_is_loading(true);
    try {
      const quarters_res = await apiFetch<{ data: QuarterModel[] }>("/quarters");
      setQuarters(quarters_res.data || []);
    } catch {
      setQuarters([]);
    } finally {
      set_is_loading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    set_is_loading(true);
    try {
      await Promise.all([
        apiFetch<{ data: Objective[] }>(
          `/objectives${selected_quarter ? `?quarter=${encodeURIComponent(selected_quarter)}` : ""}`
        ).then((res) => setObjectives(res.data || [])),
        apiFetch<{ data: REMI[] }>("/remis").then((res) => setRemis(res.data || [])),
        apiFetch<{ data: User[] }>("/users").then((res) => setUsers(res.data || [])),
        apiFetch<{ data: Department[] }>("/departments").then((res) => setDepartments(res.data || [])),
        apiFetch<{ data: QuarterModel[] }>("/quarters").then((res) => setQuarters(res.data || [])),
      ]);
    } catch {
      setObjectives([]);
      setRemis([]);
      setUsers([]);
      setDepartments([]);
      setQuarters([]);
    } finally {
      set_is_loading(false);
    }
  }, [selected_quarter]);

  useEffect(() => {
    void refreshQuarters();
  }, [refreshQuarters]);

  // Inicializa el trimestre seleccionado al trimestre vigente una sola vez,
  // cuando los quarters cargan por primera vez.
  useEffect(() => {
    if (quarter_initialized || quarters.length === 0) return;
    const current = resolveCurrentQuarterName(quarters);
    if (current) {
      set_selected_quarter(current);
      set_quarter_initialized(true);
    }
  }, [quarters, quarter_initialized]);

  const addObjective = async (objective: Objective) => {
    const payload = {
      title: objective.title,
      description: objective.description,
      department_id: objective.department.id,
      owner_id: objective.owner.id,
      quarter: objective.quarter,
      quarter_id: objective.quarterId,
      remi_id: objective.remi?.id ?? null,
      calculation_mode: objective.calculationMode,
      manual_progress: objective.manualProgress ?? null,
      manual_status: objective.manualStatus ?? null,
    };

    const res = await apiFetch<{ objective: Objective }>("/objectives", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.objective) {
      setObjectives((prev) => [res.objective, ...prev]);
    }
  };

  const updateObjective = useCallback(
    (id: string, updates: Partial<Objective>) => {
      const payload: Record<string, unknown> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.department?.id !== undefined) payload.department_id = updates.department.id;
      if (updates.owner?.id !== undefined) payload.owner_id = updates.owner.id;
      if (updates.quarter !== undefined) payload.quarter = updates.quarter;
      if (updates.quarterId !== undefined) payload.quarter_id = updates.quarterId;
      if (updates.remi !== undefined) payload.remi_id = updates.remi?.id ?? null;
      if (updates.calculationMode !== undefined) payload.calculation_mode = updates.calculationMode;
      if (updates.manualProgress !== undefined) payload.manual_progress = updates.manualProgress;
      if (updates.manualStatus !== undefined) payload.manual_status = updates.manualStatus;

      return apiFetch<{ objective: Objective }>(`/objectives/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }).then(async () => {
        await refreshObjectives();
      });
    },
    [refreshObjectives]
  );

  const deleteObjective = async (id: string) => {
    await apiFetch(`/objectives/${id}`, { method: "DELETE" });
    setObjectives((prev) => prev.filter((o) => o.id !== id));
  };

  const addKeyResult = async (objectiveId: string, kr: KeyResult): Promise<Objective | null> => {
    const payload = {
      title: kr.title,
      description: kr.description,
      owner_id: kr.owner.id,
      target: kr.target,
      current_value: kr.currentValue,
      start_value: kr.startValue,
      unit: kr.unit,
      status: kr.status,
      sums_to_objective: kr.sumsToObjective,
      blockers: kr.blockers,
      comments: kr.comments,
    };

    const res = await apiFetch<{ keyResult: KeyResult; objective?: Objective }>(
      `/objectives/${objectiveId}/key-results`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    if (res.objective) {
      applyObjectiveToState(setObjectives, objectiveId, res.objective);
      return res.objective;
    }
    if (res.keyResult) {
      let updated: Objective | null = null;
      setObjectives((prev) => {
        const current = prev.find((o) => String(o.id) === String(objectiveId));
        if (!current) return prev;
        updated = {
          ...current,
          keyResults: [...current.keyResults, res.keyResult],
        };
        return prev.map((o) => (String(o.id) === String(objectiveId) ? updated! : o));
      });
      return updated;
    }
    return null;
  };

  const updateKeyResult = async (
    objectiveId: string,
    krId: string,
    updates: Partial<KeyResult>
  ): Promise<Objective | null> => {
    const payload: Record<string, unknown> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.owner?.id !== undefined) payload.owner_id = updates.owner.id;
    if (updates.target !== undefined) payload.target = updates.target;
    if (updates.currentValue !== undefined) payload.current_value = updates.currentValue;
    if (updates.startValue !== undefined) payload.start_value = updates.startValue;
    if (updates.unit !== undefined) payload.unit = updates.unit;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.sumsToObjective !== undefined) payload.sums_to_objective = updates.sumsToObjective;
    if (updates.blockers !== undefined) payload.blockers = updates.blockers;
    if (updates.comments !== undefined) payload.comments = updates.comments;

    const res = await apiFetch<{ keyResult: KeyResult; objective?: Objective }>(
      `/objectives/${objectiveId}/key-results/${krId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );

    if (res.objective) {
      applyObjectiveToState(setObjectives, objectiveId, res.objective);
      return res.objective;
    }
    if (res.keyResult) {
      let updated: Objective | null = null;
      setObjectives((prev) => {
        const current = prev.find((o) => String(o.id) === String(objectiveId));
        if (!current) return prev;
        updated = {
          ...current,
          keyResults: current.keyResults.map((kr) =>
            String(kr.id) === String(krId) ? res.keyResult : kr
          ),
        };
        return prev.map((o) => (String(o.id) === String(objectiveId) ? updated! : o));
      });
      return updated;
    }
    return null;
  };

  const deleteKeyResult = async (objectiveId: string, krId: string): Promise<Objective | null> => {
    const res = await apiFetch<{ message: string; objective?: Objective }>(
      `/objectives/${objectiveId}/key-results/${krId}`,
      { method: "DELETE" }
    );

    if (res.objective) {
      applyObjectiveToState(setObjectives, objectiveId, res.objective);
      return res.objective;
    }

    let updated: Objective | null = null;
    setObjectives((prev) => {
      const current = prev.find((o) => String(o.id) === String(objectiveId));
      if (!current) return prev;
      updated = {
        ...current,
        keyResults: current.keyResults.filter((kr) => String(kr.id) !== String(krId)),
      };
      return prev.map((o) => (String(o.id) === String(objectiveId) ? updated! : o));
    });
    return updated;
  };

  const memo_value = useMemo(
    () => ({
      objectives,
      remis,
      users,
      departments,
      quarters,
      selected_quarter,
      set_selected_quarter,
      is_loading,
      refreshObjectives,
      refreshRemis,
      refreshUsers,
      refreshDepartments,
      refreshQuarters,
      refreshData,
      addObjective,
      updateObjective,
      deleteObjective,
      addKeyResult,
      updateKeyResult,
      deleteKeyResult,
    }),
    [
      objectives,
      remis,
      users,
      departments,
      quarters,
      selected_quarter,
      is_loading,
      refreshObjectives,
      refreshRemis,
      refreshUsers,
      refreshDepartments,
      refreshQuarters,
      refreshData,
      addObjective,
      updateObjective,
      deleteObjective,
      addKeyResult,
      updateKeyResult,
      deleteKeyResult,
    ]
  );

  return (
    <DataContext.Provider value={memo_value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

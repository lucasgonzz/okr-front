// OKR Management System Types

export type Quarter = string;

export interface QuarterModel {
  id: string;
  name: string;
  year: number;
  position: number;
}

// New status types in Spanish
export type ObjectiveStatus = "en-riesgo" | "completado" | "";
export type KeyResultStatus = "en-riesgo" | "completado" | "";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "user";
  department: string;
  companyId?: string | null;
  departmentId?: string | null;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  color: string;
  companyId?: string;
  /** Presente en mock; la API /departments no lo envía aún. */
  head?: User | null;
  memberCount?: number;
  objectiveCount?: number;
  averageProgress?: number;
}

// New REMI interface - strategic grouping with no metrics
export interface REMI {
  id: string;
  name: string;
  description: string;
  responsibleUser: User | null;
  responsibleDepartment: Department | null;
}

export interface KeyResult {
  id: string;
  objectiveId: string;
  title: string;
  description: string;
  owner: User;
  status: KeyResultStatus;
  progress: number;
  target: number;
  currentValue: number;
  unit: string;
  startValue: number;
  // New fields
  sumsToObjective: boolean; // Whether this KR participates in automatic Objective calculation
  blockers: string; // Free-text field for impediments
  comments: string; // Free-text field for notes (NOT a conversation thread)
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  department: Department;
  quarter: Quarter;
  quarterId?: string | null;
  quarterModel?: QuarterModel | null;
  owner: User;
  status: ObjectiveStatus;
  progress: number;
  keyResults: KeyResult[];
  createdAt: string;
  updatedAt: string;
  // New fields
  remi: REMI | null; // Strategic grouping (optional)
  calculationMode: "automatic" | "manual"; // How progress and status are computed
  manualProgress?: number; // Only used when calculationMode === "manual"
  manualStatus?: ObjectiveStatus; // Only used when calculationMode === "manual"
}

export interface DashboardStats {
  totalObjectives: number;
  completedObjectives: number;
  enRiesgoObjectives: number;
  sinEstadoObjectives: number;
  averageProgress: number;
  totalKeyResults: number;
  completedKeyResults: number;
}

export interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
}

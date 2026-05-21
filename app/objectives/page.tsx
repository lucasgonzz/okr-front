"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/okr/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useData } from "@/lib/data-context";
import { calculateObjectiveProgress } from "@/lib/okr-calculations";
import { ObjectiveForm } from "@/components/okr/objective-form";
import type { Quarter, ObjectiveStatus, Objective } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
  Target,
  ArrowUpDown,
  ExternalLink,
  Check,
  Flag,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Progress color based on percentage
function getProgressColor(progress: number): string {
  if (progress >= 100) return "bg-success";
  if (progress >= 60) return "bg-warning";
  if (progress >= 1) return "bg-destructive";
  return "bg-destructive/80";
}

function getProgressTextColor(progress: number): string {
  if (progress >= 100) return "text-success";
  if (progress >= 60) return "text-warning";
  if (progress >= 1) return "text-destructive";
  return "text-destructive";
}

// Format value with unit
function formatValue(value: number, unit: string): string {
  if (unit === "" || unit.startsWith("$")) {
    return new Intl.NumberFormat("en-US", {
      style: unit === "" || unit.startsWith("$") ? "currency" : "decimal",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (unit === "%") {
    return `${value}%`;
  }
  return `${value}${unit}`;
}

// Expandable Objective Row Component
function ObjectiveRow({
  objective,
  index,
  onEdit,
  onDelete,
  isDeleting,
}: {
  objective: Objective;
  index: number;
  onEdit: (objective: Objective) => void;
  onDelete: (objective: Objective) => void;
  isDeleting: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const calculated = calculateObjectiveProgress(objective);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
    >
      {/* Objective Parent Row */}
      <div
        className={cn(
          "group grid grid-cols-[minmax(300px,2fr)_80px_100px_100px_120px_110px_120px_110px] items-center gap-4 px-4 py-3 border-b border-border cursor-pointer transition-colors",
          "bg-secondary/50 hover:bg-secondary/70"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Objective / Task Column */}
        <div className="flex items-center gap-3 min-w-0">
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.div>
          <div
            className="h-3 w-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: objective.department.color }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-medium text-muted-foreground">
                {objective.department.name}
              </span>
              {objective.remi && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-xs text-primary/80 flex items-center gap-1">
                    <Flag className="h-3 w-3" />
                    {objective.remi.name.length > 25
                      ? objective.remi.name.substring(0, 25) + "..."
                      : objective.remi.name}
                  </span>
                </>
              )}
            </div>
            <h3 className="font-semibold text-foreground truncate text-sm">
              {objective.title}
            </h3>
          </div>
        </div>

        {/* Start - N/A for objectives */}
        <div className="text-sm text-muted-foreground text-center">—</div>

        {/* Target - N/A for objectives */}
        <div className="text-sm text-muted-foreground text-center">—</div>

        {/* Current - N/A for objectives */}
        <div className="text-sm text-muted-foreground text-center">—</div>

        {/* Progress */}
        <div className="flex justify-center items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", getProgressColor(calculated.progress))}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(calculated.progress, 100)}%` }}
              transition={{ duration: 0.5, delay: index * 0.02 }}
            />
          </div>
          <span className={cn("text-sm font-semibold w-10 text-right", getProgressTextColor(calculated.progress))}>
            {calculated.progress}%
          </span>
        </div>

        {/* Owner */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-primary/20 text-primary">
              {objective.owner.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground truncate">
            {objective.owner.name.split(" ")[0]}
          </span>
        </div>

        {/* Estado */}
        <div className="flex justify-center items-center">
          <StatusBadge status={calculated.status} size="sm" />
        </div>

        {/* Acciones */}
        <div className="flex justify-center items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(objective);
            }}
            className="p-1.5 rounded hover:bg-primary/10 transition-all"
            title="Editar objetivo"
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(objective);
            }}
            disabled={isDeleting}
            className="p-1.5 rounded hover:bg-destructive/10 transition-all"
            title="Eliminar objetivo"
          >
            {isDeleting ? (
              <Spinner className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            )}
          </button>
          <Link
            href={`/objectives/${objective.id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded hover:bg-primary/10 transition-all"
            title="Ver detalle"
          >
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
          </Link>
        </div>
      </div>

      {/* Key Results (Expandable) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {objective.keyResults.map((kr, krIndex) => (
              <div
                key={kr.id}
                className="grid grid-cols-[minmax(300px,2fr)_80px_100px_100px_120px_110px_120px_110px] items-center gap-4 px-4 py-2.5 border-b border-border/50 bg-card hover:bg-card/80 transition-colors"
              >
                {/* Key Result Title (Indented) */}
                <div className="flex items-center gap-3 min-w-0 pl-10">
                  <Target className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground truncate flex-1">
                    {kr.title}
                  </span>
                  {/* Sums to Objective indicator */}
                  {kr.sumsToObjective ? (
                    <span className="text-[10px] text-primary/70 flex items-center gap-0.5 flex-shrink-0">
                      <Check className="h-3 w-3" />
                      Suma
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      No suma
                    </span>
                  )}
                </div>

                {/* Start */}
                <div className="text-sm text-muted-foreground text-center">
                  {formatValue(kr.startValue, kr.unit)}
                </div>

                {/* Target */}
                <div className="text-sm text-foreground text-center">
                  {formatValue(kr.target, kr.unit)}
                </div>

                {/* Current */}
                <div className={cn("text-sm font-medium text-center", getProgressTextColor(kr.progress))}>
                  {formatValue(kr.currentValue, kr.unit)}
                </div>

                {/* Progress */}
                <div className="flex justify-center items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", getProgressColor(kr.progress))}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(kr.progress, 100)}%` }}
                      transition={{ duration: 0.4, delay: krIndex * 0.03 }}
                    />
                  </div>
                  <span className={cn("text-xs font-medium w-8 text-right", getProgressTextColor(kr.progress))}>
                    {kr.progress}%
                  </span>
                </div>

                {/* Owner */}
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                      {kr.owner.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">
                    {kr.owner.name.split(" ")[0]}
                  </span>
                </div>

                {/* Status */}
                <div className="flex justify-center">
                  <StatusBadge status={kr.status} size="sm" />
                </div>

                {/* Acciones (vacío para KRs) */}
                <div />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ObjectivesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    objectives,
    remis,
    users,
    departments,
    quarters,
    selected_quarter,
    set_selected_quarter,
    deleteObjective,
    is_loading,
    refreshObjectives,
  } = useData();

  // CRUD state
  const [formOpen, setFormOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [objectiveToDelete, setObjectiveToDelete] = useState<Objective | null>(null);
  const [isDeletingObjective, setIsDeletingObjective] = useState(false);
  const [deletingObjectiveId, setDeletingObjectiveId] = useState<string | null>(null);

  // Initialize filters from URL params
  const initialDepartment = searchParams.get("department") || "all";
  const initialStatus = searchParams.get("status") || "all";
  const initialRemi = searchParams.get("remi") || "all";

  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(selected_quarter as Quarter);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<ObjectiveStatus | "all">(
    initialStatus === "en-riesgo" || initialStatus === "completado"
      ? (initialStatus as ObjectiveStatus)
      : "all"
  );
  const [departmentFilter, setDepartmentFilter] = useState(initialDepartment);
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [remiFilter, setRemiFilter] = useState(initialRemi);
  const [sortBy, setSortBy] = useState<"progress" | "title">("title");

  useEffect(() => {
    if (pathname !== "/objectives" || quarters.length === 0) return;
    void refreshObjectives();
  }, [pathname, quarters, refreshObjectives]);

  // CRUD handlers
  const handleEdit = (objective: Objective) => {
    setEditingObjective(objective);
    setFormOpen(true);
  };

  const handleDelete = (objective: Objective) => {
    setObjectiveToDelete(objective);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (objectiveToDelete) {
      const deletingId = objectiveToDelete.id;
      setIsDeletingObjective(true);
      setDeletingObjectiveId(deletingId);
      try {
        await deleteObjective(deletingId);
        setObjectiveToDelete(null);
        setDeleteDialogOpen(false);
      } finally {
        setIsDeletingObjective(false);
        setDeletingObjectiveId(null);
      }
    }
  };

  // Filter and sort objectives
  const filteredObjectives = useMemo(() => {
    let filtered = objectives.filter((obj) => {
      if (obj.quarter !== selectedQuarter) return false;
      if (
        searchValue &&
        !obj.title.toLowerCase().includes(searchValue.toLowerCase())
      ) {
        return false;
      }
      
      // Status filter using calculated status
      if (statusFilter !== "all") {
        const calculated = calculateObjectiveProgress(obj);
        if (calculated.status !== statusFilter) return false;
      }
      
      if (departmentFilter !== "all" && obj.department.id !== departmentFilter) {
        return false;
      }
      if (ownerFilter !== "all" && obj.owner.id !== ownerFilter) {
        return false;
      }
      if (remiFilter !== "all") {
        if (remiFilter === "none" && obj.remi !== null) return false;
        if (remiFilter !== "none" && obj.remi?.id !== remiFilter) return false;
      }
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "progress":
          const progA = calculateObjectiveProgress(a).progress;
          const progB = calculateObjectiveProgress(b).progress;
          return progB - progA;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [objectives, selectedQuarter, searchValue, statusFilter, departmentFilter, ownerFilter, remiFilter, sortBy]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const total = filteredObjectives.length;
    const totalKRs = filteredObjectives.reduce(
      (sum, obj) => sum + obj.keyResults.length,
      0
    );
    const avgProgress =
      total > 0
        ? Math.round(
            filteredObjectives.reduce((sum, obj) => {
              return sum + calculateObjectiveProgress(obj).progress;
            }, 0) / total
          )
        : 0;
    const atRisk = filteredObjectives.filter((obj) => {
      const calc = calculateObjectiveProgress(obj);
      return calc.status === "en-riesgo";
    }).length;

    return { total, totalKRs, avgProgress, atRisk };
  }, [filteredObjectives]);

  const hasActiveFilters =
    searchValue ||
    statusFilter !== "all" ||
    departmentFilter !== "all" ||
    ownerFilter !== "all" ||
    remiFilter !== "all";

  const clearFilters = () => {
    setSearchValue("");
    setStatusFilter("all");
    setDepartmentFilter("all");
    setOwnerFilter("all");
    setRemiFilter("all");
    router.push("/objectives");
  };

  return (
    <AppShell
      selectedQuarter={selectedQuarter}
      onQuarterChange={(quarter) => {
        setSelectedQuarter(quarter);
        set_selected_quarter(quarter);
      }}
    >
      <div className="mx-auto max-w-[1600px]">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Tracker de OKRs
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Vista jerárquica de todos los objetivos y resultados clave
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Button onClick={() => { setEditingObjective(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Objetivo
            </Button>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4"
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar objetivos..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 bg-background border-border"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />

            <Select
              value={selectedQuarter}
              onValueChange={(value) => {
                const quarter = value as Quarter;
                setSelectedQuarter(quarter);
                set_selected_quarter(quarter);
                void refreshObjectives(quarter);
              }}
            >
              <SelectTrigger className="w-[120px] bg-background border-border">
                <SelectValue placeholder="Trimestre" />
              </SelectTrigger>
              <SelectContent>
                {quarters.map((q) => (
                  <SelectItem key={q.id} value={q.name}>
                    {q.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={remiFilter}
              onValueChange={setRemiFilter}
            >
              <SelectTrigger className="w-[180px] bg-background border-border">
                <SelectValue placeholder="REMI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los REMIs</SelectItem>
                <SelectItem value="none">Sin REMI</SelectItem>
                {remis.map((remi) => (
                  <SelectItem key={remi.id} value={remi.id}>
                    {remi.name.length > 25 ? remi.name.substring(0, 25) + "..." : remi.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-[160px] bg-background border-border">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Deptos</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as ObjectiveStatus | "all")
              }
            >
              <SelectTrigger className="w-[130px] bg-background border-border">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="en-riesgo">En Riesgo</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger className="w-[160px] bg-background border-border">
                <SelectValue placeholder="Responsable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as typeof sortBy)}
            >
              <SelectTrigger className="w-[130px] bg-background border-border">
                <ArrowUpDown className="mr-2 h-3 w-3" />
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Título</SelectItem>
                <SelectItem value="progress">Progreso</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="mr-1 h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>
        </motion.div>

        {/* Table Container */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <div className="min-w-[1190px]">
              {/* Table Header */}
              <div className="grid grid-cols-[minmax(300px,2fr)_80px_100px_100px_120px_110px_120px_110px] items-center gap-4 px-4 py-3 border-b border-border bg-muted/50">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Objetivo / Key Result
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                  Inicio
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                  Meta
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                  Actual
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                  Progreso
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Responsable
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                  Estado
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                  Acciones
                </span>
            </div>

              {/* Table Body */}
              {is_loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Spinner className="mb-3 h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Cargando objetivos...</p>
                </div>
              ) : filteredObjectives.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Target className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No se encontraron objetivos con los filtros aplicados
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="mt-4"
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              ) : (
                filteredObjectives.map((objective, index) => (
                  <ObjectiveRow 
                        key={objective.id} 
                        objective={objective} 
                        index={index}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    isDeleting={deletingObjectiveId === objective.id}
                      />
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Mostrando {filteredObjectives.length} objetivos con{" "}
            {filteredObjectives.reduce((sum, obj) => sum + obj.keyResults.length, 0)}{" "}
            key results
          </p>
        </div>
      </div>

      {/* Objective Form Sheet */}
      <ObjectiveForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingObjective(null);
        }}
        mode={editingObjective ? "edit" : "create"}
        objective={editingObjective ?? undefined}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar objetivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El objetivo &quot;{objectiveToDelete?.title}&quot; y todos sus key results serán eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setObjectiveToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeletingObjective}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingObjective ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

// Loading fallback for Suspense
function ObjectivesLoading() {
  return (
    <AppShell selectedQuarter="Q4-2024" onQuarterChange={() => {}}>
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    </AppShell>
  );
}

// Default export wrapped in Suspense for useSearchParams
export default function ObjectivesPage() {
  return (
    <Suspense fallback={<ObjectivesLoading />}>
      <ObjectivesContent />
    </Suspense>
  );
}

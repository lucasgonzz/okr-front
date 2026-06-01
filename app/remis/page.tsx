"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { ProgressBar } from "@/components/okr/progress-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateObjectiveProgress } from "@/lib/okr-calculations";
import { useData } from "@/lib/data-context";
import { apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Quarter, QuarterModel, REMI, Objective } from "@/lib/types";
import {
  Flag,
  Target,
  ChevronRight,
  ChevronDown,
  Building2,
  User,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

function clamp_remi_progreso_manual(value: number): number {
  const n = Number.isFinite(value) ? Math.round(value) : 0;
  return Math.min(100, Math.max(0, n));
}

function year_to_quarter_ids(year: string, quarters: QuarterModel[]): string[] {
  if (!year || year === "none") return [];
  return quarters.filter((q) => q.year === Number(year)).map((q) => q.id);
}

// Circular progress ring shown in each REMI card header
function ProgressRing({ progress }: { progress: number }) {
  const r = 24;
  const size = 64;
  const cx = size / 2;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * r;
  const safeProgress = Math.min(100, Math.max(0, progress));
  const offset = circumference * (1 - safeProgress / 100);

  const strokeColor =
    safeProgress >= 80 ? "#22c55e" :
    safeProgress >= 51 ? "#f59e0b" :
    safeProgress === 0 ? undefined :
    "#ef4444";

  const textColor =
    safeProgress >= 80 ? "text-emerald-500" :
    safeProgress >= 51 ? "text-amber-500" :
    safeProgress === 0 ? "text-muted-foreground" :
    "text-red-500";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: "rotate(-90deg)" }}
          className="block"
        >
          {/* Track ring */}
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-border"
          />
          {/* Progress arc */}
          {safeProgress > 0 && (
            <circle
              cx={cx}
              cy={cx}
              r={r}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          )}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
          {safeProgress > 0 ? (
            <>
              <span className={cn("text-base font-bold leading-none", textColor)}>
                {safeProgress}
              </span>
              <span className={cn("text-[10px] font-bold leading-none", textColor)}>%</span>
            </>
          ) : (
            <span className="text-sm font-bold leading-none text-muted-foreground">—</span>
          )}
        </div>
      </div>
      <span className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground">
        Progreso
      </span>
    </div>
  );
}

// REMI Card with expandable objectives
function REMICard({
  remi,
  associatedObjectives,
  index,
  progress,
  onEdit,
}: {
  remi: REMI;
  associatedObjectives: Objective[];
  index: number;
  progress: number;
  onEdit: (remi: REMI) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate aggregated stats
  const stats = useMemo(() => {
    const total = associatedObjectives.length;
    let completedCount = 0;
    let atRiskCount = 0;

    associatedObjectives.forEach((obj) => {
      const calculated = calculateObjectiveProgress(obj);
      if (calculated.status === "completado") completedCount++;
      if (calculated.status === "en-riesgo") atRiskCount++;
    });

    return { total, completed: completedCount, atRisk: atRiskCount };
  }, [associatedObjectives]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden">
        <CardHeader
          className="cursor-pointer hover:bg-secondary/30 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 flex-shrink-0">
                <Flag className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-foreground mb-1">
                  {remi.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {remi.description}
                </p>
              </div>
            </div>

            {/* Progress ring + Edit button */}
            <div
              className="flex items-center gap-3 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <ProgressRing progress={progress} />
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => onEdit(remi)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              >
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Meta Info — solo Responsable y Departamento */}
          <div className="flex flex-wrap items-center gap-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              {remi.responsibleUser ? (
                <>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {remi.responsibleUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-muted-foreground">Responsable</p>
                    <p className="text-sm font-medium text-foreground">
                      {remi.responsibleUser.name}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-muted">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-muted-foreground">Responsable</p>
                    <p className="text-sm font-medium text-muted-foreground">
                      Sin asignar
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {remi.responsibleDepartment ? (
                <>
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: remi.responsibleDepartment.color }}
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">Departamento</p>
                    <p className="text-sm font-medium text-foreground">
                      {remi.responsibleDepartment.name}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-3 w-3 rounded-full bg-muted border border-border" />
                  <div>
                    <p className="text-xs text-muted-foreground">Departamento</p>
                    <p className="text-sm font-medium text-muted-foreground">
                      Sin asignar
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Objetivos</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-success/10">
              <p className="text-2xl font-semibold text-success">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completados</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-warning/10">
              <p className="text-2xl font-semibold text-warning">{stats.atRisk}</p>
              <p className="text-xs text-muted-foreground">En Riesgo</p>
            </div>
          </div>

          {/* Expandable Objectives List */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-border space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Objetivos Asociados
                  </h4>

                  {associatedObjectives.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No hay objetivos asociados a este REMI</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {associatedObjectives.map((obj) => {
                        const calculated = calculateObjectiveProgress(obj);
                        return (
                          <Link
                            key={obj.id}
                            href={`/objectives/${obj.id}`}
                            className="group block"
                          >
                            <div className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-secondary/30 transition-colors">
                              <div
                                className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: obj.department.color }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                  {obj.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {obj.department.name} • {obj.owner.name}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-24">
                                  <ProgressBar
                                    value={calculated.progress}
                                    size="sm"
                                    animated={false}
                                  />
                                </div>
                                <span className="text-sm font-medium text-foreground w-10 text-right">
                                  {calculated.progress}%
                                </span>
                                {calculated.status === "completado" && (
                                  <CheckCircle2 className="h-4 w-4 text-success" />
                                )}
                                {calculated.status === "en-riesgo" && (
                                  <AlertTriangle className="h-4 w-4 text-warning" />
                                )}
                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  <Link href={`/objectives?remi=${remi.id}`}>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver todos en Tracker
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function REMIsPage() {
  const {
    objectives,
    remis,
    users,
    departments,
    quarters,
    selected_quarter,
    set_selected_quarter,
    refreshObjectives,
    refreshRemis,
    refreshUsers,
    refreshDepartments,
    refreshQuarters,
    is_loading,
  } = useData();
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(selected_quarter as Quarter);

  // ── Create REMI state ──────────────────────────────────────────────────────
  const [is_create_modal_open, set_is_create_modal_open] = useState(false);
  const [new_remi_name, set_new_remi_name] = useState("");
  const [new_remi_description, set_new_remi_description] = useState("");
  const [new_responsible_user_id, set_new_responsible_user_id] = useState("none");
  const [new_responsible_department_id, set_new_responsible_department_id] = useState("none");
  const [new_remi_progress, set_new_remi_progress] = useState(0);
  const [new_year, set_new_year] = useState("");
  const [is_saving_remi, set_is_saving_remi] = useState(false);

  // ── Edit REMI state ────────────────────────────────────────────────────────
  const [editing_remi, set_editing_remi] = useState<REMI | null>(null);
  const [is_edit_sheet_open, set_is_edit_sheet_open] = useState(false);
  const [edit_name, set_edit_name] = useState("");
  const [edit_description, set_edit_description] = useState("");
  const [edit_responsible_user_id, set_edit_responsible_user_id] = useState("none");
  const [edit_responsible_department_id, set_edit_responsible_department_id] = useState("none");
  const [edit_progress, set_edit_progress] = useState(0);
  const [edit_year, set_edit_year] = useState("");
  const [is_saving_edit, set_is_saving_edit] = useState(false);

  useEffect(() => {
    void Promise.all([refreshObjectives(), refreshRemis()]);
  }, [refreshObjectives, refreshRemis]);

  useEffect(() => {
    if (!is_create_modal_open && !is_edit_sheet_open) return;
    if (users.length === 0) void refreshUsers();
    if (departments.length === 0) void refreshDepartments();
    if (quarters.length === 0) void refreshQuarters();
  }, [
    is_create_modal_open,
    is_edit_sheet_open,
    users.length,
    departments.length,
    quarters.length,
    refreshUsers,
    refreshDepartments,
    refreshQuarters,
  ]);

  // ── Available years derived from quarters ─────────────────────────────────
  const availableYears = useMemo(
    () => [...new Set(quarters.map((q) => q.year))].sort((a, b) => b - a),
    [quarters]
  );

  // ── REMIs filtered by selected quarter ────────────────────────────────────
  const filteredRemis = useMemo(() => {
    return remis.filter((remi) => {
      if (!remi.quarters || remi.quarters.length === 0) return true;
      return remi.quarters.some((q) => q.name === selectedQuarter);
    });
  }, [remis, selectedQuarter]);

  // ── Objectives grouped by REMI ─────────────────────────────────────────────
  const remiObjectivesMap = useMemo(() => {
    const map = new Map<string, Objective[]>();
    objectives.forEach((obj) => {
      if (obj.remi && obj.quarter === selectedQuarter) {
        const existing = map.get(obj.remi.id) || [];
        existing.push(obj);
        map.set(obj.remi.id, existing);
      }
    });
    return map;
  }, [selectedQuarter, objectives]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handle_create_remi = () => {
    if (!new_remi_name.trim()) return;
    set_is_saving_remi(true);
    apiFetch("/remis", {
      method: "POST",
      body: JSON.stringify({
        name: new_remi_name.trim(),
        description: new_remi_description.trim() || null,
        responsible_user_id: new_responsible_user_id !== "none" ? new_responsible_user_id : null,
        responsible_department_id: new_responsible_department_id !== "none" ? new_responsible_department_id : null,
        progreso_manual: clamp_remi_progreso_manual(new_remi_progress),
        quarter_ids: year_to_quarter_ids(new_year, quarters),
      }),
    })
      .then(() => {
        set_is_create_modal_open(false);
        set_new_remi_name("");
        set_new_remi_description("");
        set_new_responsible_user_id("none");
        set_new_responsible_department_id("none");
        set_new_remi_progress(0);
        set_new_year("");
        return refreshRemis();
      })
      .finally(() => set_is_saving_remi(false));
  };

  const handle_open_edit = (remi: REMI) => {
    set_editing_remi(remi);
    set_edit_name(remi.name);
    set_edit_description(remi.description || "");
    set_edit_responsible_user_id(remi.responsibleUser?.id || "none");
    set_edit_responsible_department_id(remi.responsibleDepartment?.id || "none");
    set_edit_progress(remi.progresoManual ?? 0);
    set_edit_year(remi.quarters?.[0]?.year?.toString() ?? "");
    set_is_edit_sheet_open(true);
  };

  const handle_save_edit = () => {
    if (!editing_remi || !edit_name.trim()) return;
    set_is_saving_edit(true);
    apiFetch(`/remis/${editing_remi.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: edit_name.trim(),
        description: edit_description.trim() || null,
        responsible_user_id: edit_responsible_user_id !== "none" ? edit_responsible_user_id : null,
        responsible_department_id: edit_responsible_department_id !== "none" ? edit_responsible_department_id : null,
        progreso_manual: clamp_remi_progreso_manual(edit_progress),
        quarter_ids: year_to_quarter_ids(edit_year, quarters),
      }),
    })
      .then(() => {
        set_is_edit_sheet_open(false);
        return refreshRemis();
      })
      .finally(() => set_is_saving_edit(false));
  };

  return (
    <AppShell
      selectedQuarter={selectedQuarter}
      onQuarterChange={(quarter) => {
        setSelectedQuarter(quarter);
        set_selected_quarter(quarter);
      }}
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Page Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              REMIs
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Resultados Estratégicos Más Importantes - Agrupaciones estratégicas de objetivos
            </p>
          </motion.div>
          <Button onClick={() => set_is_create_modal_open(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo REMI
          </Button>
        </div>

        {/* REMI Cards */}
        <div className="space-y-6">
          {is_loading ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-10">
              <Spinner className="mb-3 h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cargando REMIs...</p>
            </div>
          ) : filteredRemis.map((remi, index) => (
            <REMICard
              key={remi.id}
              remi={remi}
              associatedObjectives={remiObjectivesMap.get(remi.id) || []}
              index={index}
              progress={remi.progresoManual ?? 0}
              onEdit={handle_open_edit}
            />
          ))}
        </div>
      </div>

      {/* ── Crear REMI dialog ──────────────────────────────────────────────── */}
      <Dialog open={is_create_modal_open} onOpenChange={set_is_create_modal_open}>
        <DialogContent className="flex flex-col max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
            <DialogTitle>Nuevo REMI</DialogTitle>
            <DialogDescription>
              Crea un nuevo resultado estratégico para agrupar objetivos.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="remi_name">Nombre</Label>
              <Input
                id="remi_name"
                value={new_remi_name}
                onChange={(event) => set_new_remi_name(event.target.value)}
                placeholder="Ej: Expansión internacional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remi_description">Descripción</Label>
              <Textarea
                id="remi_description"
                value={new_remi_description}
                onChange={(event) => set_new_remi_description(event.target.value)}
                placeholder="Detalle estratégico del REMI"
              />
            </div>
            <div className="space-y-2">
              <Label>Responsable</Label>
              <Select value={new_responsible_user_id} onValueChange={set_new_responsible_user_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin responsable</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Departamento responsable</Label>
              <Select value={new_responsible_department_id} onValueChange={set_new_responsible_department_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin departamento</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Año asociado</Label>
              <Select value={new_year} onValueChange={set_new_year}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin año (todos los trimestres)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin año</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="pb-2 space-y-2">
              <Label htmlFor="new_remi_progress">Progreso (%)</Label>
              <Input
                id="new_remi_progress"
                type="number"
                min={0}
                max={100}
                value={new_remi_progress}
                onChange={(event) => set_new_remi_progress(Number(event.target.value))}
                onFocus={(e) => e.target.select()}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-border flex-shrink-0">
            <Button variant="outline" onClick={() => set_is_create_modal_open(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handle_create_remi}
              disabled={is_saving_remi || !new_remi_name.trim()}
            >
              {is_saving_remi ? <Spinner className="mr-2 h-4 w-4" /> : null}
              {is_saving_remi ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Editar REMI sheet ──────────────────────────────────────────────── */}
      <Sheet open={is_edit_sheet_open} onOpenChange={set_is_edit_sheet_open}>
        <SheetContent
          side="right"
          className="flex h-full w-full sm:w-[480px] sm:max-w-[480px] flex-col overflow-y-auto p-6 pt-12 sm:p-8 sm:pt-14"
        >
          <SheetHeader className="p-0">
            <SheetTitle>Editar REMI</SheetTitle>
            <SheetDescription>
              Modificá los atributos del resultado estratégico.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="edit_name">Nombre</Label>
              <Input
                id="edit_name"
                value={edit_name}
                onChange={(e) => set_edit_name(e.target.value)}
                placeholder="Nombre del REMI"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_description">Descripción</Label>
              <Textarea
                id="edit_description"
                value={edit_description}
                onChange={(e) => set_edit_description(e.target.value)}
                placeholder="Detalle estratégico del REMI"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Responsable</Label>
              <Select value={edit_responsible_user_id} onValueChange={set_edit_responsible_user_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin responsable</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Departamento responsable</Label>
              <Select value={edit_responsible_department_id} onValueChange={set_edit_responsible_department_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin departamento</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Año asociado</Label>
              <Select value={edit_year} onValueChange={set_edit_year}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin año (todos los trimestres)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin año</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_progress">Progreso (%)</Label>
              <Input
                id="edit_progress"
                type="number"
                min={0}
                max={100}
                value={edit_progress}
                onChange={(e) => set_edit_progress(Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
          </div>
          <SheetFooter className="mt-auto gap-2 p-0 pt-6">
            <Button variant="outline" onClick={() => set_is_edit_sheet_open(false)} disabled={is_saving_edit}>
              Cancelar
            </Button>
            <Button
              onClick={handle_save_edit}
              disabled={is_saving_edit || !edit_name.trim()}
            >
              {is_saving_edit ? <Spinner className="mr-2 h-4 w-4" /> : null}
              {is_saving_edit ? "Guardando..." : "Guardar"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

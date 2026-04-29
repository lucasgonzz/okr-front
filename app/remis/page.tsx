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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Quarter, REMI, Objective } from "@/lib/types";
import {
  Flag,
  Target,
  ChevronRight,
  ChevronDown,
  Building2,
  User,
  ExternalLink,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// REMI Card with expandable objectives
function REMICard({
  remi,
  associatedObjectives,
  index,
}: {
  remi: REMI;
  associatedObjectives: Objective[];
  index: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate aggregated stats
  const stats = useMemo(() => {
    const total = associatedObjectives.length;
    let totalProgress = 0;
    let completedCount = 0;
    let atRiskCount = 0;

    associatedObjectives.forEach((obj) => {
      const calculated = calculateObjectiveProgress(obj);
      totalProgress += calculated.progress;
      if (calculated.status === "completado") completedCount++;
      if (calculated.status === "en-riesgo") atRiskCount++;
    });

    return {
      total,
      avgProgress: total > 0 ? Math.round(totalProgress / total) : 0,
      completed: completedCount,
      atRisk: atRiskCount,
    };
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
            <div className="flex items-start gap-4 flex-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
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
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              {remi.responsibleUser ? (
                <>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={remi.responsibleUser.avatar} />
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

            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Objetivos</p>
                <p className="text-sm font-medium text-foreground">
                  {stats.total}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Progreso Prom.</p>
                <p className="text-sm font-medium text-foreground">
                  {stats.avgProgress}%
                </p>
              </div>
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
    selected_quarter,
    set_selected_quarter,
    refreshObjectives,
    refreshRemis,
    refreshUsers,
    refreshDepartments,
    is_loading,
  } = useData();
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(selected_quarter as Quarter);
  const [is_create_modal_open, set_is_create_modal_open] = useState(false);
  const [new_remi_name, set_new_remi_name] = useState("");
  const [new_remi_description, set_new_remi_description] = useState("");
  const [new_responsible_user_id, set_new_responsible_user_id] = useState("none");
  const [new_responsible_department_id, set_new_responsible_department_id] = useState("none");
  const [is_saving_remi, set_is_saving_remi] = useState(false);

  useEffect(() => {
    void Promise.all([refreshObjectives(), refreshRemis()]);
  }, [refreshObjectives, refreshRemis]);

  useEffect(() => {
    if (!is_create_modal_open) return;
    if (users.length === 0) {
      void refreshUsers();
    }
    if (departments.length === 0) {
      void refreshDepartments();
    }
  }, [is_create_modal_open, users.length, departments.length, refreshUsers, refreshDepartments]);

  // Get objectives grouped by REMI
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

  // Calculate overall stats
  const overallStats = useMemo(() => {
    let totalObjectives = 0;
    let totalProgress = 0;
    let completedCount = 0;
    let atRiskCount = 0;

    remis.forEach((remi) => {
      const objs = remiObjectivesMap.get(remi.id) || [];
      totalObjectives += objs.length;
      
      objs.forEach((obj) => {
        const calculated = calculateObjectiveProgress(obj);
        totalProgress += calculated.progress;
        if (calculated.status === "completado") completedCount++;
        if (calculated.status === "en-riesgo") atRiskCount++;
      });
    });

    return {
      totalREMIs: remis.length,
      totalObjectives,
      avgProgress: totalObjectives > 0 ? Math.round(totalProgress / totalObjectives) : 0,
      completed: completedCount,
      atRisk: atRiskCount,
    };
  }, [remiObjectivesMap, remis]);

  /**
   * Crea un REMI nuevo usando endpoint real del API.
   */
  const handle_create_remi = () => {
    if (!new_remi_name.trim()) return;

    set_is_saving_remi(true);

    apiFetch("/remis", {
      method: "POST",
      body: JSON.stringify({
        name: new_remi_name.trim(),
        description: new_remi_description.trim() || null,
        responsible_user_id:
          new_responsible_user_id !== "none" ? new_responsible_user_id : null,
        responsible_department_id:
          new_responsible_department_id !== "none"
            ? new_responsible_department_id
            : null,
      }),
    })
      .then(() => {
        set_is_create_modal_open(false);
        set_new_remi_name("");
        set_new_remi_description("");
        set_new_responsible_user_id("none");
        set_new_responsible_department_id("none");
        return refreshRemis();
      })
      .finally(() => {
        set_is_saving_remi(false);
      });
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

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-8 grid grid-cols-5 gap-4"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                  <Flag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {overallStats.totalREMIs}
                  </p>
                  <p className="text-xs text-muted-foreground">REMIs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Target className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {overallStats.totalObjectives}
                  </p>
                  <p className="text-xs text-muted-foreground">Objetivos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/15">
                  <TrendingUp className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {overallStats.avgProgress}%
                  </p>
                  <p className="text-xs text-muted-foreground">Progreso Prom.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {overallStats.completed}
                  </p>
                  <p className="text-xs text-muted-foreground">Completados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {overallStats.atRisk}
                  </p>
                  <p className="text-xs text-muted-foreground">En Riesgo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* REMI Cards */}
        <div className="space-y-6">
          {is_loading ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-10">
              <Spinner className="mb-3 h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cargando REMIs...</p>
            </div>
          ) : remis.map((remi, index) => (
            <REMICard
              key={remi.id}
              remi={remi}
              associatedObjectives={remiObjectivesMap.get(remi.id) || []}
              index={index}
            />
          ))}
        </div>
      </div>

      <Dialog open={is_create_modal_open} onOpenChange={set_is_create_modal_open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo REMI</DialogTitle>
            <DialogDescription>
              Crea un nuevo resultado estratégico para agrupar objetivos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
              <Select
                value={new_responsible_user_id}
                onValueChange={set_new_responsible_user_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin responsable</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Departamento responsable</Label>
              <Select
                value={new_responsible_department_id}
                onValueChange={set_new_responsible_department_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin departamento</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
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
    </AppShell>
  );
}

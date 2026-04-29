"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { KpiCard } from "@/components/okr/kpi-card";
import { ProgressBar } from "@/components/okr/progress-bar";
import { StatusBadge } from "@/components/okr/status-badge";
import { ProgressChart, StatusPieChart } from "@/components/okr/charts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useData } from "@/lib/data-context";
import { calculateObjectiveProgress } from "@/lib/okr-calculations";
import type { Quarter } from "@/lib/types";
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
  ChevronRight,
  ArrowUpRight,
  Circle,
} from "lucide-react";
import { format } from "date-fns";

export default function ExecutiveDashboard() {
  const {
    objectives,
    users,
    departments,
    selected_quarter,
    set_selected_quarter,
    refreshObjectives,
    refreshUsers,
    refreshDepartments,
  } = useData();
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(selected_quarter as Quarter);

  useEffect(() => {
    void Promise.all([refreshObjectives(), refreshUsers(), refreshDepartments()]);
  }, [refreshObjectives, refreshUsers, refreshDepartments]);

  const departmentStats = departments.map((department) => {
    const department_objectives = objectives.filter((objective) => objective.department.id === department.id);
    const average_progress = department_objectives.length > 0
      ? Math.round(
          department_objectives.reduce((sum, objective) => sum + calculateObjectiveProgress(objective).progress, 0) /
            department_objectives.length
        )
      : 0;

    return {
      ...department,
      objectiveCount: department_objectives.length,
      averageProgress: average_progress,
    };
  });


  // Calculate stats from context data
  const stats = {
    totalObjectives: objectives.length,
    completedObjectives: objectives.filter((o) => calculateObjectiveProgress(o).status === "completado").length,
    enRiesgoObjectives: objectives.filter((o) => calculateObjectiveProgress(o).status === "en-riesgo").length,
    sinEstadoObjectives: objectives.filter((o) => calculateObjectiveProgress(o).status === "").length,
    averageProgress: objectives.length > 0
      ? Math.round(objectives.reduce((sum, o) => sum + calculateObjectiveProgress(o).progress, 0) / objectives.length)
      : 0,
    totalKeyResults: objectives.reduce((sum, o) => sum + o.keyResults.length, 0),
    completedKeyResults: objectives.reduce((sum, o) => sum + o.keyResults.filter((kr) => kr.status === "completado").length, 0),
  };

  const progressOverTime = [
    { week: "S1", progress: 0, target: 25 },
    { week: "S2", progress: 0, target: 35 },
    { week: "S3", progress: 0, target: 45 },
    { week: "S4", progress: stats.averageProgress, target: 55 },
  ];

  const statusDistribution = [
    { status: "Sin Estado", count: stats.sinEstadoObjectives, fill: "var(--color-muted-foreground)" },
    { status: "En Riesgo", count: stats.enRiesgoObjectives, fill: "var(--color-warning)" },
    { status: "Completado", count: stats.completedObjectives, fill: "var(--color-success)" },
  ];

  // Get at-risk objectives (status === "en-riesgo")
  const atRiskObjectives = objectives.filter((o) => {
    const calculated = calculateObjectiveProgress(o);
    return calculated.status === "en-riesgo";
  });

  // Calculate owner workload
  const ownerWorkload = users
    .map((user) => {
      const userObjectives = objectives.filter((o) => o.owner.id === user.id);
      const userKeyResults = objectives.flatMap((o) =>
        o.keyResults.filter((kr) => kr.owner.id === user.id)
      );
      return {
        user,
        objectives: userObjectives.length,
        keyResults: userKeyResults.length,
        avgProgress:
          userObjectives.length > 0
            ? Math.round(
                userObjectives.reduce((acc, o) => {
                  const calc = calculateObjectiveProgress(o);
                  return acc + calc.progress;
                }, 0) / userObjectives.length
              )
            : 0,
      };
    })
    .filter((w) => w.objectives > 0 || w.keyResults > 0)
    .sort((a, b) => b.objectives - a.objectives);

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
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Dashboard Ejecutivo
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Resumen de desempeño OKR Q4 2024 al{" "}
              {format(new Date(), "d MMMM, yyyy")}
            </p>
          </motion.div>
        </div>

        {/* KPI Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Objetivos"
            value={stats.totalObjectives}
            description="Activos este trimestre"
            icon={Target}
            delay={0}
          />
          <KpiCard
            title="Completados"
            value={stats.completedObjectives}
            trend={{ value: 8, label: "vs trimestre anterior" }}
            icon={CheckCircle2}
            delay={0.05}
          />
          <KpiCard
            title="En Riesgo"
            value={stats.enRiesgoObjectives}
            trend={{ value: -5, label: "vs semana pasada" }}
            icon={AlertTriangle}
            delay={0.1}
          />
          <KpiCard
            title="Progreso Promedio"
            value={`${stats.averageProgress}%`}
            trend={{ value: 5, label: "vs objetivo" }}
            icon={TrendingUp}
            delay={0.15}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Charts and Department Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quarterly Progress Chart */}
            <ProgressChart data={progressOverTime} />

            {/* Department Progress Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="rounded-xl border border-border bg-card"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Progreso por Departamento
                </h3>
                <Link href="/departments">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Ver Todos
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {departmentStats.map((dept, index) => (
                    <motion.div
                      key={dept.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.03 }}
                      className="group"
                    >
                      <Link href={`/objectives?department=${dept.id}`}>
                        <div className="flex items-center justify-between rounded-lg p-2 -mx-2 hover:bg-secondary/50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: dept.color }}
                            />
                            <span className="text-sm font-medium text-foreground">
                              {dept.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {dept.objectiveCount} objetivos
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-32">
                              <ProgressBar
                                value={dept.averageProgress}
                                size="sm"
                                animated={false}
                              />
                            </div>
                            <span className="w-10 text-right text-sm font-medium text-foreground">
                              {dept.averageProgress}%
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Objectives at Risk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="rounded-xl border border-border bg-card"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Objetivos que Requieren Atención
                  </h3>
                </div>
                <Link href="/objectives?status=en-riesgo">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Ver Todos
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <ScrollArea className="max-h-[300px]">
                <div className="p-4 space-y-3">
                  {atRiskObjectives.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mb-2 text-success" />
                      <p className="text-sm">No hay objetivos en riesgo</p>
                    </div>
                  ) : (
                    atRiskObjectives.slice(0, 5).map((objective, index) => {
                      const calculated = calculateObjectiveProgress(objective);
                      return (
                        <motion.div
                          key={objective.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                        >
                          <Link href={`/objectives/${objective.id}`}>
                            <div className="group flex items-start gap-4 rounded-lg border border-border p-4 hover:border-primary/30 hover:bg-secondary/30 transition-colors cursor-pointer">
                              <div
                                className="mt-1 h-2 w-2 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: objective.department.color,
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                    {objective.title}
                                  </h4>
                                  <StatusBadge
                                    status={calculated.status}
                                    size="sm"
                                  />
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                                  {objective.department.name} • {objective.owner.name}
                                </p>
                                <div className="mt-2 flex items-center gap-3">
                                  <ProgressBar
                                    value={calculated.progress}
                                    size="sm"
                                    animated={false}
                                    className="flex-1"
                                  />
                                  <span className="text-xs font-medium text-foreground">
                                    {calculated.progress}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </div>

          {/* Right Column - Status Distribution and Owner Workload */}
          <div className="space-y-6">
            {/* Status Distribution */}
            <StatusPieChart data={statusDistribution} />

            {/* Owner Workload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="rounded-xl border border-border bg-card"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Carga de Trabajo por Responsable
                  </h3>
                </div>
              </div>
              <ScrollArea className="max-h-[320px]">
                <div className="p-4 space-y-3">
                  {ownerWorkload.slice(0, 8).map((item, index) => (
                    <motion.div
                      key={item.user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.5 + index * 0.05,
                      }}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={item.user.avatar} />
                        <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                          {item.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.objectives} obj • {item.keyResults} KRs
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {item.avgProgress}%
                        </p>
                        <p className="text-xs text-muted-foreground">prom</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

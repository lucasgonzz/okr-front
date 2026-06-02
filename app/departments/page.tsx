"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { ProgressBar } from "@/components/okr/progress-bar";
import { useData } from "@/lib/data-context";
import { calculateObjectiveProgress } from "@/lib/okr-calculations";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/select";
import type { Quarter } from "@/lib/types";
import {
  Target,
  AlertTriangle,
  ChevronRight,
  Plus,
} from "lucide-react";

const DEPARTMENT_COLORS = [
  { name: "Terracota", hex: "#C0785A" },
  { name: "Azul marino", hex: "#3B5278" },
  { name: "Salvia", hex: "#7A9E87" },
  { name: "Ciruela", hex: "#7D5A7A" },
  { name: "Mostaza", hex: "#C9A84C" },
  { name: "Pizarra", hex: "#6B7A8D" },
  { name: "Coral suave", hex: "#D4856A" },
  { name: "Verde musgo", hex: "#5C7A5C" },
  { name: "Arena", hex: "#B5A48B" },
  { name: "Borgoña", hex: "#7A3B4B" },
];

export default function DepartmentsPage() {
  const {
    objectives,
    departments,
    selected_quarter,
    set_selected_quarter,
    refreshObjectives,
    refreshDepartments,
    is_loading,
  } = useData();
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(selected_quarter as Quarter);
  const [is_create_modal_open, set_is_create_modal_open] = useState(false);
  const [new_department_name, set_new_department_name] = useState("");
  const [new_department_color, set_new_department_color] = useState(DEPARTMENT_COLORS[0].hex);
  const [is_saving_department, set_is_saving_department] = useState(false);

  useEffect(() => {
    void Promise.all([refreshObjectives(), refreshDepartments()]);
  }, [refreshObjectives, refreshDepartments]);

  const departmentStats = useMemo(() => {
    return departments.map((department) => {
      const department_objectives = objectives.filter(
        (objective) => objective.department.id === department.id
      );

      const at_risk_count = department_objectives.filter(
        (objective) => calculateObjectiveProgress(objective).status === "en-riesgo"
      ).length;

      const average_progress = department_objectives.length > 0
        ? Math.round(
            department_objectives.reduce((sum, objective) => {
              return sum + calculateObjectiveProgress(objective).progress;
            }, 0) / department_objectives.length
          )
        : 0;

      return {
        ...department,
        objectiveCount: department_objectives.length,
        atRiskCount: at_risk_count,
        averageProgress: average_progress,
      };
    });
  }, [departments, objectives]);

  /**
   * Crea un departamento nuevo usando endpoint real del API.
   */
  const handle_create_department = () => {
    if (!new_department_name.trim()) return;

    set_is_saving_department(true);

    apiFetch("/departments", {
      method: "POST",
      body: JSON.stringify({
        name: new_department_name.trim(),
        color: new_department_color,
      }),
    })
      .then(() => {
        set_is_create_modal_open(false);
        set_new_department_name("");
        set_new_department_color(DEPARTMENT_COLORS[0].hex);
        return refreshDepartments();
      })
      .finally(() => {
        set_is_saving_department(false);
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
      <div className="mx-auto max-w-[1400px]">
        {/* Page Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Departamentos
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Progreso de OKRs en todos los departamentos para {selectedQuarter}
            </p>
          </motion.div>
          <Button onClick={() => set_is_create_modal_open(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo departamento
          </Button>
        </div>

        {/* Department Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {is_loading ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-border bg-card p-10">
              <Spinner className="mb-3 h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cargando departamentos...</p>
            </div>
          ) : departmentStats.map((dept, index) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link href={`/objectives?department=${dept.id}`}>
                <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer">
                  {/* Department Color Accent */}
                  <div
                    className="absolute top-0 left-0 h-1 w-full"
                    style={{ backgroundColor: dept.color }}
                  />

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${dept.color}20` }}
                      >
                        <span
                          className="text-lg font-bold"
                          style={{ color: dept.color }}
                        >
                          {dept.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {dept.name}
                        </h3>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>Progreso Promedio</span>
                      <span className="font-medium text-foreground">
                        {dept.averageProgress}%
                      </span>
                    </div>
                    <ProgressBar
                      value={dept.averageProgress}
                      size="md"
                      animated={false}
                    />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {dept.objectiveCount}
                        </p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          Objetivos
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {dept.atRiskCount}
                        </p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">En Riesgo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog open={is_create_modal_open} onOpenChange={set_is_create_modal_open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo departamento</DialogTitle>
            <DialogDescription>
              Crea un nuevo departamento para usarlo en objetivos y responsables.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="department_name">Nombre</Label>
              <Input
                id="department_name"
                value={new_department_name}
                onChange={(event) => set_new_department_name(event.target.value)}
                placeholder="Ej: Finanzas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department_color">Color</Label>
              <Select value={new_department_color} onValueChange={set_new_department_color}>
                <SelectTrigger id="department_color" className="w-full">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: new_department_color }}
                    />
                    <span className="text-sm">
                      {DEPARTMENT_COLORS.find((c) => c.hex === new_department_color)?.name}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENT_COLORS.map((color) => (
                    <SelectItem key={color.hex} value={color.hex}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </div>
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
              onClick={handle_create_department}
              disabled={is_saving_department || !new_department_name.trim()}
            >
              {is_saving_department ? <Spinner className="mr-2 h-4 w-4" /> : null}
              {is_saving_department ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

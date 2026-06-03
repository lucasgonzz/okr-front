"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { canManageDepartmentResource } from "@/lib/permissions";
import type { Objective, Quarter, ObjectiveStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ObjectiveFormProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  objective?: Objective;
}

export function ObjectiveForm({ open, onClose, mode, objective }: ObjectiveFormProps) {
  const { user } = useAuth();
  const isStandardUser = user?.role === "user";
  const {
    addObjective,
    updateObjective,
    remis,
    users,
    departments,
    quarters,
    refreshRemis,
    refreshUsers,
    refreshDepartments,
    refreshQuarters,
  } = useData();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [quarter, setQuarter] = useState<Quarter>("Q1-2025");
  const [remiId, setRemiId] = useState<string>("none");
  const [calculationMode, setCalculationMode] = useState<"automatic" | "manual">("automatic");
  const [manualProgress, setManualProgress] = useState(0);
  const [manualStatus, setManualStatus] = useState<ObjectiveStatus>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opening or when objective changes
  useEffect(() => {
    if (!open) return;
    if (remis.length === 0) {
      void refreshRemis();
    }
    if (users.length === 0) {
      void refreshUsers();
    }
    if (departments.length === 0) {
      void refreshDepartments();
    }
    if (quarters.length === 0) {
      void refreshQuarters();
    }
  }, [
    open,
    remis.length,
    users.length,
    departments.length,
    quarters.length,
    refreshRemis,
    refreshUsers,
    refreshDepartments,
    refreshQuarters,
  ]);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && objective) {
        setTitle(objective.title ?? "");
        setDescription(objective.description ?? "");
        setDepartmentId(objective.department?.id ?? "none");
        setOwnerId(objective.owner.id);
        setQuarter(objective.quarter);
        setRemiId(objective.remi?.id || "none");
        setCalculationMode(objective.calculationMode);
        setManualProgress(objective.manualProgress ?? objective.progress ?? 0);
        setManualStatus(objective.manualStatus ?? objective.status ?? "");
      } else {
        // Create mode - reset to defaults
        setTitle("");
        setDescription("");
        setDepartmentId(isStandardUser && user?.departmentId ? user.departmentId : "");
        setOwnerId(isStandardUser && user?.id ? user.id : "");
        setQuarter(quarters[0]?.name || "Q1-2025");
        setRemiId("none");
        setCalculationMode("automatic");
        setManualProgress(0);
        setManualStatus("");
      }
    }
  }, [open, mode, objective, quarters, isStandardUser, user?.departmentId, user?.id]);

  const availableDepartments =
    isStandardUser && user?.departmentId
      ? departments.filter((d) => d.id === user.departmentId)
      : departments;

  const handleSubmit = async () => {
    if (!title.trim() || !ownerId) return;
    if (mode === "create" && (!departmentId || departmentId === "none")) return;

    if (
      mode === "edit" &&
      objective &&
      !canManageDepartmentResource(user, objective.department?.id)
    ) {
      return;
    }

    const selectedDepartment =
      departmentId && departmentId !== "none"
        ? departments.find((d) => d.id === departmentId) ?? null
        : null;
    const selectedOwner = users.find((u) => u.id === ownerId);
    const selectedRemi = remiId !== "none" ? remis.find((r) => r.id === remiId) || null : null;
    if (mode === "create" && !selectedDepartment) return;
    if (!selectedOwner) return;

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const newObjective: Objective = {
          id: "obj-" + Date.now(),
          title: title.trim(),
          description: description.trim(),
          department: selectedDepartment,
          quarter,
          owner: selectedOwner,
          status: calculationMode === "manual" ? manualStatus : "",
          progress: calculationMode === "manual" ? manualProgress : 0,
          keyResults: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          remi: selectedRemi,
          calculationMode,
          manualProgress: calculationMode === "manual" ? manualProgress : undefined,
          manualStatus: calculationMode === "manual" ? manualStatus : undefined,
        };
        await addObjective(newObjective);
      } else if (objective) {
        await updateObjective(objective.id, {
          title: title.trim(),
          description: description.trim(),
          department: selectedDepartment,
          quarter,
          owner: selectedOwner,
          remi: selectedRemi,
          calculationMode,
          manualProgress: calculationMode === "manual" ? manualProgress : undefined,
          manualStatus: calculationMode === "manual" ? manualStatus : undefined,
          status: calculationMode === "manual" ? manualStatus : objective.status,
          progress: calculationMode === "manual" ? manualProgress : objective.progress,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className={cn(
          "w-full sm:w-[560px] sm:max-w-[560px] overflow-y-auto px-[15px]",
          mode === "create" && "py-[15px]"
        )}
      >
        <SheetHeader className={mode === "create" ? "p-0" : undefined}>
          <SheetTitle>
            {mode === "create" ? "Nuevo Objetivo" : "Editar Objetivo"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Crea un nuevo objetivo para tu equipo"
              : "Modifica los detalles del objetivo"}
          </SheetDescription>
        </SheetHeader>

        <div className={cn("space-y-6", mode === "create" ? "py-0" : "py-6")}>
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Aumentar ingresos recurrentes"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el objetivo..."
              rows={3}
            />
          </div>

          {/* Departamento */}
          <div className="space-y-2">
            <Label>Departamento{mode === "create" ? " *" : ""}</Label>
            <Select
              value={departmentId}
              onValueChange={setDepartmentId}
              disabled={isStandardUser}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un departamento" />
              </SelectTrigger>
              <SelectContent>
                {!isStandardUser && (
                  <SelectItem value="none">Sin departamento</SelectItem>
                )}
                {availableDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: dept.color }}
                      />
                      {dept.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Responsable */}
          <div className="space-y-2">
            <Label>Responsable *</Label>
            <Select value={ownerId} onValueChange={setOwnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un responsable" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {user.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quarter */}
          <div className="space-y-2">
            <Label>Trimestre</Label>
            <Select value={quarter} onValueChange={(v) => setQuarter(v as Quarter)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {quarters.map((q) => (
                  <SelectItem key={q.id} value={q.name}>
                    {q.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* REMI asociada */}
          <div className="space-y-2">
            <Label>REMI asociada</Label>
            <Select value={remiId} onValueChange={setRemiId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una REMI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin REMI</SelectItem>
                {remis.map((remi) => (
                  <SelectItem key={remi.id} value={remi.id}>
                    {remi.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modo de cálculo */}
          <div className="space-y-2">
            <Label>Modo de cálculo</Label>
            <Select
              value={calculationMode}
              onValueChange={(v) => setCalculationMode(v as "automatic" | "manual")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automatic">Automático</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {calculationMode === "automatic"
                ? "El progreso se calcula automáticamente desde los Key Results"
                : "Define manualmente el progreso y estado"}
            </p>
          </div>

          {/* Campos manuales (solo si modo manual) */}
          {calculationMode === "manual" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="manualProgress">Progreso manual (%)</Label>
                <Input
                  id="manualProgress"
                  type="number"
                  min={0}
                  max={100}
                  value={manualProgress}
                  onChange={(e) => setManualProgress(Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>

              <div className="space-y-2">
                <Label>Estado manual</Label>
                <Select
                  value={manualStatus === "" ? "none" : manualStatus}
                  onValueChange={(v) =>
                    setManualStatus((v === "none" ? "" : v) as ObjectiveStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin estado</SelectItem>
                    <SelectItem value="en-riesgo">En riesgo</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <SheetFooter className={cn("gap-2", mode === "create" && "p-0")}>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !title.trim() ||
              !ownerId ||
              (mode === "create" && (!departmentId || departmentId === "none"))
            }
          >
            {isSubmitting ? <Spinner className="mr-2" /> : null}
            {isSubmitting ? (mode === "create" ? "Creando..." : "Guardando...") : "Guardar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

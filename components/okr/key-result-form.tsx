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
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { useData } from "@/lib/data-context";
import type { KeyResult, KeyResultStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface KeyResultFormProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  objectiveId: string;
  keyResult?: KeyResult;
}

export function KeyResultForm({
  open,
  onClose,
  mode,
  objectiveId,
  keyResult,
}: KeyResultFormProps) {
  const { addKeyResult, updateKeyResult, users, refreshUsers } = useData();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [startValue, setStartValue] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [target, setTarget] = useState(100);
  const [unit, setUnit] = useState("%");
  const [unitSelect, setUnitSelect] = useState("%");

  const UNIT_OPTIONS = ["$", "USD", "Uni", "%", "Otros"];
  const [status, setStatus] = useState<KeyResultStatus>("");
  const [sumsToObjective, setSumsToObjective] = useState(true);
  const [blockers, setBlockers] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opening or when keyResult changes
  useEffect(() => {
    if (!open) return;
    if (users.length === 0) {
      void refreshUsers();
    }
  }, [open, users.length, refreshUsers]);

  // Reset form when opening or when keyResult changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && keyResult) {
        setTitle(keyResult.title);
        setDescription(keyResult.description ?? "");
        setOwnerId(keyResult.owner.id);
        setStartValue(keyResult.startValue);
        setCurrentValue(keyResult.currentValue);
        setTarget(keyResult.target);
        const loadedUnit = keyResult.unit ?? "%";
        setUnit(loadedUnit);
        setUnitSelect(UNIT_OPTIONS.includes(loadedUnit) ? loadedUnit : "Otros");
        setStatus(keyResult.status ?? "");
        setSumsToObjective(keyResult.sumsToObjective);
        setBlockers(keyResult.blockers ?? "");
        setComments(keyResult.comments ?? "");
      } else {
        // Create mode - reset to defaults
        setTitle("");
        setDescription("");
        setOwnerId("");
        setStartValue(0);
        setCurrentValue(0);
        setTarget(100);
        setUnit("%");
        setUnitSelect("%");
        setStatus("");
        setSumsToObjective(true);
        setBlockers("");
        setComments("");
      }
    }
  }, [open, mode, keyResult]);

  // Calculate progress and status automatically
  const calculateProgress = (current: number, targetVal: number): number => {
    if (targetVal === 0) return 0;
    return Math.min(Math.round((current / targetVal) * 100), 100);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !ownerId || target <= 0) return;

    const selectedOwner = users.find((u) => u.id === ownerId);
    if (!selectedOwner) return;
    const progress = calculateProgress(currentValue, target);

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const newKR: KeyResult = {
          id: "kr-" + Date.now(),
          objectiveId,
          title: title.trim(),
          description: description.trim(),
          owner: selectedOwner,
          status,
          progress,
          target,
          currentValue,
          unit: unit.trim() || "%",
          startValue,
          sumsToObjective,
          blockers: blockers.trim(),
          comments: comments.trim(),
        };
        await addKeyResult(objectiveId, newKR);
      } else if (keyResult) {
        await updateKeyResult(objectiveId, keyResult.id, {
          title: title.trim(),
          description: description.trim(),
          owner: selectedOwner,
          status,
          progress,
          target,
          currentValue,
          unit: unit.trim() || "%",
          startValue,
          sumsToObjective,
          blockers: blockers.trim(),
          comments: comments.trim(),
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewProgress = calculateProgress(currentValue, target);

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className={cn(
          "w-[560px] sm:max-w-[560px] overflow-y-auto px-[15px]",
          mode === "create" && "py-[15px]"
        )}
      >
        <SheetHeader className={mode === "create" ? "p-0" : undefined}>
          <SheetTitle>
            {mode === "create" ? "Nuevo Key Result" : "Editar Key Result"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Agrega un nuevo resultado clave al objetivo"
              : "Modifica los detalles del key result"}
          </SheetDescription>
        </SheetHeader>

        <div className={cn("space-y-6", mode === "create" ? "py-0" : "py-6")}>
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="kr-title">Título *</Label>
            <Input
              id="kr-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Alcanzar 10M en ventas"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="kr-description">Descripción</Label>
            <Textarea
              id="kr-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el key result..."
              rows={2}
            />
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
                        <AvatarImage src={user.avatar} />
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

          {/* Valores: Start, Current, Target */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startValue">Valor inicial</Label>
              <Input
                id="startValue"
                type="number"
                value={startValue}
                onChange={(e) => setStartValue(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentValue">Valor actual</Label>
              <Input
                id="currentValue"
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">Valor target *</Label>
              <Input
                id="target"
                type="number"
                min={1}
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Unidad */}
          <div className="space-y-2">
            <Label>Unidad</Label>
            <Select
              value={unitSelect}
              onValueChange={(value) => {
                setUnitSelect(value);
                if (value === "Otros") setUnit(""); else setUnit(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná una unidad" />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {unitSelect === "Otros" && (
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Escribí la unidad personalizada..."
              />
            )}
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={status === "" ? "none" : status}
              onValueChange={(v) => setStatus((v === "none" ? "" : v) as KeyResultStatus)}
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

          {/* Progreso calculado (preview) */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progreso calculado</span>
              <span className="text-lg font-semibold text-foreground">{previewProgress}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${previewProgress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Estado seleccionado:{" "}
              {status === "en-riesgo" ? "En riesgo" : status === "completado" ? "Completado" : "Sin estado"}
            </p>
          </div>

          {/* Suma al objetivo */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="sumsToObjective">¿Suma al objetivo?</Label>
              <p className="text-xs text-muted-foreground">
                Si está activo, este KR contribuye al progreso del objetivo
              </p>
            </div>
            <Switch
              id="sumsToObjective"
              checked={sumsToObjective}
              onCheckedChange={setSumsToObjective}
            />
          </div>

          {/* Bloqueadores */}
          <div className="space-y-2">
            <Label htmlFor="blockers">Bloqueadores</Label>
            <Textarea
              id="blockers"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="Lista cualquier impedimento o bloqueo..."
              rows={2}
            />
          </div>

          {/* Comentarios */}
          <div className="space-y-2">
            <Label htmlFor="comments">Comentarios</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Notas adicionales..."
              rows={2}
            />
          </div>
        </div>

        <SheetFooter className={cn("gap-2", mode === "create" && "p-0")}>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim() || !ownerId || target <= 0}>
            {isSubmitting ? <Spinner className="mr-2" /> : null}
            {isSubmitting ? (mode === "create" ? "Creando..." : "Guardando...") : "Guardar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

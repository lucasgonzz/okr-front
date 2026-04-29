"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { ProgressBar } from "@/components/okr/progress-bar";
import { ProgressRing } from "@/components/okr/progress-ring";
import { StatusBadge } from "@/components/okr/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateObjectiveProgress } from "@/lib/okr-calculations";
import { useData } from "@/lib/data-context";
import { ObjectiveForm } from "@/components/okr/objective-form";
import { KeyResultForm } from "@/components/okr/key-result-form";
import type { Quarter, KeyResult, Objective } from "@/lib/types";
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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  ArrowLeft,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle2,
  User,
  Building2,
  Flag,
  Calculator,
  Check,
  AlertCircle,
  Pencil,
  Trash2,
  Plus,
  Save,
  X,
} from "lucide-react";

// Key Result Card Component
function KeyResultCard({ 
  keyResult, 
  index,
  objectiveId,
  onEdit,
  onDelete,
  onQuickUpdate,
}: { 
  keyResult: KeyResult; 
  index: number;
  objectiveId: string;
  onEdit: (kr: KeyResult) => void;
  onDelete: (kr: KeyResult) => void;
  onQuickUpdate: (krId: string, currentValue: number) => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [quickValue, setQuickValue] = useState(keyResult.currentValue);

  const handleQuickSave = () => {
    onQuickUpdate(keyResult.id, quickValue);
    setIsUpdating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
      className="group rounded-xl border border-border bg-card p-5 relative"
    >
      {/* Edit/Delete Actions */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(keyResult)}
          className="p-1.5 rounded hover:bg-primary/10 transition-colors"
          title="Editar key result"
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
        </button>
        <button
          onClick={() => onDelete(keyResult)}
          className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
          title="Eliminar key result"
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
        </button>
      </div>

      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              KR {index + 1}
            </span>
            <StatusBadge status={keyResult.status} size="sm" />
            {/* Sums to Objective indicator */}
            {keyResult.sumsToObjective ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-0.5">
                <Check className="h-3 w-3" />
                Suma al objetivo
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                No suma al objetivo
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            {keyResult.title}
          </h4>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-4 p-4 rounded-lg bg-secondary/30">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Inicio</p>
          <p className="text-sm font-semibold text-foreground">
            {keyResult.startValue}
            {keyResult.unit}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Actual</p>
          <p className="text-sm font-semibold text-primary">
            {keyResult.currentValue}
            {keyResult.unit}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Meta</p>
          <p className="text-sm font-semibold text-foreground">
            {keyResult.target}
            {keyResult.unit}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Progreso</p>
          <p className="text-sm font-semibold text-foreground">
            {keyResult.progress}%
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar value={keyResult.progress} size="md" showLabel={false} />

      {/* Quick Update */}
      {!isUpdating ? (
        <button
          onClick={() => {
            setQuickValue(keyResult.currentValue);
            setIsUpdating(true);
          }}
          className="mt-3 text-xs text-primary hover:underline"
        >
          Actualizar valor
        </button>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <Input
            type="number"
            value={quickValue}
            onChange={(e) => setQuickValue(Number(e.target.value))}
            className="w-24 h-8 text-sm"
          />
          <span className="text-xs text-muted-foreground">{keyResult.unit}</span>
          <Button size="sm" variant="ghost" className="h-8 px-2" onClick={handleQuickSave}>
            <Save className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setIsUpdating(false)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Blockers - only show if not empty */}
      {keyResult.blockers && (
        <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-xs font-medium text-warning">Bloqueadores</span>
          </div>
          <p className="text-sm text-foreground">{keyResult.blockers}</p>
        </div>
      )}

      {/* Comments - only show if not empty */}
      {keyResult.comments && (
        <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-1">Notas</p>
          <p className="text-sm text-foreground">{keyResult.comments}</p>
        </div>
      )}

      {/* Owner */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={keyResult.owner.avatar} />
            <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
              {keyResult.owner.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            {keyResult.owner.name}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ObjectiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    objectives,
    updateKeyResult,
    deleteKeyResult,
    selected_quarter,
    set_selected_quarter,
    refreshObjectives,
  } = useData();
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(selected_quarter as Quarter);

  // CRUD state
  const [objectiveFormOpen, setObjectiveFormOpen] = useState(false);
  const [krFormOpen, setKrFormOpen] = useState(false);
  const [editingKr, setEditingKr] = useState<KeyResult | null>(null);
  const [deleteKrDialogOpen, setDeleteKrDialogOpen] = useState(false);
  const [krToDelete, setKrToDelete] = useState<KeyResult | null>(null);
  const [isSavingQuickUpdate, setIsSavingQuickUpdate] = useState(false);
  const [isDeletingKr, setIsDeletingKr] = useState(false);

  // Find the objective
  const objective = objectives.find((o) => o.id === id);

  useEffect(() => {
    void refreshObjectives();
  }, [refreshObjectives, id]);

  // CRUD handlers
  const handleEditKr = (kr: KeyResult) => {
    setEditingKr(kr);
    setKrFormOpen(true);
  };

  const handleDeleteKr = (kr: KeyResult) => {
    setKrToDelete(kr);
    setDeleteKrDialogOpen(true);
  };

  const confirmDeleteKr = async () => {
    if (krToDelete && objective) {
      setIsDeletingKr(true);
      try {
        await deleteKeyResult(objective.id, krToDelete.id);
        setKrToDelete(null);
        setDeleteKrDialogOpen(false);
      } finally {
        setIsDeletingKr(false);
      }
    }
  };

  const handleQuickUpdate = async (krId: string, currentValue: number) => {
    if (!objective) return;
    const kr = objective.keyResults.find((k) => k.id === krId);
    if (!kr) return;
    
    const progress = kr.target > 0 ? Math.min(Math.round((currentValue / kr.target) * 100), 100) : 0;
    const status = currentValue >= kr.target ? "completado" : "" as const;
    
    setIsSavingQuickUpdate(true);
    try {
      await updateKeyResult(objective.id, krId, { currentValue, progress, status });
    } finally {
      setIsSavingQuickUpdate(false);
    }
  };

  if (!objective) {
    return (
      <AppShell
        selectedQuarter={selectedQuarter}
        onQuarterChange={(quarter) => {
          setSelectedQuarter(quarter);
          set_selected_quarter(quarter);
        }}
      >
        <div className="flex flex-col items-center justify-center py-20">
          <Target className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-medium text-foreground mb-2">
            Objetivo no encontrado
          </h2>
          <Link href="/objectives">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Objetivos
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  // Calculate progress and status
  const calculated = calculateObjectiveProgress(objective);

  // Identify blockers from key results that are "en-riesgo"
  const blockedKeyResults = objective.keyResults.filter(
    (kr) => kr.status === "en-riesgo"
  );

  return (
    <AppShell
      selectedQuarter={selectedQuarter}
      onQuarterChange={(quarter) => {
        setSelectedQuarter(quarter);
        set_selected_quarter(quarter);
      }}
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Back Button & Edit */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex items-center justify-between"
        >
          <Link href="/objectives">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Objetivos
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => setObjectiveFormOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar Objetivo
          </Button>
        </motion.div>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 rounded-xl border border-border bg-card p-6"
        >
          {/* Top Row with Progress Ring */}
          <div className="flex items-start gap-6 mb-6">
            {/* Progress Ring */}
            <div className="flex-shrink-0">
              <ProgressRing value={calculated.progress} size="lg" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: objective.department.color }}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {objective.department.name}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {objective.quarter}
                </span>
                <StatusBadge status={calculated.status} size="md" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground mb-2">
                {objective.title}
              </h1>
              <p className="text-sm text-muted-foreground line-clamp-2">{objective.description}</p>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-6 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Responsable</p>
                <p className="text-sm font-medium text-foreground">
                  {objective.owner.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Departamento</p>
                <p className="text-sm font-medium text-foreground">
                  {objective.department.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Flag className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">REMI Asociada</p>
                <p className="text-sm font-medium text-foreground">
                  {objective.remi ? (
                    <Link href={`/remis`} className="hover:text-primary transition-colors">
                      {objective.remi.name.length > 20 
                        ? objective.remi.name.substring(0, 20) + "..."
                        : objective.remi.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Calculator className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Modo Cálculo</p>
                <p className="text-sm font-medium text-foreground">
                  {objective.calculationMode === "automatic" ? "Automático" : "Manual"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Trimestre</p>
                <p className="text-sm font-medium text-foreground">
                  {objective.quarter}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Key Results</p>
                <p className="text-sm font-medium text-foreground">
                  {objective.keyResults.filter((kr) => kr.status === "completado").length} / {objective.keyResults.length} Completados
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Key Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Results Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Key Results ({objective.keyResults.length})
                </h2>
                <Button 
                  size="sm" 
                  onClick={() => { setEditingKr(null); setKrFormOpen(true); }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Key Result
                </Button>
              </div>
              <div className="space-y-4">
                {isSavingQuickUpdate ? (
                  <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                    <Spinner className="h-4 w-4" />
                    Guardando actualización...
                  </div>
                ) : null}
                {objective.keyResults.map((kr, index) => (
                  <KeyResultCard 
                    key={kr.id} 
                    keyResult={kr} 
                    index={index}
                    objectiveId={objective.id}
                    onEdit={handleEditKr}
                    onDelete={handleDeleteKr}
                    onQuickUpdate={handleQuickUpdate}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Blockers & Next Steps */}
          <div className="space-y-6">
            {/* Blockers Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Bloqueadores ({blockedKeyResults.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {blockedKeyResults.length > 0 ? (
                    <div className="space-y-3">
                      {blockedKeyResults.map((kr) => (
                        <div
                          key={kr.id}
                          className="p-3 rounded-lg bg-warning/10 border border-warning/20"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-medium text-foreground">
                              {kr.title}
                            </p>
                            <StatusBadge status={kr.status} size="sm" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Actual: {kr.currentValue}
                            {kr.unit} / Meta: {kr.target}
                            {kr.unit}
                          </p>
                          {kr.blockers && (
                            <p className="text-xs text-warning mt-2">
                              {kr.blockers}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No hay bloqueadores identificados
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">
                    Acciones Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/updates" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Ver Logs
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Objective Form Sheet */}
      <ObjectiveForm
        open={objectiveFormOpen}
        onClose={() => setObjectiveFormOpen(false)}
        mode="edit"
        objective={objective}
      />

      {/* Key Result Form Sheet */}
      <KeyResultForm
        open={krFormOpen}
        onClose={() => {
          setKrFormOpen(false);
          setEditingKr(null);
        }}
        mode={editingKr ? "edit" : "create"}
        objectiveId={objective.id}
        keyResult={editingKr ?? undefined}
      />

      {/* Delete KR Confirmation Dialog */}
      <AlertDialog open={deleteKrDialogOpen} onOpenChange={setDeleteKrDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Key Result?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El key result &quot;{krToDelete?.title}&quot; será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setKrToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteKr}
              disabled={isDeletingKr}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingKr ? (
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

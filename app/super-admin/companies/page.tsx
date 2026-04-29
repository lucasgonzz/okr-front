"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Company {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt?: string;
}

interface CreateFormData {
  name: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
}

interface EditFormData {
  name: string;
  active: boolean;
}

const emptyCreate: CreateFormData = {
  name: "",
  admin_name: "",
  admin_email: "",
  admin_password: "",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create dialog
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormData>(emptyCreate);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit dialog
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({ name: "", active: true });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const fetchCompanies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: Company[] }>("/admin/companies");
      setCompanies(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar empresas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ─── Create ─────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    setCreateLoading(true);
    setCreateError(null);
    try {
      const res = await apiFetch<{ company: Company }>("/admin/companies", {
        method: "POST",
        body: JSON.stringify(createForm),
      });
      setCompanies((prev) => [...prev, res.company]);
      setShowCreate(false);
      setCreateForm(emptyCreate);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Error al crear empresa");
    } finally {
      setCreateLoading(false);
    }
  };

  const openCreate = () => {
    setCreateForm(emptyCreate);
    setCreateError(null);
    setShowCreate(true);
  };

  // ─── Edit ────────────────────────────────────────────────────────────────────

  const openEdit = (company: Company) => {
    setEditTarget(company);
    setEditForm({ name: company.name, active: company.active });
    setEditError(null);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await apiFetch<{ company: Company }>(
        `/admin/companies/${editTarget.id}`,
        {
          method: "PUT",
          body: JSON.stringify(editForm),
        }
      );
      setCompanies((prev) =>
        prev.map((c) => (c.id === editTarget.id ? res.company : c))
      );
      setEditTarget(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error al actualizar empresa");
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiFetch(`/admin/companies/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setCompanies((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar empresa");
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Empresas</h1>
            <p className="text-sm text-muted-foreground">
              {companies.length} empresa{companies.length !== 1 ? "s" : ""} registrada
              {companies.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCompanies}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva empresa
          </Button>
        </div>
      </motion.div>

      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No hay empresas registradas
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Crea la primera empresa con el botón "Nueva empresa"
            </p>
          </div>
        ) : (
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company, i) => (
                <motion.tr
                  key={company.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">
                    {company.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {company.slug}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={company.active ? "default" : "secondary"}
                      className={
                        company.active
                          ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                          : ""
                      }
                    >
                      {company.active ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(company)}
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(company)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* ─── Create Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva empresa</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Datos de la empresa
              </p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Nombre de la empresa
                  </label>
                  <Input
                    placeholder="Ej: Acme Corp"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Admin inicial
              </p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Nombre completo
                  </label>
                  <Input
                    placeholder="Ej: María García"
                    value={createForm.admin_name}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, admin_name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="admin@empresa.com"
                    value={createForm.admin_email}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, admin_email: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Contraseña
                  </label>
                  <Input
                    type="password"
                    placeholder="Contraseña temporal"
                    value={createForm.admin_password}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        admin_password: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {createError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {createError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreate(false)}
              disabled={createLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                createLoading ||
                !createForm.name ||
                !createForm.admin_name ||
                !createForm.admin_email ||
                !createForm.admin_password
              }
            >
              {createLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear empresa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar empresa</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Nombre de la empresa
              </label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-foreground">
                Activa
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={editForm.active}
                onClick={() =>
                  setEditForm((f) => ({ ...f, active: !f.active }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  editForm.active ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    editForm.active ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {editError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {editError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditTarget(null)}
              disabled={editLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEdit}
              disabled={editLoading || !editForm.name}
            >
              {editLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirm ─────────────────────────────────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la empresa{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.name}
              </span>{" "}
              junto con todos sus usuarios, departamentos, REMIs y objetivos.
              Esta operación no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Sí, eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

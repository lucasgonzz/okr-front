"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import type { Department, Quarter, User } from "@/lib/types";
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
  Users,
  Building2,
  Shield,
  User as UserIcon,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";

type EditUserForm = {
  name: string;
  email: string;
  departmentId: string;
  role: "admin" | "user";
  password: string;
};

type DepartmentForm = {
  name: string;
  color: string;
};

export default function AdminPage() {
  const {
    users,
    departments,
    selected_quarter,
    set_selected_quarter,
    refreshUsers,
    refreshDepartments,
  } = useData();
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(selected_quarter as Quarter);
  const [searchValue, setSearchValue] = useState("");
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    departmentId: "",
    role: "user" as "admin" | "user",
    email: "",
    password: "",
  });

  const [editUserTarget, setEditUserTarget] = useState<User | null>(null);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserSaving, setEditUserSaving] = useState(false);
  const [editUserForm, setEditUserForm] = useState<EditUserForm>({
    name: "",
    email: "",
    departmentId: "",
    role: "user",
    password: "",
  });

  const [deleteUserTarget, setDeleteUserTarget] = useState<User | null>(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

  const [isCreateDeptOpen, setIsCreateDeptOpen] = useState(false);
  const [isCreatingDept, setIsCreatingDept] = useState(false);
  const [createDeptForm, setCreateDeptForm] = useState<DepartmentForm>({
    name: "",
    color: "#6366F1",
  });

  const [editDeptTarget, setEditDeptTarget] = useState<Department | null>(null);
  const [isEditDeptOpen, setIsEditDeptOpen] = useState(false);
  const [editDeptLoading, setEditDeptLoading] = useState(false);
  const [editDeptSaving, setEditDeptSaving] = useState(false);
  const [editDeptForm, setEditDeptForm] = useState<DepartmentForm>({
    name: "",
    color: "#6366F1",
  });

  const [deleteDeptTarget, setDeleteDeptTarget] = useState<Department | null>(null);
  const [deleteDeptLoading, setDeleteDeptLoading] = useState(false);

  useEffect(() => {
    void Promise.all([refreshUsers(), refreshDepartments()]);
  }, [refreshUsers, refreshDepartments]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
        (user.department || "").toLowerCase().includes(searchValue.toLowerCase())
      );
    });
  }, [users, searchValue]);

  // Role badge colors - only admin and user roles
  const roleBadgeVariants: Record<string, string> = {
    admin: "bg-primary/15 text-primary border-primary/30",
    user: "bg-muted text-muted-foreground border-border",
  };

  // Role icons
  const roleIcons: Record<string, typeof UserIcon> = {
    admin: Shield,
    user: UserIcon,
  };

  // Stats
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  const resetCreateUserForm = () => {
    setNewUserForm({
      name: "",
      departmentId: "",
      role: "user",
      email: "",
      password: "",
    });
  };

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !newUserForm.name.trim() ||
      !newUserForm.departmentId ||
      !newUserForm.email ||
      !newUserForm.password
    ) {
      toast({
        title: "Campos incompletos",
        description: "Completá nombre, departamento, email y contraseña.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingUser(true);

    try {
      await apiFetch<{ user: unknown }>("/users", {
        method: "POST",
        body: JSON.stringify({
          name: newUserForm.name.trim(),
          department_id: newUserForm.departmentId,
          role: newUserForm.role,
          email: newUserForm.email,
          password: newUserForm.password,
        }),
      });

      await refreshUsers();
      setIsCreateUserOpen(false);
      resetCreateUserForm();
      toast({
        title: "Usuario creado",
        description: "Se creó dentro de la misma company del admin actual.",
      });
    } catch (error) {
      toast({
        title: "No se pudo crear el usuario",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const closeEditUserSheet = () => {
    setIsEditUserOpen(false);
    setEditUserTarget(null);
    setEditUserForm({
      name: "",
      email: "",
      departmentId: "",
      role: "user",
      password: "",
    });
  };

  const openEditUser = async (userFromList: User) => {
    setEditUserTarget(userFromList);
    setIsEditUserOpen(true);
    setEditUserLoading(true);
    setEditUserForm({
      name: userFromList.name,
      email: userFromList.email,
      departmentId: userFromList.departmentId ?? "",
      role: userFromList.role === "admin" ? "admin" : "user",
      password: "",
    });
    try {
      const res = await apiFetch<{ user: User }>(`/users/${userFromList.id}`);
      const u = res.user;
      setEditUserForm({
        name: u.name,
        email: u.email,
        departmentId: u.departmentId ?? "",
        role: u.role === "admin" ? "admin" : "user",
        password: "",
      });
    } catch (error) {
      toast({
        title: "No se pudo cargar el usuario",
        description: error instanceof Error ? error.message : "Intentá de nuevo.",
        variant: "destructive",
      });
      closeEditUserSheet();
    } finally {
      setEditUserLoading(false);
    }
  };

  const handleEditUserSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editUserTarget) return;

    if (
      !editUserForm.name.trim() ||
      !editUserForm.email.trim() ||
      !editUserForm.departmentId
    ) {
      toast({
        title: "Campos incompletos",
        description: "Nombre, correo y departamento son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    setEditUserSaving(true);
    const payload: Record<string, string | number> = {
      name: editUserForm.name.trim(),
      email: editUserForm.email.trim(),
      role: editUserForm.role,
      department_id: Number(editUserForm.departmentId),
    };
    if (editUserForm.password.trim().length > 0) {
      payload.password = editUserForm.password;
    }

    try {
      await apiFetch(`/users/${editUserTarget.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      await refreshUsers();
      closeEditUserSheet();
      toast({
        title: "Usuario actualizado",
        description: "Los cambios se guardaron correctamente.",
      });
    } catch (error) {
      toast({
        title: "No se pudo guardar",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setEditUserSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserTarget) return;
    setDeleteUserLoading(true);
    try {
      await apiFetch(`/users/${deleteUserTarget.id}`, { method: "DELETE" });
      await refreshUsers();
      if (editUserTarget?.id === deleteUserTarget.id) {
        closeEditUserSheet();
      }
      setDeleteUserTarget(null);
      toast({
        title: "Usuario eliminado",
        description: `${deleteUserTarget.name} fue eliminado correctamente.`,
      });
    } catch (error) {
      toast({
        title: "No se pudo eliminar el usuario",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
        variant: "destructive",
      });
      setDeleteUserTarget(null);
    } finally {
      setDeleteUserLoading(false);
    }
  };

  const resetCreateDeptForm = () => {
    setCreateDeptForm({ name: "", color: "#6366F1" });
  };

  const handleCreateDepartment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!createDeptForm.name.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Ingresá un nombre para el departamento.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingDept(true);
    try {
      await apiFetch("/departments", {
        method: "POST",
        body: JSON.stringify({
          name: createDeptForm.name.trim(),
          color: createDeptForm.color,
        }),
      });
      await refreshDepartments();
      setIsCreateDeptOpen(false);
      resetCreateDeptForm();
      toast({
        title: "Departamento creado",
        description: "El departamento se agregó a tu empresa.",
      });
    } catch (error) {
      toast({
        title: "No se pudo crear el departamento",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingDept(false);
    }
  };

  const closeEditDeptSheet = () => {
    setIsEditDeptOpen(false);
    setEditDeptTarget(null);
    setEditDeptForm({ name: "", color: "#6366F1" });
  };

  const openEditDepartment = async (dept: Department) => {
    setEditDeptTarget(dept);
    setIsEditDeptOpen(true);
    setEditDeptLoading(true);
    setEditDeptForm({ name: dept.name, color: dept.color });
    try {
      const res = await apiFetch<{ department: Department }>(`/departments/${dept.id}`);
      setEditDeptForm({
        name: res.department.name,
        color: res.department.color,
      });
    } catch (error) {
      toast({
        title: "No se pudo cargar el departamento",
        description: error instanceof Error ? error.message : "Intentá de nuevo.",
        variant: "destructive",
      });
      closeEditDeptSheet();
    } finally {
      setEditDeptLoading(false);
    }
  };

  const handleEditDepartmentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editDeptTarget) return;

    if (!editDeptForm.name.trim()) {
      toast({
        title: "Nombre requerido",
        description: "El nombre del departamento no puede estar vacío.",
        variant: "destructive",
      });
      return;
    }

    setEditDeptSaving(true);
    try {
      await apiFetch(`/departments/${editDeptTarget.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editDeptForm.name.trim(),
          color: editDeptForm.color,
        }),
      });
      await refreshDepartments();
      closeEditDeptSheet();
      toast({
        title: "Departamento actualizado",
        description: "Los cambios se guardaron correctamente.",
      });
    } catch (error) {
      toast({
        title: "No se pudo guardar",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setEditDeptSaving(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!deleteDeptTarget) return;
    setDeleteDeptLoading(true);
    try {
      await apiFetch(`/departments/${deleteDeptTarget.id}`, { method: "DELETE" });
      await Promise.all([refreshDepartments(), refreshUsers()]);
      if (editDeptTarget?.id === deleteDeptTarget.id) {
        closeEditDeptSheet();
      }
      setDeleteDeptTarget(null);
      toast({
        title: "Departamento eliminado",
        description: `${deleteDeptTarget.name} fue eliminado.`,
      });
    } catch (error) {
      toast({
        title: "No se pudo eliminar el departamento",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
        variant: "destructive",
      });
      setDeleteDeptTarget(null);
    } finally {
      setDeleteDeptLoading(false);
    }
  };

  const isEditingSelf =
    !!authUser?.id && !!editUserTarget?.id && authUser.id === editUserTarget.id;

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
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Admin
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestioná usuarios, departamentos y la estructura organizacional
            </p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">
                      {totalUsers}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Usuarios</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/15">
                    <Shield className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">
                      {adminCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Administradores</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    <UserIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">
                      {userCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Usuarios</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">
                      {departments.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Departamentos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Users Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Usuarios
                </CardTitle>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <Sheet
                    open={isCreateUserOpen}
                    onOpenChange={(open) => {
                      setIsCreateUserOpen(open);
                      if (!open) resetCreateUserForm();
                    }}
                  >
                  <Button size="sm" className="gap-2" onClick={() => setIsCreateUserOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Crear Usuario
                  </Button>
                  <SheetContent side="right" className="sm:max-w-md">
                    <SheetHeader>
                      <SheetTitle>Crear nuevo usuario</SheetTitle>
                      <SheetDescription>
                        El usuario se creará en la misma company del admin autenticado.
                      </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleCreateUser} className="flex h-full flex-col">
                      <div className="grid gap-4 px-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Nombre</Label>
                          <Input
                            id="name"
                            required
                            placeholder="María García"
                            value={newUserForm.name}
                            onChange={(e) =>
                              setNewUserForm((prev) => ({ ...prev, name: e.target.value }))
                            }
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="department">Departamento</Label>
                          <Select
                            value={newUserForm.departmentId}
                            onValueChange={(value) =>
                              setNewUserForm((prev) => ({ ...prev, departmentId: value }))
                            }
                          >
                            <SelectTrigger id="department" className="w-full">
                              <SelectValue placeholder="Seleccioná un departamento" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((department) => (
                                <SelectItem key={department.id} value={department.id}>
                                  {department.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="role">Rol</Label>
                          <Select
                            value={newUserForm.role}
                            onValueChange={(value: "admin" | "user") =>
                              setNewUserForm((prev) => ({ ...prev, role: value }))
                            }
                          >
                            <SelectTrigger id="role" className="w-full">
                              <SelectValue placeholder="Seleccioná un rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            placeholder="usuario@empresa.com"
                            value={newUserForm.email}
                            onChange={(e) =>
                              setNewUserForm((prev) => ({ ...prev, email: e.target.value }))
                            }
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            required
                            minLength={6}
                            placeholder="********"
                            value={newUserForm.password}
                            onChange={(e) =>
                              setNewUserForm((prev) => ({ ...prev, password: e.target.value }))
                            }
                          />
                        </div>
                      </div>

                      <SheetFooter className="mt-6 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsCreateUserOpen(false);
                            resetCreateUserForm();
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isCreatingUser}>
                          {isCreatingUser ? "Creando..." : "Crear usuario"}
                        </Button>
                      </SheetFooter>
                    </form>
                  </SheetContent>
                </Sheet>

                <Sheet
                  open={isEditUserOpen}
                  onOpenChange={(open) => {
                    if (!open) closeEditUserSheet();
                  }}
                >
                  <SheetContent side="right" className="sm:max-w-md">
                    <SheetHeader>
                      <SheetTitle>Editar usuario</SheetTitle>
                      <SheetDescription>
                        Nombre, correo, rol, departamento y contraseña (opcional).
                      </SheetDescription>
                    </SheetHeader>
                    {editUserLoading ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
                        Cargando…
                      </div>
                    ) : (
                      <form onSubmit={handleEditUserSubmit} className="flex h-full flex-col">
                        <div className="grid gap-4 px-4">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nombre</Label>
                            <Input
                              id="edit-name"
                              value={editUserForm.name}
                              onChange={(e) =>
                                setEditUserForm((p) => ({ ...p, name: e.target.value }))
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-email">Correo</Label>
                            <Input
                              id="edit-email"
                              type="email"
                              value={editUserForm.email}
                              onChange={(e) =>
                                setEditUserForm((p) => ({ ...p, email: e.target.value }))
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-department">Departamento</Label>
                            <Select
                              value={editUserForm.departmentId}
                              onValueChange={(value) =>
                                setEditUserForm((p) => ({ ...p, departmentId: value }))
                              }
                            >
                              <SelectTrigger id="edit-department" className="w-full">
                                <SelectValue placeholder="Seleccioná un departamento" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments.map((department) => (
                                  <SelectItem key={department.id} value={department.id}>
                                    {department.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-role">Rol</Label>
                            <Select
                              value={editUserForm.role}
                              onValueChange={(value: "admin" | "user") =>
                                setEditUserForm((p) => ({ ...p, role: value }))
                              }
                            >
                              <SelectTrigger id="edit-role" className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem
                                  value="user"
                                  disabled={
                                    isEditingSelf && editUserTarget?.role === "admin"
                                  }
                                >
                                  User
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {isEditingSelf && editUserTarget?.role === "admin" ? (
                              <p className="text-xs text-muted-foreground">
                                No podés quitarte el rol de administrador vos mismo.
                              </p>
                            ) : null}
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-password">Nueva contraseña</Label>
                            <Input
                              id="edit-password"
                              type="password"
                              minLength={6}
                              autoComplete="new-password"
                              placeholder="Dejar en blanco para no cambiar"
                              value={editUserForm.password}
                              onChange={(e) =>
                                setEditUserForm((p) => ({ ...p, password: e.target.value }))
                              }
                            />
                          </div>
                        </div>
                        <SheetFooter className="mt-6 flex-col gap-3 border-t sm:flex-col">
                          {!isEditingSelf && editUserTarget ? (
                            <Button
                              type="button"
                              variant="destructive"
                              className="w-full gap-2"
                              onClick={() => setDeleteUserTarget(editUserTarget)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar usuario
                            </Button>
                          ) : null}
                          <div className="flex w-full gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => closeEditUserSheet()}
                            >
                              Cancelar
                            </Button>
                            <Button type="submit" className="flex-1" disabled={editUserSaving}>
                              {editUserSaving ? "Guardando…" : "Guardar cambios"}
                            </Button>
                          </div>
                        </SheetFooter>
                      </form>
                    )}
                  </SheetContent>
                </Sheet>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuarios..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-9 bg-background"
                  />
                </div>

                {/* User Cards Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredUsers.map((user, index) => {
                    const RoleIcon = roleIcons[user.role];
                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.25 + index * 0.03 }}
                        role="button"
                        tabIndex={0}
                        className="group flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-secondary/30 transition-all cursor-pointer"
                        onClick={() => void openEditUser(user)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            void openEditUser(user);
                          }
                        }}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-secondary text-secondary-foreground">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {user.name}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize ${roleBadgeVariants[user.role]}`}
                            >
                              <RoleIcon className="mr-1 h-3 w-3" />
                              {user.role}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {user.department}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              void openEditUser(user);
                            }}
                            aria-label="Editar usuario"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {authUser?.id !== user.id ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteUserTarget(user);
                              }}
                              aria-label="Eliminar usuario"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Departments & Org Structure */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Departamentos
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 h-8"
                    onClick={() => setIsCreateDeptOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nuevo
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {departments.map((dept, index) => (
                      <motion.div
                        key={dept.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.03 }}
                        role="button"
                        tabIndex={0}
                        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                        onClick={() => void openEditDepartment(dept)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            void openEditDepartment(dept);
                          }
                        }}
                      >
                        <div
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: dept.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {dept.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              void openEditDepartment(dept);
                            }}
                            aria-label="Editar departamento"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteDeptTarget(dept);
                            }}
                            aria-label="Eliminar departamento"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Department Assignment Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Detalles de Departamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto w-full">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead className="text-center">Miembros</TableHead>
                    <TableHead className="text-center">Objetivos</TableHead>
                    <TableHead className="text-center">Progreso Prom.</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: dept.color }}
                          />
                          <span className="font-medium">{dept.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {dept.head ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {dept.head.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{dept.head.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {users.filter((user) => user.departmentId === dept.id).length}
                      </TableCell>
                      <TableCell className="text-center">
                        —
                      </TableCell>
                      <TableCell className="text-center">
                        —
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => void openEditDepartment(dept)}
                            aria-label="Editar departamento"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteDeptTarget(dept)}
                            aria-label="Eliminar departamento"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Crear departamento */}
        <Sheet
          open={isCreateDeptOpen}
          onOpenChange={(open) => {
            setIsCreateDeptOpen(open);
            if (!open) resetCreateDeptForm();
          }}
        >
          <SheetContent side="right" className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Crear departamento</SheetTitle>
              <SheetDescription>
                El departamento se asociará a tu empresa.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleCreateDepartment} className="flex h-full flex-col">
              <div className="grid gap-4 px-4">
                <div className="grid gap-2">
                  <Label htmlFor="dept-name">Nombre</Label>
                  <Input
                    id="dept-name"
                    required
                    placeholder="Ej. Comercial"
                    value={createDeptForm.name}
                    onChange={(e) =>
                      setCreateDeptForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dept-color">Color</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="dept-color"
                      type="color"
                      className="h-10 w-14 cursor-pointer p-1"
                      value={createDeptForm.color}
                      onChange={(e) =>
                        setCreateDeptForm((p) => ({ ...p, color: e.target.value }))
                      }
                    />
                    <span className="text-sm text-muted-foreground font-mono">
                      {createDeptForm.color}
                    </span>
                  </div>
                </div>
              </div>
              <SheetFooter className="mt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDeptOpen(false);
                    resetCreateDeptForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreatingDept}>
                  {isCreatingDept ? "Creando…" : "Crear departamento"}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        {/* Editar departamento */}
        <Sheet
          open={isEditDeptOpen}
          onOpenChange={(open) => {
            if (!open) closeEditDeptSheet();
          }}
        >
          <SheetContent side="right" className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Editar departamento</SheetTitle>
              <SheetDescription>Nombre y color del departamento.</SheetDescription>
            </SheetHeader>
            {editDeptLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
                Cargando…
              </div>
            ) : (
              <form onSubmit={handleEditDepartmentSubmit} className="flex h-full flex-col">
                <div className="grid gap-4 px-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-dept-name">Nombre</Label>
                    <Input
                      id="edit-dept-name"
                      required
                      value={editDeptForm.name}
                      onChange={(e) =>
                        setEditDeptForm((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-dept-color">Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="edit-dept-color"
                        type="color"
                        className="h-10 w-14 cursor-pointer p-1"
                        value={editDeptForm.color}
                        onChange={(e) =>
                          setEditDeptForm((p) => ({ ...p, color: e.target.value }))
                        }
                      />
                      <span className="text-sm text-muted-foreground font-mono">
                        {editDeptForm.color}
                      </span>
                    </div>
                  </div>
                </div>
                <SheetFooter className="mt-6 flex-col gap-3 border-t sm:flex-col">
                  {editDeptTarget ? (
                    <Button
                      type="button"
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={() => setDeleteDeptTarget(editDeptTarget)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar departamento
                    </Button>
                  ) : null}
                  <div className="flex w-full gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => closeEditDeptSheet()}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={editDeptSaving}>
                      {editDeptSaving ? "Guardando…" : "Guardar cambios"}
                    </Button>
                  </div>
                </SheetFooter>
              </form>
            )}
          </SheetContent>
        </Sheet>

        {/* Confirmar eliminación de usuario */}
        <AlertDialog
          open={!!deleteUserTarget}
          onOpenChange={(open) => !open && setDeleteUserTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-semibold text-foreground">
                  {deleteUserTarget?.name}
                </span>{" "}
                dejará de aparecer en el listado y no podrá asignarse a nuevos
                objetivos, departamentos ni REMIs. Sus asignaciones actuales se
                conservarán con su nombre.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteUserLoading}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  void handleDeleteUser();
                }}
                disabled={deleteUserLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteUserLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando…
                  </>
                ) : (
                  "Sí, eliminar"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirmar eliminación de departamento */}
        <AlertDialog
          open={!!deleteDeptTarget}
          onOpenChange={(open) => !open && setDeleteDeptTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar departamento?</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminará permanentemente el departamento{" "}
                <span className="font-semibold text-foreground">
                  {deleteDeptTarget?.name}
                </span>
                . Los usuarios, objetivos y REMIs vinculados quedarán sin
                departamento asignado, pero se conservarán. Esta acción no se puede
                deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteDeptLoading}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  void handleDeleteDepartment();
                }}
                disabled={deleteDeptLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteDeptLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando…
                  </>
                ) : (
                  "Sí, eliminar"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}

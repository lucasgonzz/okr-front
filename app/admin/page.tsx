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
import type { Quarter, User } from "@/lib/types";
import {
  Users,
  Building2,
  Shield,
  User as UserIcon,
  Plus,
  Search,
  Pencil,
  MoreHorizontal,
} from "lucide-react";

type EditUserForm = {
  name: string;
  email: string;
  departmentId: string;
  role: "admin" | "user";
  password: string;
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
      departmentId: "",
      role: "user",
      email: "",
      password: "",
    });
  };

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newUserForm.departmentId || !newUserForm.email || !newUserForm.password) {
      toast({
        title: "Campos incompletos",
        description: "Completá departamento, email y password.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingUser(true);
    const inferredName = newUserForm.email.split("@")[0] || "Nuevo usuario";

    try {
      await apiFetch<{ user: unknown }>("/users", {
        method: "POST",
        body: JSON.stringify({
          department_id: newUserForm.departmentId,
          role: newUserForm.role,
          email: newUserForm.email,
          password: newUserForm.password,
          name: inferredName,
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
                        <SheetFooter className="mt-6 border-t">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => closeEditUserSheet()}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" disabled={editUserSaving}>
                            {editUserSaving ? "Guardando…" : "Guardar cambios"}
                          </Button>
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            void openEditUser(user);
                          }}
                          aria-label="Editar usuario"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
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
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Departamentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {departments.map((dept, index) => (
                      <motion.div
                        key={dept.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.03 }}
                        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
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
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}

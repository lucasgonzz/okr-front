"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiFetch } from "@/lib/api";
import { useData } from "@/lib/data-context";
import type { Quarter } from "@/lib/types";
import {
  Search,
  Clock,
  Target,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface LogEntry {
  id: string;
  type: "creation" | "update" | "deletion";
  title: string;
  resourceType: string;
  objectiveId?: string;
  user: {
    name: string;
    avatar?: string;
  };
  changes: RawLogChange[];
  timestamp: Date;
}

interface RawLogChange {
  field: string;
  property?: string;
  old: unknown;
  new: unknown;
}

interface RawLogItem {
  id: string;
  title?: string;
  operation?: "create" | "update" | "delete";
  resourceType?: string;
  objectiveId?: string | null;
  keyResultId?: string | null;
  userId: string | null;
  user: { name: string; avatar?: string | null } | null;
  changes: RawLogChange[] | null;
  createdAt: string;
}

function mapOperationToType(operation?: string): LogEntry["type"] {
  if (operation === "create") return "creation";
  if (operation === "delete") return "deletion";
  return "update";
}

const logIcons: Record<LogEntry["type"], typeof Clock> = {
  creation: CheckCircle2,
  update: TrendingUp,
  deletion: AlertTriangle,
};

const logColors: Record<LogEntry["type"], string> = {
  creation: "bg-success/15 text-success",
  update: "bg-info/15 text-info",
  deletion: "bg-destructive/15 text-destructive",
};

export default function LogsPage() {
  const {
    objectives,
    quarters,
    selected_quarter,
    set_selected_quarter,
    refreshObjectives,
    refreshQuarters,
  } = useData();
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(selected_quarter as Quarter);
  const [searchValue, setSearchValue] = useState("");
  const [typeFilter, setTypeFilter] = useState<LogEntry["type"] | "all">("all");
  const [objectiveFilter, setObjectiveFilter] = useState("all");
  const [log_entries, set_log_entries] = useState<LogEntry[]>([]);

  useEffect(() => {
    void Promise.all([refreshObjectives(), refreshQuarters()]);
  }, [refreshObjectives, refreshQuarters]);

  useEffect(() => {
    const load_logs = async () => {
      const query_params = new URLSearchParams();
      if (selectedQuarter) {
        query_params.set("quarter", selectedQuarter);
      }
      if (objectiveFilter !== "all") {
        query_params.set("objective_id", objectiveFilter);
      }

      try {
        const response = await apiFetch<{ data: RawLogItem[] }>(
          `/key-result-logs?${query_params.toString()}`
        );

        const mapped_logs: LogEntry[] = [];
        (response.data || []).forEach((log) => {
          const changes = Array.isArray(log.changes) ? log.changes : [];
          mapped_logs.push({
            id: log.id,
            type: mapOperationToType(log.operation),
            title: log.title || "Actualizacion",
            resourceType: log.resourceType || "resource",
            objectiveId: log.objectiveId || undefined,
            user: {
              name: log.user?.name || "Sistema",
              avatar: log.user?.avatar || undefined,
            },
            changes,
            timestamp: new Date(log.createdAt),
          });
        });

        set_log_entries(
          mapped_logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        );
      } catch {
        set_log_entries([]);
      }
    };

    load_logs();
  }, [selectedQuarter, objectiveFilter, objectives]);

  const allLogs = log_entries;

  // Filter logs
  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      // Search filter
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        const changesText = log.changes
          .map((change) => `${change.property || change.field} ${String(change.old ?? "")} ${String(change.new ?? "")}`)
          .join(" ")
          .toLowerCase();
        if (
          !log.title.toLowerCase().includes(searchLower) &&
          !log.user.name.toLowerCase().includes(searchLower) &&
          !changesText.includes(searchLower)
        ) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== "all" && log.type !== typeFilter) {
        return false;
      }

      // Objective filter
      if (objectiveFilter !== "all" && log.objectiveId !== objectiveFilter) {
        return false;
      }

      return true;
    });
  }, [allLogs, searchValue, typeFilter]);

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups: Record<string, LogEntry[]> = {};
    
    filteredLogs.forEach((log) => {
      const dateKey = format(log.timestamp, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });

    return Object.entries(groups).map(([date, logs]) => ({
      date,
      dateLabel: format(new Date(date), "EEEE, d MMMM yyyy", { locale: es }),
      logs,
    }));
  }, [filteredLogs]);

  // Current quarter objectives for filter
  const quarterObjectives = objectives.filter((o) => o.quarter === selectedQuarter);

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
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Logs e Historial
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Registro de cambios y actualizaciones del sistema
            </p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-6 grid grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {allLogs.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Logs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {allLogs.filter((l) => l.type === "update").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Actualizaciones</p>
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
                    {allLogs.filter((l) => l.type === "creation").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Creaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/15">
                  <FileText className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {allLogs.filter((l) => l.type === "deletion").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Eliminaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4"
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar en logs..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 bg-background border-border"
            />
          </div>

          <Select
            value={selectedQuarter}
            onValueChange={(value) => {
              setSelectedQuarter(value as Quarter);
              set_selected_quarter(value as Quarter);
            }}
          >
            <SelectTrigger className="w-[120px] bg-background border-border">
              <SelectValue placeholder="Trimestre" />
            </SelectTrigger>
            <SelectContent>
              {quarters.map((q) => (
                <SelectItem key={q.id} value={q.name}>
                  {q.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as LogEntry["type"] | "all")}
          >
            <SelectTrigger className="w-[150px] bg-background border-border">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="creation">Creacion</SelectItem>
                <SelectItem value="update">Actualizacion</SelectItem>
                <SelectItem value="deletion">Eliminacion</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={objectiveFilter}
            onValueChange={setObjectiveFilter}
          >
            <SelectTrigger className="w-[200px] bg-background border-border">
              <SelectValue placeholder="Objetivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los objetivos</SelectItem>
              {quarterObjectives.map((obj) => (
                <SelectItem key={obj.id} value={obj.id}>
                  {obj.title.length > 30 ? obj.title.substring(0, 30) + "..." : obj.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Log Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Historial de Actividad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {filteredLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <FileText className="h-12 w-12 mb-4 opacity-30" />
                    <p className="text-sm">No se encontraron logs con los filtros aplicados</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {groupedLogs.map((group, groupIndex) => (
                      <div key={group.date}>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 sticky top-0 bg-card py-2">
                          {group.dateLabel}
                        </h3>
                        <div className="space-y-4">
                          {group.logs.map((log, index) => {
                            const Icon = logIcons[log.type];
                            return (
                              <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: (groupIndex * 0.1) + (index * 0.02) }}
                                className="flex gap-4"
                              >
                                <div className="relative flex flex-col items-center">
                                  <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${logColors[log.type]}`}
                                  >
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  {index < group.logs.length - 1 && (
                                    <div className="mt-2 h-full w-px bg-border flex-1" />
                                  )}
                                </div>
                                <div className="flex-1 pb-4">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={log.user.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {log.user.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-foreground">
                                      {log.user.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {format(log.timestamp, "HH:mm")}
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground mb-2">{log.title}</p>
                                  {log.objectiveId && (
                                    <Link
                                      href={`/objectives/${log.objectiveId}`}
                                      className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                                    >
                                      <Target className="h-3 w-3" />
                                      Ver objetivo relacionado
                                    </Link>
                                  )}
                                  <div className="mt-2 space-y-1 text-xs">
                                    {log.changes.map((change, idx) => (
                                      <div key={`${log.id}-${idx}`} className="text-muted-foreground">
                                        <span className="font-medium text-foreground">
                                          {change.property || change.field}:
                                        </span>{" "}
                                        {change.old ?? "Sin valor"} → {change.new ?? "Sin valor"}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}

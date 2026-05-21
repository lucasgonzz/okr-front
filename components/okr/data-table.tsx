"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "./status-badge";
import { ProgressBar } from "./progress-bar";
import type { Objective } from "@/lib/types";
import { format } from "date-fns";

interface DataTableProps {
  objectives: Objective[];
  className?: string;
  onRowClick?: (objective: Objective) => void;
}

export function DataTable({ objectives, className, onRowClick }: DataTableProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden",
        className
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="text-muted-foreground font-medium">Objective</TableHead>
            <TableHead className="text-muted-foreground font-medium">Owner</TableHead>
            <TableHead className="text-muted-foreground font-medium">Department</TableHead>
            <TableHead className="text-muted-foreground font-medium">Status</TableHead>
            <TableHead className="text-muted-foreground font-medium">Progress</TableHead>
            <TableHead className="text-muted-foreground font-medium">Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {objectives.map((objective, index) => (
            <motion.tr
              key={objective.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              onClick={() => onRowClick?.(objective)}
              className="group cursor-pointer border-border hover:bg-secondary/50 transition-colors"
            >
              <TableCell className="font-medium text-foreground">
                <div className="max-w-[300px]">
                  <p className="truncate group-hover:text-primary transition-colors">
                    {objective.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {objective.keyResults.length} Key Results
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                      {objective.owner.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {objective.owner.name.split(" ")[0]}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: objective.department.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {objective.department.name}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={objective.status} size="sm" />
              </TableCell>
              <TableCell>
                <div className="w-[120px]">
                  <ProgressBar value={objective.progress} size="sm" showLabel animated={false} />
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(objective.dueDate), "MMM d, yyyy")}
                </span>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

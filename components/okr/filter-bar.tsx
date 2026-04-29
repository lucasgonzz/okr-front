"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useData } from "@/lib/data-context";
import type { ObjectiveStatus } from "@/lib/types";

interface FilterBarProps {
  className?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  statusFilter?: ObjectiveStatus | "all";
  onStatusChange?: (value: ObjectiveStatus | "all") => void;
  departmentFilter?: string;
  onDepartmentChange?: (value: string) => void;
  onClearFilters?: () => void;
}

export function FilterBar({
  className,
  searchValue = "",
  onSearchChange,
  statusFilter = "all",
  onStatusChange,
  departmentFilter = "all",
  onDepartmentChange,
  onClearFilters,
}: FilterBarProps) {
  const { departments } = useData();
  const hasActiveFilters =
    searchValue || statusFilter !== "all" || departmentFilter !== "all";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4",
        className
      )}
    >
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search objectives..."
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-9 bg-background border-border"
        />
      </div>

      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusChange?.(value as ObjectiveStatus | "all")}
        >
          <SelectTrigger className="w-[140px] bg-background border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="on-track">On Track</SelectItem>
            <SelectItem value="at-risk">At Risk</SelectItem>
            <SelectItem value="behind">Behind</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={departmentFilter}
          onValueChange={(value) => onDepartmentChange?.(value)}
        >
          <SelectTrigger className="w-[180px] bg-background border-border">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

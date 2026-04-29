"use client";

import { cn } from "@/lib/utils";
import type { ObjectiveStatus, KeyResultStatus } from "@/lib/types";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface StatusBadgeProps {
  status: ObjectiveStatus | KeyResultStatus;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

const statusConfig: Record<ObjectiveStatus, { label: string; className: string; icon?: typeof AlertTriangle } | null> = {
  "en-riesgo": {
    label: "En Riesgo",
    className: "bg-warning/10 text-warning border-warning/20",
    icon: AlertTriangle,
  },
  "completado": {
    label: "Completado",
    className: "bg-success/10 text-success border-success/20",
    icon: CheckCircle2,
  },
  "": null, // No badge for empty status
};

const sizeClasses = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-0.5 text-xs",
  lg: "px-2.5 py-1 text-xs",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

export function StatusBadge({ status, size = "md", showDot = false }: StatusBadgeProps) {
  const config = statusConfig[status];

  // Return null for empty status (no badge)
  if (!config) {
    return null;
  }

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        config.className,
        sizeClasses[size]
      )}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      {showDot && !Icon && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {config.label}
    </span>
  );
}

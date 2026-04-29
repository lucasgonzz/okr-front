"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label?: string;
  };
  icon?: LucideIcon;
  className?: string;
  delay?: number;
}

export function KpiCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  className,
  delay = 0,
}: KpiCardProps) {
  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
      ? TrendingDown
      : Minus
    : null;

  const trendColor = trend
    ? trend.value > 0
      ? "text-success"
      : trend.value < 0
      ? "text-destructive"
      : "text-muted-foreground"
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-card p-5",
        "hover:border-primary/20 transition-colors duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
            {title}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        {Icon && (
          <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      
      {(description || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && TrendIcon && (
            <span className={cn("flex items-center gap-1 font-medium", trendColor)}>
              <TrendIcon className="h-3.5 w-3.5" />
              {Math.abs(trend.value)}%
            </span>
          )}
          {description && (
            <span className="text-muted-foreground truncate">{description}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}

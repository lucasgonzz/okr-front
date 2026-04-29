"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
  animated?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2",
};

const getVariant = (value: number, variant?: ProgressBarProps["variant"]) => {
  if (variant) return variant;
  if (value >= 70) return "success";
  if (value >= 40) return "warning";
  return "danger";
};

const variantClasses = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
};

export function ProgressBar({
  value,
  max = 100,
  size = "md",
  showLabel = false,
  variant,
  animated = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const computedVariant = getVariant(percentage, variant);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex-1 overflow-hidden rounded-full bg-secondary",
          sizeClasses[size]
        )}
      >
        {animated ? (
          <motion.div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full",
              variantClasses[computedVariant]
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ) : (
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full",
              variantClasses[computedVariant]
            )}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
      {showLabel && (
        <span className="min-w-[3rem] text-right text-sm font-medium text-foreground">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

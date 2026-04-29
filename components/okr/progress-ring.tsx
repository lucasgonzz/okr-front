"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
  strokeWidth?: number;
}

const sizeConfig = {
  sm: { width: 48, fontSize: "text-xs" },
  md: { width: 72, fontSize: "text-sm" },
  lg: { width: 96, fontSize: "text-lg" },
};

export function ProgressRing({
  value,
  size = "md",
  className,
  showLabel = true,
  strokeWidth = 6,
}: ProgressRingProps) {
  const { width, fontSize } = sizeConfig[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  // Color based on progress
  const getColor = () => {
    if (value >= 80) return "stroke-success";
    if (value >= 60) return "stroke-primary";
    if (value >= 40) return "stroke-warning";
    return "stroke-destructive";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={width}
        height={width}
        className="transform -rotate-90"
        viewBox={`0 0 ${width} ${width}`}
      >
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-secondary"
        />
        {/* Progress circle */}
        <motion.circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={getColor()}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {showLabel && (
        <span className={cn("absolute font-semibold text-foreground", fontSize)}>
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}

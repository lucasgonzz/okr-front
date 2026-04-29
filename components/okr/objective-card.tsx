"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "./status-badge";
import { ProgressBar } from "./progress-bar";
import type { Objective } from "@/lib/types";
import { Calendar, Target, MessageSquare, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface ObjectiveCardProps {
  objective: Objective;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

export function ObjectiveCard({
  objective,
  className,
  delay = 0,
  onClick,
}: ObjectiveCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 cursor-pointer",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: objective.department.color }}
            />
            <span className="text-xs font-medium text-muted-foreground truncate">
              {objective.department.name}
            </span>
          </div>
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {objective.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {objective.description}
          </p>
        </div>
        <StatusBadge status={objective.status} size="sm" />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Progress</span>
          <span className="font-medium text-foreground">{objective.progress}%</span>
        </div>
        <ProgressBar value={objective.progress} size="sm" animated={false} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={objective.owner.avatar} />
            <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
              {objective.owner.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            {objective.owner.name}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Target className="h-3.5 w-3.5" />
            {objective.keyResults.length}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {objective.comments.length}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(objective.dueDate), "MMM d")}
          </span>
        </div>
      </div>

      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
    </motion.div>
  );
}

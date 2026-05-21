"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Activity } from "@/lib/types";
import {
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Plus,
} from "lucide-react";

interface ActivityFeedProps {
  activities: Activity[];
  className?: string;
  maxHeight?: string;
}

const activityIcons: Record<Activity["type"], typeof MessageSquare> = {
  "objective-created": Plus,
  "key-result-updated": TrendingUp,
  "comment-added": MessageSquare,
  "status-changed": AlertCircle,
  "progress-updated": CheckCircle2,
};

const activityColors: Record<Activity["type"], string> = {
  "objective-created": "bg-primary/15 text-primary",
  "key-result-updated": "bg-info/15 text-info",
  "comment-added": "bg-muted text-muted-foreground",
  "status-changed": "bg-warning/15 text-warning",
  "progress-updated": "bg-success/15 text-success",
};

export function ActivityFeed({
  activities,
  className,
  maxHeight = "400px",
}: ActivityFeedProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
      </div>
      <ScrollArea style={{ maxHeight }} className="p-4">
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex gap-3"
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      activityColors[activity.type]
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {index < activities.length - 1 && (
                    <div className="mt-2 h-full w-px bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">
                        {activity.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">
                      {activity.user.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

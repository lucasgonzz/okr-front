"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Quarter } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { Search, Bell, Calendar, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AppTopbarProps {
  className?: string;
  selectedQuarter?: Quarter;
  onQuarterChange?: (quarter: Quarter) => void;
}

export function AppTopbar({
  className,
  selectedQuarter = "Q4-2024",
  onQuarterChange,
}: AppTopbarProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user } = useAuth();
  const { quarters } = useData();
  const notifications: Array<{ id: string; type: "info" | "warning" | "success" | "error"; title: string; description: string; createdAt: string; read: boolean }> = [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      {/* Left section - Quarter selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedQuarter}
            onValueChange={(value) => onQuarterChange?.(value as Quarter)}
          >
            <SelectTrigger className="w-[130px] border-0 bg-secondary/50 font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {quarters.map((q) => (
                <SelectItem key={q.id} value={q.name}>
                  {q.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Center section - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search objectives, departments, or team members..."
            className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Right section - Notifications & User */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h4 className="text-sm font-semibold text-foreground">
                Notifications
              </h4>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                Mark all read
              </Button>
            </div>
            <ScrollArea className="max-h-[300px]">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-3 border-b border-border px-4 py-3 hover:bg-secondary/50 cursor-pointer transition-colors",
                    !notification.read && "bg-primary/5"
                  )}
                >
                  <div
                    className={cn(
                      "mt-1 h-2 w-2 flex-shrink-0 rounded-full",
                      notification.type === "info" && "bg-info",
                      notification.type === "warning" && "bg-warning",
                      notification.type === "success" && "bg-success",
                      notification.type === "error" && "bg-destructive"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground flex-shrink-0"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </ScrollArea>
            <div className="border-t border-border p-2">
              <Button variant="ghost" className="w-full text-sm">
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={user?.avatar || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

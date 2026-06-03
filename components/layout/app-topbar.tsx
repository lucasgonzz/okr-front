"use client";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Quarter } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { Calendar, Menu } from "lucide-react";

interface AppTopbarProps {
  className?: string;
  selectedQuarter?: Quarter;
  onQuarterChange?: (quarter: Quarter) => void;
  onMenuClick?: () => void;
}

export function AppTopbar({
  className,
  selectedQuarter = "",
  onQuarterChange,
  onMenuClick,
}: AppTopbarProps) {
  const { user } = useAuth();
  const { quarters, quarters_loading } = useData();

  const quarter_names = quarters.map((q) => q.name);
  const effective_quarter =
    selectedQuarter && quarter_names.includes(selectedQuarter)
      ? selectedQuarter
      : quarter_names[0] ?? "";

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Quarter selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select
            value={effective_quarter || undefined}
            onValueChange={(value) => onQuarterChange?.(value as Quarter)}
            disabled={quarters_loading || quarters.length === 0}
          >
            <SelectTrigger className="w-auto min-w-[110px] border-0 bg-secondary/50 font-medium">
              <SelectValue
                placeholder={quarters_loading ? "Cargando..." : "Sin trimestres"}
              />
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

      {/* Right section - User */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

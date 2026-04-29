"use client";

import { cn } from "@/lib/utils";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { Quarter } from "@/lib/types";

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  selectedQuarter?: Quarter;
  onQuarterChange?: (quarter: Quarter) => void;
}

export function AppShell({
  children,
  className,
  selectedQuarter,
  onQuarterChange,
}: AppShellProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <div className="pl-64">
          <AppTopbar
            selectedQuarter={selectedQuarter}
            onQuarterChange={onQuarterChange}
          />
          <main className={cn("min-h-[calc(100vh-4rem)] p-6", className)}>
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

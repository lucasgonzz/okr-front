"use client";

import { useState } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-64">
          <AppTopbar
            selectedQuarter={selectedQuarter}
            onQuarterChange={onQuarterChange}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <main className={cn("min-h-[calc(100vh-4rem)] p-6", className)}>
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

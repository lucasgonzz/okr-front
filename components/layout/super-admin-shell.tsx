"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { SuperAdminSidebar } from "./super-admin-sidebar";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuperAdminShellProps {
  children: React.ReactNode;
  className?: string;
}

export function SuperAdminShell({ children, className }: SuperAdminShellProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "super_admin") {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "super_admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SuperAdminSidebar />
      <div className="pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-border bg-background/95 backdrop-blur px-6">
          <h1 className="text-sm font-medium text-muted-foreground">
            Panel de Administración de Plataforma
          </h1>
        </header>
        <main className={cn("min-h-[calc(100vh-4rem)] p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}

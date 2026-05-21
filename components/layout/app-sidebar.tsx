"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  Building2,
  Target,
  ClipboardList,
  Settings,
  LogOut,
  Flag,
} from "lucide-react";

/** Enlaces comunes a todas las cuentas con acceso al área OKR (no incluye Admin). */
const base_navigation = [
  { name: "REMIs", href: "/remis", icon: Flag },
  { name: "Departamentos", href: "/departments", icon: Building2 },
  { name: "Objetivos", href: "/objectives", icon: Target },
  { name: "Logs", href: "/updates", icon: ClipboardList },
];

/** Navegación a panel de administración; se muestra a admin y super_admin. */
const admin_nav_item = {
  name: "Admin",
  href: "/admin",
  icon: Settings,
};

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  /** Incluye Admin si el rol es admin de empresa o super_admin de plataforma. */
  const visible_navigation = useMemo(() => {
    if (user?.role === "admin" || user?.role === "super_admin") {
      return [...base_navigation, admin_nav_item];
    }
    return base_navigation;
  }, [user?.role]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <svg width="34" height="34" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="26" cy="26" r="18" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
          <polygon points="26,10 22,26 26,24 30,26" fill="#1DB87A"/>
          <polygon points="26,42 22,26 26,28 30,26" fill="rgba(0,0,0,0.15)"/>
          <circle cx="26" cy="26" r="2.5" fill="transparent" stroke="#1DB87A" strokeWidth="1.5"/>
        </svg>
        <span className="font-semibold text-sidebar-foreground" style={{ fontSize: "19px" }}>
          Panel OKRs
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {visible_navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60"
                  )}
                />
                {item.name}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user?.email || "user@platform.com"}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}

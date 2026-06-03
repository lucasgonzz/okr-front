"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { apiFetch, setToken, removeToken } from "./api";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "user";
  companyId: string | null;
  departmentId: string | null;
  company?:{ id: string; name: string; slug: string; active: boolean } | null;
}

interface LoginResult {
  success: boolean;
  role?: string;
  error?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "okr_auth_session";
const TOKEN_KEY = "okr_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id) {
          setUser(parsed);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      const data = await apiFetch<{
        token: string;
        user: AuthUser;
        company: AuthUser["company"];
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const authUser: AuthUser = {
        ...data.user,
        company: data.company ?? null,
      };

      setToken(data.token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
      setUser(authUser);

      return { success: true, role: authUser.role };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al iniciar sesión",
      };
    }
  };

  const logout = () => {
    // Fire-and-forget to the API; ignore failures (e.g. expired token)
    apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    removeToken();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

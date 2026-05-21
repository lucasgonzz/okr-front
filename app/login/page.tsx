"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in (must not run during render — updates Router)
  useEffect(() => {
    if (authLoading || !user) return;
    if (user.role === "super_admin") {
      router.replace("/super-admin/companies");
    } else {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      if (result.role === "super_admin") {
        router.replace("/super-admin/companies");
      } else {
        router.replace("/");
      }
    } else {
      setError(result.error || "Error al iniciar sesión");
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ─── Panel izquierdo: Branding ─── */}
      <div
        className="hidden lg:flex lg:w-[46%] relative flex-col justify-between p-14 overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, oklch(0.19 0.07 175) 0%, oklch(0.11 0.04 175) 100%)",
        }}
      >
        {/* Decoración: círculos difusos */}
        <div
          className="absolute -top-28 -right-28 w-[420px] h-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.15 175 / 0.18) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-36 -left-20 w-[380px] h-[380px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.15 175 / 0.14) 0%, transparent 70%)",
          }}
        />
        {/* Decoración: grilla de puntos */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="18" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
            <polygon points="26,10 22,26 26,24 30,26" fill="#1DB87A"/>
            <polygon points="26,42 22,26 26,28 30,26" fill="rgba(255,255,255,0.2)"/>
            <circle cx="26" cy="26" r="2.5" fill="transparent" stroke="#1DB87A" strokeWidth="1.5"/>
          </svg>
          <span className="text-white font-semibold text-lg tracking-tight">
            Panel OKRs
          </span>
        </div>

        {/* Copy principal */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-[2.6rem] font-bold text-white leading-[1.15] tracking-tight">
              Alcanzá tus{" "}
              <span style={{ color: "oklch(0.72 0.16 175)" }}>objetivos</span>
              <br />
              con claridad
            </h2>
            <p className="mt-4 text-white/55 text-[0.95rem] leading-relaxed max-w-[280px]">
              Alineá equipos, medí resultados y ejecutá estrategias con la
              metodología OKR.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3.5">
            {[
              "Objetivos y resultados clave en tiempo real",
              "Visibilidad completa por departamento",
              "REMIs y alineación estratégica",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div
                  className="h-[7px] w-[7px] rounded-full flex-shrink-0"
                  style={{ background: "oklch(0.60 0.15 175)" }}
                />
                <span className="text-white/65 text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie */}
        <div className="relative z-10">
          <p className="text-white/25 text-xs tracking-wide">
            Autenticación segura · Datos encriptados
          </p>
        </div>
      </div>

      {/* ─── Panel derecho: Formulario ─── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-[360px]"
        >
          {/* Logo mobile (solo < lg) */}
          <div className="flex flex-col items-center mb-10 lg:hidden">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3">
              <circle cx="26" cy="26" r="18" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
              <polygon points="26,10 22,26 26,24 30,26" fill="#1DB87A"/>
              <polygon points="26,42 22,26 26,28 30,26" fill="rgba(255,255,255,0.2)"/>
              <circle cx="26" cy="26" r="2.5" fill="transparent" stroke="#1DB87A" strokeWidth="1.5"/>
            </svg>
            <h1 className="text-xl font-semibold text-foreground">
              Panel OKRs
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestión de Objetivos y Resultados Clave
            </p>
          </div>

          {/* Encabezado */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Bienvenido
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Iniciá sesión para acceder a tu panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-background border-border"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresá tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 bg-background border-border"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

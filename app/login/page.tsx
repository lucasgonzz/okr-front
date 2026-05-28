"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, AlertCircle, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">

      {/* ─── Header mobile: Branding (solo < lg) ─── */}
      <div
        className="relative flex flex-col items-center justify-center py-12 px-8 overflow-hidden lg:hidden"
        style={{ backgroundColor: "#F4F1EC" }}
      >
        {/* Círculos decorativos mobile */}
        <div
          className="absolute -top-10 -right-10 w-[52vw] h-[52vw] rounded-full pointer-events-none"
          style={{ border: "2.25rem solid rgba(15,110,86,0.07)" }}
        />
        <div
          className="absolute -bottom-10 -left-8 w-[46vw] h-[46vw] rounded-full pointer-events-none"
          style={{ border: "2rem solid rgba(15,110,86,0.05)" }}
        />

        {/* Logo en círculo blanco */}
        <div
          className="relative z-10 mb-4 flex items-center justify-center rounded-full bg-white p-3"
          style={{ border: "1px solid #E5E2DC", width: "5rem", height: "5rem" }}
        >
          <svg width="100%" height="100%" viewBox="18 6 16 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="26,10 22,26 26,24 30,26" fill="#0F6E56"/>
            <polygon points="26,42 22,26 26,28 30,26" fill="rgba(26,46,40,0.18)"/>
            <circle cx="26" cy="26" r="2.5" fill="transparent" stroke="#0F6E56" strokeWidth="1.5"/>
          </svg>
        </div>
        <h1 className="relative z-10 text-xl font-semibold" style={{ color: "#1A2E28" }}>
          Panel OKRs
        </h1>
        <p className="relative z-10 text-sm mt-1 text-center" style={{ color: "#5C7068" }}>
          Gestión de Objetivos y Resultados Clave
        </p>
      </div>

      {/* ─── Panel izquierdo: Branding (desktop) ─── */}
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-8 xl:p-14 overflow-hidden"
        style={{ backgroundColor: "#F4F1EC" }}
      >
        {/* Círculo decorativo superior derecho */}
        <div
          className="absolute -top-10 -right-10 w-[22vw] h-[22vw] rounded-full pointer-events-none"
          style={{ border: "2.375rem solid rgba(15,110,86,0.07)" }}
        />
        {/* Círculo decorativo inferior izquierdo */}
        <div
          className="absolute -bottom-12 -left-10 w-[20vw] h-[20vw] rounded-full pointer-events-none"
          style={{ border: "2.125rem solid rgba(15,110,86,0.05)" }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="18" fill="none" stroke="rgba(15,110,86,0.15)" strokeWidth="1"/>
            <polygon points="26,10 22,26 26,24 30,26" fill="#0F6E56"/>
            <polygon points="26,42 22,26 26,28 30,26" fill="rgba(26,46,40,0.18)"/>
            <circle cx="26" cy="26" r="2.5" fill="transparent" stroke="#0F6E56" strokeWidth="1.5"/>
          </svg>
          <span className="font-semibold text-lg tracking-tight" style={{ color: "#1A2E28" }}>
            Panel OKRs
          </span>
        </div>

        {/* Copy principal */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2
              className="text-3xl lg:text-[2.6rem] font-bold leading-[1.15] tracking-tight"
              style={{ color: "#1A2E28" }}
            >
              Alcanzá tus{" "}
              <span style={{ color: "#0F6E56" }}>objetivos</span>
              <br />
              con claridad
            </h2>
            <p
              className="mt-4 text-[0.95rem] leading-relaxed max-w-xs"
              style={{ color: "#3D5048" }}
            >
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
                  className="h-[0.4375rem] w-[0.4375rem] rounded-full flex-shrink-0"
                  style={{ background: "#0F6E56" }}
                />
                <span className="text-sm" style={{ color: "#5C7068" }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie */}
        <div className="relative z-10">
          <p className="text-xs tracking-wide" style={{ color: "#8FA89E" }}>
            Autenticación segura · Datos encriptados
          </p>
        </div>
      </div>

      {/* ─── Panel derecho: Formulario ─── */}
      <div
        className="flex-1 flex items-center justify-center p-8 bg-white lg:border-l"
        style={{ borderColor: "#E5E2DC" }}
      >
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-[22.5rem]"
        >
          {/* Encabezado */}
          <div className="mb-8">
            <h2
              className="text-2xl font-bold tracking-tight"
              style={{ color: "#1A2E28" }}
            >
              Bienvenido
            </h2>
            <p className="text-sm mt-1.5" style={{ color: "#7A9188" }}>
              Iniciá sesión para acceder a tu panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[0.6875rem] font-medium uppercase tracking-[0.04em] lg:normal-case lg:text-sm lg:tracking-normal"
                style={{ color: "#3D5048" }}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "#8FA89E" }}
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 placeholder:text-[#9BB0A8]"
                  style={{ backgroundColor: "#FAFAF8", border: "0.5px solid #C8C4BC" }}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-[0.6875rem] font-medium uppercase tracking-[0.04em] lg:normal-case lg:text-sm lg:tracking-normal"
                style={{ color: "#3D5048" }}
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "#8FA89E" }}
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresá tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 placeholder:text-[#9BB0A8]"
                  style={{ backgroundColor: "#FAFAF8", border: "0.5px solid #C8C4BC" }}
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
              className="w-full h-11 font-medium text-white !bg-[#0F6E56] hover:!bg-[#0A5844]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Iniciar sesión
                  <ArrowRight className="h-4 w-4 lg:hidden" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer mobile */}
          <div className="mt-8 flex items-center justify-center gap-2 lg:hidden">
            <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#8FA89E" }} />
            <p className="text-xs" style={{ color: "#8FA89E" }}>
              Autenticación segura · Datos encriptados
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

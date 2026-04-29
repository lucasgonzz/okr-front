/**
 * Única fuente de verdad para la URL base del API.
 * Local:      define NEXT_PUBLIC_API_URL en .env.local
 * Producción: define NEXT_PUBLIC_API_URL en el servidor / Vercel
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001/api/v1";

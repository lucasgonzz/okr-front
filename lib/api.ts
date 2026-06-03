import { API_URL } from "./config";

const TOKEN_KEY = "okr_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Thin wrapper over fetch that:
 *  - Prepends API_URL to all paths
 *  - Injects the Sanctum Bearer token when present
 *  - Throws an Error with the server message on status >= 400
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `Error de API ${res.status}`;
    try {
      const body = await res.json();
      const errors = body?.errors;
      if (errors && typeof errors === "object") {
        for (const fieldErrors of Object.values(errors)) {
          if (Array.isArray(fieldErrors) && fieldErrors[0]) {
            message = String(fieldErrors[0]);
            break;
          }
        }
      } else if (body?.message) {
        message = body.message;
      }
    } catch {
      // non-JSON body, keep default message
    }
    throw new Error(message);
  }

  // 204 No Content — return empty object
  if (res.status === 204) return {} as T;

  return res.json() as Promise<T>;
}

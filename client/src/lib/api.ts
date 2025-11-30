// src/lib/api.ts
import axios from "axios";

/**
 * Resolve API base URL from env (works for both CRA and Vite).
 * - CRA:   REACT_APP_API_BASE
 * - Vite:  VITE_API_BASE
 * Fallback: current origin (useful in previews)
 */
function getApiBase(): string {
  const viteBase = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE) || "";
  const craBase = (process.env.REACT_APP_API_BASE as string) || "";
  const envBase = (viteBase || craBase || "").trim();

  const base = envBase || window.location.origin;
  // ensure trailing slash so axios joins paths correctly
  return base.endsWith("/") ? base : base + "/";
}

export const api = axios.create({
  baseURL: getApiBase(),
  // If you use cookies/CSRF with session auth, set this to true:
  // withCredentials: true,
  timeout: 20000,
});

// Attach JWT (Bearer) from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth expiry / HTML error pages gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isHtmlString =
      typeof error?.response?.data === "string" &&
      error.response.data.trimStart().toLowerCase().startsWith("<!doctype html>");

    const isUnauthorized = error?.response?.status === 401;

    if (isHtmlString || isUnauthorized) {
      try {
        localStorage.clear();
      } catch (_) {}
      // Redirect to login (adjust the path if your route differs)
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Authentication required"));
    }

    return Promise.reject(error);
  }
);

export default api;

// src/services/auth.ts
// Build API base from env (Vite or CRA), with /api suffix
function getApiBase(): string {
  const vite = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE) || "";
  const cra  = (process.env.REACT_APP_API_BASE as string) || "";
  const raw  = (vite || cra || "http://localhost:8000").trim();
  const noSlash = raw.replace(/\/+$/, "");
  return `${noSlash}/api`;
}

const API_BASE_URL = getApiBase();


export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "client" | "admin";
  phone?: string;
}

class AuthService {
  // -----------------------------
  // LOGIN
  // -----------------------------
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; access_token: string; refresh_token: string }> {
    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Login failed");
    }

    const data = await response.json();

    const access = data.access;
    const refresh = data.refresh;

    localStorage.setItem("access_token", access);
    if (refresh) localStorage.setItem("refresh_token", refresh);

    const user = await this.getCurrentUser();

    return { user, access_token: access, refresh_token: refresh };
  }

  // -----------------------------
  // SIGNUP (reuses login)
  // -----------------------------
  async signup(
    userData: SignUpData
  ): Promise<{ user: User; access_token: string; refresh_token: string }> {
    const res = await fetch(`${API_BASE_URL}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.username?.[0] ||
          err.email?.[0] ||
          err.password?.[0] ||
          err.detail ||
          "Registration failed"
      );
    }

    return this.login({
      username: userData.username,
      password: userData.password,
    });
  }

  // -----------------------------
  // GET CURRENT USER
  // -----------------------------
  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No authentication token");

    const response = await fetch(`${API_BASE_URL}/auth/user/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
      }
      throw new Error("Failed to fetch current user");
    }

    const user = await response.json();
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  }

  // -----------------------------
  // REFRESH TOKEN
  // -----------------------------
  async refreshToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token?: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();

    return {
      access_token: data.access,
      refresh_token: data.refresh, // some backends don't return it → optional
    };
  }

  // -----------------------------
  // UTILITIES
  // -----------------------------
  getToken() {
    return localStorage.getItem("access_token");
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  }
}

export const authService = new AuthService();

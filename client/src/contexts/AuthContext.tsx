// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/auth";
import type { User, LoginCredentials, SignUpData } from "@/services/auth";

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (userData: SignUpData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // Load stored user on startup
  // ---------------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.warn("Failed to parse stored user.");
      }
    }

    setLoading(false);
  }, []);

  // ---------------------------
  // Silent refresh every 4 mins
  // ---------------------------
  useEffect(() => {
    const interval = setInterval(async () => {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) return;

      try {
        const newTokens = await authService.refreshToken(refreshToken);

        if (newTokens?.access_token) {
          localStorage.setItem("access_token", newTokens.access_token);
        }

        if (newTokens?.refresh_token) {
          localStorage.setItem("refresh_token", newTokens.refresh_token);
        }

        // Optionally re-fetch user if backend requires it
        // const updatedUser = await authService.getCurrentUser();
        // setUser(updatedUser);
      } catch (err) {
        console.warn("Silent refresh failed, logging out.");
        logout();
      }
    }, 1000 * 60 * 4);

    return () => clearInterval(interval);
  }, []);

  // ---------------------------
  // LOGIN
  // ---------------------------
  const login = async (credentials: LoginCredentials): Promise<void> => {
    const { user, access_token, refresh_token } = await authService.login(credentials);

    // Store tokens
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    // Store user
    localStorage.setItem("user", JSON.stringify(user));

    setUser(user);
  };

  // ---------------------------
  // SIGNUP
  // ---------------------------
  const signup = async (userData: SignUpData) => {
    const { user, access_token, refresh_token } = await authService.signup(userData);

    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("user", JSON.stringify(user));

    setUser(user);
  };

  // ---------------------------
  // LOGOUT
  // ---------------------------
  const logout = () => {
    authService.logout();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

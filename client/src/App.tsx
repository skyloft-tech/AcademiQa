// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import AdminDashboard from "@/pages/AdminDashboard";
import ClientDashboard from "@/pages/ClientDashboard";
import ClientTaskList from "@/pages/ClientTaskList";
import Tasks from "@/pages/Tasks";
import Users from "@/pages/Users";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { TaskProvider } from "@/context/TaskContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Simple loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Protected Route Component - for routes that require authentication
function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required and user's role is not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user's actual role
    const redirectTo = user.role === "admin" ? "/admin" : "/client";
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

// Auth Route Component - ONLY redirects if user is already authenticated
function AuthRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Only redirect if user is already logged in
  if (user) {
    const redirectTo = user.role === "admin" ? "/admin" : "/client";
    return <Navigate to={redirectTo} replace />;
  }

  // If not logged in, show the auth page (login/signup)
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes - accessible to everyone, no authentication required */}
      <Route path="/" element={<Landing />} />
      
      {/* Auth routes - only redirect if already authenticated */}
      <Route 
        path="/login" 
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <AuthRoute>
            <SignUp />
          </AuthRoute>
        } 
      />

      {/* PROTECTED ROUTES - require authentication */}
      
      {/* ADMIN ONLY ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tasks"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Users />
          </ProtectedRoute>
        }
      />

      {/* CLIENT ONLY ROUTES */}
      <Route
        path="/client"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/tasks"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ClientTaskList />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirects to landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TaskProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TaskProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
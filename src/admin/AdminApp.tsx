import { useState } from "react";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";

const SESSION_KEY = "admin_session";

export function AdminApp() {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(SESSION_KEY);
    } catch {
      return null;
    }
  });

  const handleLogin = (next: string) => {
    try {
      window.localStorage.setItem(SESSION_KEY, next);
    } catch {
      // ignore storage failures
    }
    setToken(next);
  };

  const handleLogout = () => {
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore storage failures
    }
    setToken(null);
  };

  if (!token) return <AdminLogin onLogin={handleLogin} />;
  return <AdminDashboard token={token} onLogout={handleLogout} />;
}
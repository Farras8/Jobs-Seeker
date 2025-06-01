import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

// Pakai react-firebase-hooks untuk listen status user
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    // Sambil loading, bisa tampil loading spinner
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    // Kalau belum login, redirect ke /login
    return <Navigate to="/login" replace />;
  }

  // Kalau sudah login, tampilkan halaman anaknya
  return <>{children}</>;
}

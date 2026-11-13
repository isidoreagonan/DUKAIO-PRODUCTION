import { useAuth } from "@/contexts/AuthContext";
import { isAdminUser } from "@/lib/admin";
import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAdminUser(user.email)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}


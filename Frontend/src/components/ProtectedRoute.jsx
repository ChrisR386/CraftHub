import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-gray-600 dark:text-gray-200">
        Lädt …
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  return children;
}

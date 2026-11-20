import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {

  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="status-message">Checking authentication...</div>;
  }

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
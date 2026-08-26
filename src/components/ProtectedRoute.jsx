import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, loadingUser, user } = useAuth();

  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
};

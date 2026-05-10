import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return isAuthenticated ? <Outlet /> : <Navigate to="/home" replace />;
};

export const ProtectedRouteRoleBased = ({ allowedRoles }) => {
  const userRole = useAuthStore((state)=>state.userRole);
  
  if (!allowedRoles.includes(userRole)) {
    if (window.location.pathname === "/") {
      return (
        <div className="p-8 text-center text-red-500">
          Unauthorized: Invalid User Role.
        </div>
      );
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const PublicRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return !isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

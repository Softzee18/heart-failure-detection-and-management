import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

export function ProtectedRoute({ requiredRole }) {
  const token = localStorage.getItem("token");

  // If no token, redirect immediately
  if (!token) {
    toast.error("You must be logged in to access this page.");
    return <Navigate to="/auth/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    if (!decoded?.role || !decoded?.exp) {
      toast.error("Invalid authentication token.");
      return <Navigate to="/auth/login" replace />;
    }

    const userRole = decoded.role.toLowerCase();
    const validRoles = ["user", "doctor", "nurse", "admin"];

    // Invalid role
    if (!validRoles.includes(userRole)) {
      toast.error("Unauthorized access.");
      return <Navigate to="/auth/login" replace />;
    }

    // Token expired
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem("token");
      toast.error("Session expired. Please log in again.");
      return <Navigate to="/auth/login" replace />;
    }

    // Wrong role (redirect to own dashboard)
    if (userRole !== requiredRole) {
      toast.warning("You cannot access another role’s dashboard.");
      return <Navigate to={`/${userRole}/dashboard`} replace />;
    }

    //  Everything valid, allow access
    return <Outlet />;
  } catch (error) {
    console.error("Error decoding token:", error);
    localStorage.removeItem("token");
    toast.error("Authentication failed. Please log in again.");
    return <Navigate to="/auth/login" replace />;
  }
}

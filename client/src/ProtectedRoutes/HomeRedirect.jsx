import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export function HomeRedirect() {
  const token = localStorage.getItem("token");

  // If no token — not logged in → go to login page
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const { exp, role } = decoded;

    // Check if token expired
    const currentTime = Date.now() / 1000;
    if (exp < currentTime) {
      localStorage.removeItem("token");
      return <Navigate to="/auth/login" replace />;
    }

    // Valid token → redirect to role-based dashboard
    if (role) {
      const userRole = role.toLowerCase();
      return <Navigate to={`/${userRole}/dashboard`} replace />;
    }

    // Fallback → if role missing
    return <Navigate to="/auth/login" replace />;
  } catch (error) {
    console.error("Error decoding token:", error);
    localStorage.removeItem("token");
    return <Navigate to="/auth/login" replace />;
  }
}

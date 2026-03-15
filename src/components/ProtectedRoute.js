import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function PrivateRoute({ children }) {
  const { currentUser, userProfile } = useAuth();
  if (!currentUser) return <Navigate to="/" replace />;
  if (userProfile?.isBlocked) return <Navigate to="/" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { currentUser, userProfile } = useAuth();
  if (!currentUser) return <Navigate to="/" replace />;
  if (!userProfile || userProfile.role !== "admin") return <Navigate to="/checkin" replace />;
  return children;
}

export function PublicRoute({ children }) {
  const { currentUser, userProfile } = useAuth();
  if (currentUser && userProfile) {
    if (userProfile.isBlocked) return children;
    if (!userProfile.isSetupComplete) return <Navigate to="/onboarding" replace />;
    if (userProfile.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/checkin" replace />;
  }
  return children;
}

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authService.getProfile();
        setAuthenticated(true);
      } catch (error) {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return authenticated ? children : <Navigate to="/" replace />;
}

import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";

// Lazy load components for better performance
const Dashboard = lazy(() => import("./components/dashboard/Dashboard"));
const ResetPasswordForm = lazy(
  () => import("./components/auth/ResetPasswordForm"),
);
const ForgotPasswordForm = lazy(
  () => import("./components/auth/ForgotPasswordForm"),
);
const AuthCallback = lazy(() => import("./components/auth/AuthCallback"));

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      <>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Auth callback route for handling email confirmations */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Password reset routes */}
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Redirect to dashboard if already authenticated */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />

          {/* Allow Tempo routes in development */}
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;

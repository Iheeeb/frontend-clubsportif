import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { useAuthStore } from "./store/authStore";

// Lazy load des dashboards pour optimiser les performances
const AdminDashboard = lazy(() => import("./components/adminComponents/AdminDashboard").then(module => ({ default: module.AdminDashboard })));
const CoachDashboard = lazy(() => import("./components/coachComponents/CoachDashboard").then(module => ({ default: module.CoachDashboard })));
const MembreDashboard = lazy(() => import("./components/MembreDashboard").then(module => ({ default: module.MembreDashboard })));

// Composant de protection des routes
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Composant principal avec la logique de routage
function AppContent() {
  const { user, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    // Cette fonction sera appelée depuis LoginPage
    // La redirection se fera automatiquement via React Router
  };

  return (
    <Routes>
      {/* Route publique - Landing page */}
      <Route path="/" element={<LandingPage />} />

      {/* Route de connexion */}
      <Route path="/login" element={<LoginPage />} />

      {/* Routes protégées */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
              <AdminDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/coach"
        element={
          <ProtectedRoute allowedRoles={['COACH']}>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
              <CoachDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/membre"
        element={
          <ProtectedRoute allowedRoles={['MEMBER']}>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
              <MembreDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Wrapper principal avec Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
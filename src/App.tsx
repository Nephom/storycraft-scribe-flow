
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, useIsRadiusReady } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import { useEffect } from "react";
import { initializeRadiusService } from "./services/radiusService";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import RadiusSetup from "./pages/RadiusSetup";
import AdminDashboard from "./pages/AdminDashboard";
import UserPreview from "./pages/UserPreview";

// Initialize the service
initializeRadiusService();

const queryClient = new QueryClient();

// Protected route component for regular users
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isGuest } = useAuth();
  
  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Protected route specifically for admins
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user?.isAdmin) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { users } = useAuth();
  const isRadiusReady = useIsRadiusReady();
  
  // Recheck RADIUS service on component mount
  useEffect(() => {
    initializeRadiusService();
  }, []);
  
  // If RADIUS is not configured, force setup
  if (!isRadiusReady) {
    return (
      <Routes>
        <Route path="/radius/setup" element={<RadiusSetup />} />
        <Route path="*" element={<Navigate to="/radius/setup" />} />
      </Routes>
    );
  }
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/user/:username" element={<UserPreview />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

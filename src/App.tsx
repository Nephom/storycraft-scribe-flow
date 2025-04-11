import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AdminProvider, useAdmin } from "./contexts/AdminContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminSetup from "./pages/AdminSetup";
import AdminDashboard from "./pages/AdminDashboard";

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

// Admin setup route that checks if admin setup is needed
const AdminSetupRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdminSetupComplete } = useAdmin();
  
  // 如果管理員設置已完成，重定向到首頁
  if (isAdminSetupComplete) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { users } = useAuth();
  const { isAdminSetupComplete } = useAdmin();
  
  // 檢查是否需要強制進行管理員設置（沒有管理員用戶存在）
  const needsAdminSetup = !isAdminSetupComplete;
  
  if (needsAdminSetup) {
    return (
      <Routes>
        <Route path="/admin/setup" element={<AdminSetup />} />
        <Route path="*" element={<Navigate to="/admin/setup" />} />
      </Routes>
    );
  }
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin/setup" element={<AdminSetupRoute><AdminSetup /></AdminSetupRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
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

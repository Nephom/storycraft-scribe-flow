
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import RadiusSetup from "./pages/RadiusSetup";
import Login from "./pages/Login";
import UserList from "./pages/UserList";
import UserNovel from "./pages/UserNovel";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }
  
  if (!currentUser || !currentUser.isAdmin) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// Inner routes with auth context - using a functional component
const AppRoutes = () => {
  const { isRadiusConfigured } = useAuth();
  
  return (
    <Routes>
      {/* RADIUS setup route */}
      <Route path="/radius/setup" element={
        isRadiusConfigured ? <Navigate to="/login" /> : <RadiusSetup />
      } />
      
      {/* Authentication routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Main app routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <UserList />
        </ProtectedRoute>
      } />
      
      <Route path="/user/:userId" element={
        <ProtectedRoute>
          <UserNovel />
        </ProtectedRoute>
      } />
      
      {/* Admin routes */}
      <Route path="/admin/settings" element={
        <AdminRoute>
          <AdminSettings />
        </AdminRoute>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App component must be a function component
const App = () => {
  // Making sure we're using a proper functional component for React hooks to work
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;

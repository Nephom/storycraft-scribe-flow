
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SetupPage from "./pages/SetupPage";
import AdminPage from "./pages/AdminPage";
import UserListPage from "./pages/UserListPage";
import { isSetupCompleted, isAdminCreated } from "./services/dbService";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

// 创建应用组件，确保我们能够进行正确的状态管理
const App = () => {
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [adminCreated, setAdminCreated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 从服务器获取初始状态
  useEffect(() => {
    setSetupCompleted(isSetupCompleted());
    setAdminCreated(isAdminCreated());
    setLoading(false);
  }, []);

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {!setupCompleted && !adminCreated && (
                <Route path="/setup" element={<SetupPage />} />
              )}
              {!setupCompleted && !adminCreated ? (
                <Route path="*" element={<Navigate to="/setup" replace />} />
              ) : (
                <>
                  <Route path="/" element={<UserListPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/editor/:userId" element={<Index />} />
                  <Route path="*" element={<NotFound />} />
                </>
              )}
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

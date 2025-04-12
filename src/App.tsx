
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, useIsRadiusReady } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import { useEffect, useState } from "react";
import { initializeRadiusService, isRadiusConfigured } from "./services/radiusService";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import RadiusSetup from "./pages/RadiusSetup";
import AdminDashboard from "./pages/AdminDashboard";
import UserPreview from "./pages/UserPreview";

// 创建查询客户端
const queryClient = new QueryClient();

// 受保护路由组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isGuest } = useAuth();
  
  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// 管理员路由
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user?.isAdmin) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// 初始化App并检查RADIUS服务状态
const AppWithProviders = () => {
  // 这里使用useState而不是直接调用函数，以避免无限循环
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRadiusReady, setIsRadiusReady] = useState(false);
  
  // 初始化RADIUS服务
  useEffect(() => {
    const init = async () => {
      await initializeRadiusService();
      setIsRadiusReady(isRadiusConfigured());
      setIsInitialized(true);
    };
    
    init();
  }, []);
  
  // 显示加载指示器，直到初始化完成
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes isRadiusReady={isRadiusReady} />
      </BrowserRouter>
    </AuthProvider>
  );
};

// 应用路由
const AppRoutes = ({ isRadiusReady }: { isRadiusReady: boolean }) => {
  // 如果RADIUS未配置，强制设置
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// 主应用组件
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminProvider>
        <Toaster />
        <Sonner />
        <AppWithProviders />
      </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

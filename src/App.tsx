
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
import { isSetupCompleted } from "./services/dbService";

const queryClient = new QueryClient();
const setupCompleted = isSetupCompleted();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {!setupCompleted && (
              <Route path="/setup" element={<SetupPage />} />
            )}
            {!setupCompleted ? (
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

export default App;

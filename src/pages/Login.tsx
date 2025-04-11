
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import GuestAccess from '@/components/auth/GuestAccess';

const Login = () => {
  const { isRegistrationAllowed } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>
          <p className="mt-2 text-gray-600">Sign in to your account or continue as guest</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register" disabled={!isRegistrationAllowed}>
              Register
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          
          <TabsContent value="register">
            <RegisterForm isRegistrationAllowed={isRegistrationAllowed} />
          </TabsContent>
        </Tabs>
        
        <GuestAccess />
      </div>
    </div>
  );
};

export default Login;

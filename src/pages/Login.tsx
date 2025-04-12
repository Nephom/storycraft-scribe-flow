
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Login = () => {
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, register, continueAsGuest, isRegistrationAllowed } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(loginUsername, loginPassword);
    
    if (success) {
      navigate('/');
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid username or password",
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isRegistrationAllowed) {
      toast({
        variant: "destructive",
        title: "Registration Disabled",
        description: "New user registration is currently disabled by the administrator",
      });
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    if (registerUsername.length < 3) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Username must be at least 3 characters long",
      });
      return;
    }

    if (registerPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    const success = register(registerUsername, registerPassword);
    
    if (success) {
      navigate('/');
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create account. Username may already be taken.",
      });
    }
  };

  const handleGuestAccess = () => {
    continueAsGuest();
    navigate('/');
  };

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
            <form onSubmit={handleLogin} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="login-username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <Input
                    id="login-username"
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                    placeholder="Username"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="Password"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            {isRegistrationAllowed ? (
              <form onSubmit={handleRegister} className="mt-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="register-username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <Input
                      id="register-username"
                      type="text"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      required
                      placeholder="Choose a username"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      placeholder="Choose a password"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm your password"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </form>
            ) : (
              <div className="py-4 text-center">
                <p className="text-gray-600">Registration is currently disabled by the administrator.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">Or</p>
          <Button variant="outline" className="mt-2 w-full" onClick={handleGuestAccess}>
            Continue as Guest
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;

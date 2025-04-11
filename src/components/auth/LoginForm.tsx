
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    
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

  return (
    <form onSubmit={handleLogin} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="login-username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <Input
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
  );
};

export default LoginForm;

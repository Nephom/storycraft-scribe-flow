
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface RegisterFormProps {
  isRegistrationAllowed: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ isRegistrationAllowed }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    if (username.length < 3) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Username must be at least 3 characters long",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    const success = register(username, password);
    
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

  if (!isRegistrationAllowed) {
    return (
      <div className="py-4 text-center">
        <p className="text-gray-600">Registration is currently disabled by the administrator.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="register-username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <Input
            id="register-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
  );
};

export default RegisterForm;

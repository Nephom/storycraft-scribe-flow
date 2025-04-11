
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const GuestAccess: React.FC = () => {
  const { continueAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleGuestAccess = () => {
    continueAsGuest();
    navigate('/');
  };

  return (
    <div className="mt-4 text-center">
      <p className="text-sm text-gray-600">Or</p>
      <Button variant="outline" className="mt-2 w-full" onClick={handleGuestAccess}>
        Continue as Guest
      </Button>
    </div>
  );
};

export default GuestAccess;

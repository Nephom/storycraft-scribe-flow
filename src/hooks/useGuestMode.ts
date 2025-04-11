
import { useState, useEffect } from 'react';

export const useGuestMode = () => {
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('guestMode') === 'true';
  });

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('guestMode', 'true');
  };

  const exitGuestMode = () => {
    setIsGuest(false);
    localStorage.removeItem('guestMode');
  };

  return {
    isGuest,
    continueAsGuest,
    exitGuestMode
  };
};

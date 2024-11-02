import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { auth } from '../config/firebase';

export function useAuth() {
  const { setUser, setAuthenticated, setAuthPopupOpen } = useAuthStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setAuthenticated(!!user);
      if (!user) {
        setAuthPopupOpen(true);
      }
    });

    return () => unsubscribe();
  }, [setUser, setAuthenticated, setAuthPopupOpen]);

  return useAuthStore();
}
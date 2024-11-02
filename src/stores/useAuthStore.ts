import { create } from 'zustand';
import { User } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAuthPopupOpen: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  setAuthPopupOpen: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthPopupOpen: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setAuthPopupOpen: (value) => set({ isAuthPopupOpen: value }),
}));

// Set up auth state listener
auth.onAuthStateChanged((user) => {
  useAuthStore.getState().setUser(user);
});
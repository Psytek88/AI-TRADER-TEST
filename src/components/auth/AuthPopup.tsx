import React, { useState, useEffect } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, AuthError } from '../../services/auth';
import { useAuthStore } from '../../stores/useAuthStore';

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthPopup({ isOpen }: AuthPopupProps) {
  const { isAuthenticated, setAuthPopupOpen } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setAuthPopupOpen(false);
    }
  }, [isAuthenticated, setAuthPopupOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || isAuthenticated) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60">
      <div className="w-full max-w-md bg-[#1a1f2e] rounded-2xl shadow-2xl p-8 relative">
        <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>
        
        <p className="text-gray-400 text-lg mb-8">
          {isSignUp ? 'Sign up to access AI-powered trading insights' : 'Welcome back to AI Trader'}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-red-500 text-sm">{error}</span>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-4 px-6 mb-6 bg-[#2a2f3e] hover:bg-[#2d3344] text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-6 h-6"
          />
          <span>Continue with Google</span>
        </button>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#1a1f2e] text-gray-400">
              or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-gray-300 text-lg mb-2 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#2a2f3e] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-lg mb-2 block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#2a2f3e] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-500 hover:text-blue-400 font-medium"
            disabled={isLoading}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
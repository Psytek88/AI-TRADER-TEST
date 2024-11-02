import React from 'react';
import { Settings, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../stores/useAuthStore';
import { logOut } from '../services/auth';

export function Navigation() {
  const { isDark, toggleTheme } = useTheme();
  const { user, setAuthenticated, setAuthPopupOpen } = useAuthStore();

  const handleLogout = async () => {
    await logOut();
    setAuthenticated(false);
    setAuthPopupOpen(true);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TradeSage AI
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center mr-4 space-x-2">
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user.email}
                </span>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            {user && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500"
                aria-label="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
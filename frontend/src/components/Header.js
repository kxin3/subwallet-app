// frontend/src/components/Header.js - REPLACE COMPLETELY
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Settings, LogOut, User } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') {
      return 'U';
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!user) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">SubWallet</span>
            </div>
            <div className="text-sm text-gray-600">Loading...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">SubWallet</span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 px-3 py-2 hover:bg-gray-50 transition-colors"
            >
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-medium">
                    {getInitials(user.name)}
                  </span>
                )}
              </div>
              <span className="hidden sm:block text-gray-700 font-medium">
                {user.name || 'User'}
              </span>
            </button>

            {showDropdown && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    {/* User Info */}
                    <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{user.name || 'User'}</div>
                      <div className="text-gray-500 truncate">{user.email || 'No email'}</div>
                    </div>
                    
                    {/* Menu Items */}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('/profile');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <User className="h-4 w-4 mr-3 text-gray-400" />
                      Profile
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('/settings');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-400" />
                      Settings
                    </button>
                    
                    <hr className="my-1" />
                    
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        onLogout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-gray-400" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
// frontend/src/App.js - REPLACE COMPLETELY
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Login from './components/Login';
import Register from './components/Register';
import GoogleCallback from './components/GoogleCallback';
import { getUser } from './utils/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await getUser();
      // Ensure user object has required properties
      const safeUser = {
        id: userData.user?.id || '',
        name: userData.user?.name || 'User',
        email: userData.user?.email || '',
        avatar: userData.user?.avatar || '',
        preferences: userData.user?.preferences || { currency: 'USD', notifications: true },
        isGmailConnected: userData.user?.isGmailConnected || false
      };
      setUser(safeUser);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      toast.error('Session expired. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    // Ensure user object has required properties
    const safeUser = {
      id: userData.user?.id || '',
      name: userData.user?.name || 'User',
      email: userData.user?.email || '',
      avatar: userData.user?.avatar || '',
      preferences: userData.user?.preferences || { currency: 'USD', notifications: true },
      isGmailConnected: userData.user?.isGmailConnected || false
    };
    
    setUser(safeUser);
    localStorage.setItem('token', userData.token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route 
          path="/login" 
          element={
            !user ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            !user ? (
              <Register onLogin={handleLogin} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            user ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/profile" 
          element={
            user ? (
              <Profile user={user} onUserUpdate={handleUserUpdate} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/settings" 
          element={
            user ? (
              <Settings user={user} onUserUpdate={handleUserUpdate} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        {/* Google OAuth Callback Route */}
        <Route 
          path="/auth/callback" 
          element={
            user ? (
              <GoogleCallback />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/" 
          element={
            <Navigate to={user ? "/dashboard" : "/login"} replace />
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
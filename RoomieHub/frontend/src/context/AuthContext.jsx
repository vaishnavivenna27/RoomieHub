import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('roomie_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('roomie_token') || null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth session and fetch room details if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const profileRes = await api.get('/auth/profile');
          if (profileRes.success && profileRes.user) {
            setUser(profileRes.user);
            localStorage.setItem('roomie_user', JSON.stringify(profileRes.user));
          }

          // Fetch user's room details
          const roomRes = await api.get('/rooms/my-room');
          if (roomRes.success && roomRes.room) {
            setRoom(roomRes.room);
          }
        } catch (err) {
          console.error('Session verification failed:', err.message);
          // Only clear if token invalid
          if (err.message.includes('token') || err.message.includes('authorized')) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // Handle Login
  const login = (newToken, userData) => {
    localStorage.setItem('roomie_token', newToken);
    localStorage.setItem('roomie_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  // Handle Logout
  const logout = () => {
    localStorage.removeItem('roomie_token');
    localStorage.removeItem('roomie_user');
    setToken(null);
    setUser(null);
    setRoom(null);
  };

  // Update profile in state and localStorage
  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem('roomie_user', JSON.stringify(merged));
  };

  // Refresh current room details from backend
  const refreshRoom = async () => {
    try {
      const roomRes = await api.get('/rooms/my-room');
      if (roomRes.success) {
        setRoom(roomRes.room);
      }
    } catch (err) {
      console.error('Failed to refresh room:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        room,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
        updateUser,
        refreshRoom,
        setRoom
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume AuthContext easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dayflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('dayflow_token');
      if (token) {
        try {
          const res = await authService.getCurrentUser();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('dayflow_user', JSON.stringify(res.data));
          }
        } catch (e) {
          localStorage.removeItem('dayflow_token');
          localStorage.removeItem('dayflow_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.data) {
      localStorage.setItem('dayflow_token', res.data.token);
      localStorage.setItem('dayflow_user', JSON.stringify(res.data));
      setUser(res.data);
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const signup = async (userData) => {
    const res = await authService.signup(userData);
    if (res.success && res.data) {
      localStorage.setItem('dayflow_token', res.data.token);
      localStorage.setItem('dayflow_user', JSON.stringify(res.data));
      setUser(res.data);
      return res.data;
    }
    throw new Error(res.message || 'Signup failed');
  };

  const logout = () => {
    localStorage.removeItem('dayflow_token');
    localStorage.removeItem('dayflow_user');
    setUser(null);
    window.location.href = '/login';
  };

  const isHRAdmin = () => user?.role === ROLES.HR_ADMIN;
  const isEmployee = () => user?.role === ROLES.EMPLOYEE;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      isHRAdmin,
      isEmployee,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

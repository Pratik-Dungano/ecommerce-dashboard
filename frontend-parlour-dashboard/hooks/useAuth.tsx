'use client';

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User, LoginCredentials, AuthResponse } from '../types';
import { authAPI, setAuthToken, removeAuthToken } from '../lib/api';
import { getUser, setUser, removeUser, isAuthenticated, logout as authLogout } from '../utils/auth';

interface SignupCredentials {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  signup: (credentials: SignupCredentials) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (isAuthenticated()) {
        const savedUser = getUser();
        if (savedUser) {
          setUserState(savedUser);
        } else {
          // Try to get user from server
          await refreshUser();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authAPI.login(credentials);

      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        
        console.log('🔐 Storing token and user data:', { userData });
        
        // Store token and user data
        setAuthToken(token);
        setUser(userData);
        setUserState(userData);

        console.log('✅ Token and user data stored successfully');
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authAPI.register(credentials);

      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        
        // Store token and user data
        setAuthToken(token);
        setUser(userData);
        setUserState(userData);

        return { success: true };
      } else {
        return { success: false, message: response.message || 'Signup failed' };
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Signup failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    removeUser();
    setUserState(null);
    authLogout();
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser(userData);
        setUserState(userData);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isLoggedIn: !!user,
    login,
    signup,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth; 
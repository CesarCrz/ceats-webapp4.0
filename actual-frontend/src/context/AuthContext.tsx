'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import { User, LoginCredentials } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar token y usuario desde localStorage al montar el componente
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(userData);
        apiClient.setToken(savedToken);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const { token: newToken, user: newUser } = await apiClient.login(credentials);
      
      setToken(newToken);
      setUser(newUser);
      apiClient.setToken(newToken);
      
      // Guardar en localStorage
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Manejar errores específicos del backend
      if (error.status === 401) {
        if (error.data?.error?.includes('no ha sido verificado')) {
          throw new Error('Tu email no ha sido verificado. Por favor, verifica tu email antes de iniciar sesión.');
        } else {
          throw new Error('Email o contraseña incorrectos. Verifica tus credenciales.');
        }
      } else if (error.status === 503) {
        throw new Error('Servicio temporalmente no disponible. Por favor, intenta más tarde.');
      } else if (error.status === 500) {
        throw new Error('Error interno del servidor. Por favor, intenta más tarde.');
      } else if (error.message?.includes('Failed to fetch')) {
        throw new Error('No se puede conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        throw new Error(error.data?.error || 'Error al iniciar sesión. Por favor, intenta de nuevo.');
      }
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    apiClient.clearToken();
    
    // Limpiar localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

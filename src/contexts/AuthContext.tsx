// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  nome: string;
  email: string;
  fazenda?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
  nomeCompleto?: string;
  email: string;
  password: string;
  telefone?: string;
  fazenda?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔥 CONFIGURAÇÃO DA API - MUDE AQUI QUANDO SUBIR PRO AZURE
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verifica se está logado ao carregar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // Verifica se o token é válido com a API
        const response = await fetch(`${API_URL}/usuarios/verificar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          const userData = await response.json();
          setUser({
            id: userData.id.toString(),
            nome: userData.nome,
            email: userData.email,
          });
        } else {
          // Token inválido, limpa o localStorage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      const response = await fetch(`${API_URL}/usuarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          senha: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || 'Erro ao fazer login');
      }

      const data = await response.json();

      const userData: User = {
        id: data.id.toString(),
        nome: data.nome,
        email: data.email,
      };

      // Salva no localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(userData));

      // Define cookie
      document.cookie = `auth_token=${data.token}; path=/; ${
        rememberMe ? 'max-age=2592000' : ''
      }`;

      // Atualiza o estado
      setUser(userData);

    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Remove do localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');

    // Remove cookie
    document.cookie = 'auth_token=; path=/; max-age=0';

    // Limpa estado
    setUser(null);

    // Redireciona pro login
    router.push('/auth/login');
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nome: data.nomeCompleto ?? data.email,
            email: data.email,
            senha: data.password,
            telefone: data.telefone,
            fazenda: data.fazenda,
          }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || 'Erro ao criar conta');
      }

      const responseData = await response.json();

      // Após criar, faz login automático
      await login(data.email, data.password, false);

    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
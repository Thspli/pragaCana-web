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
  nome: string;
  email: string;
  password: string;
  telefone?: string;
  fazenda?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verifica se está logado ao carregar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      // Verifica se tem token no cookie (simulado com localStorage)
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      // SIMULAÇÃO - Substitua pela sua chamada real à API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Exemplo de validação
      if (email === 'admin@fazenda.com' && password === 'admin123') {
        const userData: User = {
          id: '1',
          nome: 'João da Silva',
          email: email,
          fazenda: 'Fazenda Santa Rita'
        };

        const token = 'fake-jwt-token-' + Date.now();

        // Salva no localStorage (simulando cookie)
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));

        // Atualiza o estado
        setUser(userData);

        // Define cookie via document.cookie para o middleware ler
        document.cookie = `auth_token=${token}; path=/; ${rememberMe ? 'max-age=2592000' : ''}`;

        return;
      } else {
        throw new Error('E-mail ou senha incorretos');
      }
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
      // SIMULAÇÃO - Substitua pela sua chamada real à API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simula criação de conta
      console.log('Conta criada:', data);

      // Após criar, já faz login automático
      const userData: User = {
        id: Date.now().toString(),
        nome: data.nome,
        email: data.email,
        fazenda: data.fazenda
      };

      const token = 'fake-jwt-token-' + Date.now();

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      document.cookie = `auth_token=${token}; path=/;`;

      setUser(userData);
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
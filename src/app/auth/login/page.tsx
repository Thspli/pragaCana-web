// src/app/auth/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Bug, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import styles from "../auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validações básicas
    if (!email || !password) {
      setError("Por favor, preencha todos os campos!");
      return;
    }

    if (!email.includes("@")) {
      setError("Por favor, insira um e-mail válido!");
      return;
    }

    setLoading(true);

    try {
      await login(email, password, rememberMe);
      
      setSuccess("Login realizado com sucesso!");
      
      // Pega a URL de redirecionamento ou vai pra home
      const redirectUrl = searchParams.get('redirect') || '/';
      
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* Header */}
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>
            <Bug />
            <h1 className={styles.authTitle}>Fazenda Santa Rita</h1>
          </div>
          <p className={styles.authSubtitle}>
            Sistema de Monitoramento GPS - Cana-de-Açúcar
          </p>
        </div>

        {/* Body */}
        <div className={styles.authBody}>
          {/* Alert de erro */}
          {error && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              <AlertCircle />
              <span>{error}</span>
            </div>
          )}

          {/* Alert de sucesso */}
          {success && (
            <div className={`${styles.alert} ${styles.alertSuccess}`}>
              <CheckCircle />
              <span>{success}</span>
            </div>
          )}

          <form className={styles.authForm} onSubmit={handleSubmit}>
            {/* E-mail */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="email">
                <Mail />
                E-mail
              </label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  className={styles.formInput}
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Senha */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="password">
                <Lock />
                Senha
              </label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={styles.formInput}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Lembrar-me e Esqueceu senha */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className={styles.rememberGroup}>
                <input
                  type="checkbox"
                  id="remember"
                  className={styles.checkbox}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="remember" className={styles.checkboxLabel}>
                  Lembrar-me
                </label>
              </div>
              <div className={styles.forgotLink}>
                <a href="/auth/recuperar-senha">Esqueceu a senha?</a>
              </div>
            </div>

            {/* Botão de login */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.spinner} />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className={styles.divider}>
            <span className={styles.dividerText}>OU</span>
          </div>

          {/* Botões sociais */}
          <div className={styles.socialButtons}>
            <button 
              className={styles.socialButton}
              onClick={() => alert("Login com Google (em breve)")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button 
              className={styles.socialButton}
              onClick={() => alert("Login com Microsoft (em breve)")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#00A4EF">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
              </svg>
              Microsoft
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.authFooter}>
          <p>
            Não tem uma conta?{" "}
            <a href="/auth/cadastro">Cadastre-se gratuitamente</a>
          </p>
        </div>
      </div>
    </div>
  );
}
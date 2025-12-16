// src/app/auth/cadastro/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Bug, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User,
  Phone,
  MapPin,
  UserPlus,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import styles from "../auth.module.css";

export default function CadastroPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    fazenda: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | null>(null);

  const calculatePasswordStrength = (pass: string) => {
    if (pass.length === 0) {
      setPasswordStrength(null);
      return;
    }
    if (pass.length < 6) {
      setPasswordStrength("weak");
    } else if (pass.length < 10) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("strong");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "password") {
      calculatePasswordStrength(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validações
    if (!formData.nome || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Por favor, insira um e-mail válido!");
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem!");
      return;
    }

    if (!acceptTerms) {
      setError("Você precisa aceitar os termos de uso!");
      return;
    }

    setLoading(true);

    try {
      await register({
        nome: formData.nome,
        email: formData.email,
        password: formData.password,
        telefone: formData.telefone,
        fazenda: formData.fazenda,
      });

      setSuccess("Cadastro realizado com sucesso! Redirecionando...");
      
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Tente novamente.");
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
            <h1 className={styles.authTitle}>Criar Conta</h1>
          </div>
          <p className={styles.authSubtitle}>
            Junte-se ao melhor sistema de monitoramento agrícola
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
            {/* Nome completo */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="nome">
                <User />
                Nome Completo *
              </label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} />
                <input
                  id="nome"
                  type="text"
                  className={styles.formInput}
                  placeholder="João da Silva"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* E-mail */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="email">
                <Mail />
                E-mail *
              </label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  className={styles.formInput}
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Grid 2 colunas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="telefone">
                  <Phone />
                  Telefone
                </label>
                <div className={styles.inputWrapper}>
                  <Phone className={styles.inputIcon} />
                  <input
                    id="telefone"
                    type="tel"
                    className={styles.formInput}
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange("telefone", e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="fazenda">
                  <MapPin />
                  Fazenda
                </label>
                <div className={styles.inputWrapper}>
                  <MapPin className={styles.inputIcon} />
                  <input
                    id="fazenda"
                    type="text"
                    className={styles.formInput}
                    placeholder="Nome da fazenda"
                    value={formData.fazenda}
                    onChange={(e) => handleInputChange("fazenda", e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Senha */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="password">
                <Lock />
                Senha *
              </label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={styles.formInput}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
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

              {passwordStrength && (
                <div className={styles.passwordStrength}>
                  <div className={styles.strengthBar}>
                    <div className={`${styles.strengthFill} ${
                      passwordStrength === "weak" ? styles.strengthWeak :
                      passwordStrength === "medium" ? styles.strengthMedium :
                      styles.strengthStrong
                    }`} />
                  </div>
                  <div className={`${styles.strengthText} ${
                    passwordStrength === "weak" ? styles.strengthTextWeak :
                    passwordStrength === "medium" ? styles.strengthTextMedium :
                    styles.strengthTextStrong
                  }`}>
                    {passwordStrength === "weak" && "⚠️ Senha fraca"}
                    {passwordStrength === "medium" && "⚡ Senha média"}
                    {passwordStrength === "strong" && "✅ Senha forte"}
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar senha */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="confirmPassword">
                <Lock />
                Confirmar Senha *
              </label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={styles.formInput}
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Aceitar termos */}
            <div className={styles.rememberGroup}>
              <input
                type="checkbox"
                id="terms"
                className={styles.checkbox}
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="terms" className={styles.checkboxLabel}>
                Aceito os{" "}
                <a 
                  href="/termos" 
                  style={{ color: "#15803d", fontWeight: 600 }}
                  target="_blank"
                >
                  termos de uso
                </a>
                {" "}e{" "}
                <a 
                  href="/privacidade" 
                  style={{ color: "#15803d", fontWeight: 600 }}
                  target="_blank"
                >
                  política de privacidade
                </a>
              </label>
            </div>

            {/* Botão de cadastro */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.spinner} />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus />
                  Criar Conta
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className={styles.divider}>
            <span className={styles.dividerText}>OU CADASTRE-SE COM</span>
          </div>

          {/* Botões sociais */}
          <div className={styles.socialButtons}>
            <button 
              className={styles.socialButton}
              onClick={() => alert("Cadastro com Google (em breve)")}
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
              onClick={() => alert("Cadastro com Microsoft (em breve)")}
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
            Já tem uma conta?{" "}
            <a href="/auth/login">Fazer login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
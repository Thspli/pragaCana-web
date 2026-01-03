// src/components/panels/Header.tsx (ATUALIZADO)
"use client";

import React, { useState } from "react";
import { Bug, MapPin, Target, TrendingUp, BarChart3, User, LogOut, Settings, Bell, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface HeaderProps {
  totals: {
    totalTalhoes: number;
    totalArmadilhas: number;
    totalPragas: number;
    areaTotal: number;
  };
  onNovoTalhao: () => void;
  onListaTalhoes: () => void;
  onListaArmadilhas: () => void;
  onMinhaLocalizacao: () => void;
  onCreateTestTalhao: () => void;
}

export function Header({
  totals,
  onNovoTalhao,
  onListaTalhoes,
  onListaArmadilhas,
  onMinhaLocalizacao,
  onCreateTestTalhao,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Notificações mock (depois você integra com o backend)
  const notifications = [
    { id: 1, type: 'warning', message: 'Talhão 3 com infestação alta', time: '5 min' },
    { id: 2, type: 'success', message: 'Nova armadilha cadastrada', time: '1h' },
    { id: 3, type: 'info', message: 'Relatório mensal disponível', time: '3h' },
  ];

  const unreadNotifications = notifications.length;

  return (
    <header
      style={{
        background: "linear-gradient(135deg, rgba(21, 128, 61, 0.95) 0%, rgba(34, 197, 94, 0.95) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        {/* Logo + Brand */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: "flex", alignItems: "center", gap: "1rem" }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              padding: "0.75rem",
              borderRadius: "1rem",
              display: "flex",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Bug style={{ width: "2rem", height: "2rem", color: "white" }} />
          </div>
          <div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "white",
                margin: 0,
                lineHeight: 1,
              }}
            >
              Fazenda Santa Rita
            </h1>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                fontWeight: 500,
              }}
            >
              Sistema de Monitoramento Agrícola
            </p>
          </div>
        </motion.div>

        {/* Stats Cards Compactos */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <StatCard
            icon={<MapPin size={18} />}
            label="Talhões"
            value={totals.totalTalhoes}
            onClick={onListaTalhoes}
            delay={0.1}
          />
          <StatCard
            icon={<Target size={18} />}
            label="Armadilhas"
            value={totals.totalArmadilhas}
            onClick={onListaArmadilhas}
            delay={0.2}
          />
          <StatCard
            icon={<Bug size={18} />}
            label="Pragas"
            value={totals.totalPragas}
            color="#ef4444"
            delay={0.3}
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            label="Área"
            value={`${totals.areaTotal.toFixed(1)}ha`}
            delay={0.4}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {/* Dashboard Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard')}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              padding: "0.625rem 1rem",
              borderRadius: "0.75rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "white",
              fontWeight: 600,
              fontSize: "0.875rem",
              backdropFilter: "blur(10px)",
              transition: "all 0.2s",
            }}
          >
            <BarChart3 size={18} />
            Dashboard
          </motion.button>

          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "0.625rem",
                borderRadius: "0.75rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "white",
                backdropFilter: "blur(10px)",
                position: "relative",
              }}
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    background: "#ef4444",
                    color: "white",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.4rem",
                    borderRadius: "999px",
                    border: "2px solid rgba(21, 128, 61, 0.95)",
                  }}
                >
                  {unreadNotifications}
                </span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 0.5rem)",
                    right: 0,
                    background: "white",
                    borderRadius: "1rem",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                    border: "1px solid #e5e7eb",
                    width: "320px",
                    maxHeight: "400px",
                    overflowY: "auto",
                    zIndex: 2000,
                  }}
                >
                  <div
                    style={{
                      padding: "1rem",
                      borderBottom: "1px solid #e5e7eb",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#1f2937" }}>
                      Notificações
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600 }}>
                      {unreadNotifications} novas
                    </span>
                  </div>
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        padding: "0.875rem 1rem",
                        borderBottom: "1px solid #f3f4f6",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                    >
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background:
                              notif.type === "warning"
                                ? "#f59e0b"
                                : notif.type === "success"
                                ? "#22c55e"
                                : "#3b82f6",
                            marginTop: "0.25rem",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>
                            {notif.message}
                          </p>
                          <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{notif.time} atrás</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "center",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    <button
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#15803d",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Ver todas
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          {user && (
            <div style={{ position: "relative" }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  padding: "0.5rem 0.875rem",
                  borderRadius: "0.75rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                  }}
                >
                  {user.nome.charAt(0).toUpperCase()}
                </div>
                <div style={{ textAlign: "left" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "white",
                      lineHeight: 1,
                    }}
                  >
                    {user.nome}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.7rem",
                      color: "rgba(255, 255, 255, 0.7)",
                      marginTop: "0.125rem",
                    }}
                  >
                    {user.fazenda || user.email}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    transition: "transform 0.2s",
                    transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </motion.button>

              {/* User Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 0.5rem)",
                      right: 0,
                      background: "white",
                      borderRadius: "1rem",
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                      border: "1px solid #e5e7eb",
                      width: "240px",
                      overflow: "hidden",
                      zIndex: 2000,
                    }}
                  >
                    <div style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}>
                      <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
                        {user.nome}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                        {user.email}
                      </p>
                    </div>
                    <MenuItem
                      icon={<User size={16} />}
                      label="Meu Perfil"
                      onClick={() => {
                        setShowUserMenu(false);
                        alert("Perfil (em desenvolvimento)");
                      }}
                    />
                    <MenuItem
                      icon={<Settings size={16} />}
                      label="Configurações"
                      onClick={() => {
                        setShowUserMenu(false);
                        alert("Configurações (em desenvolvimento)");
                      }}
                    />
                    <div style={{ borderTop: "1px solid #e5e7eb" }}>
                      <MenuItem
                        icon={<LogOut size={16} />}
                        label="Sair"
                        onClick={logout}
                        danger
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function StatCard({ icon, label, value, color, onClick, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, scale: 1.05 }}
      onClick={onClick}
      style={{
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        padding: "0.75rem 1rem",
        borderRadius: "0.875rem",
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.375rem",
        minWidth: "90px",
        transition: "all 0.2s",
      }}
    >
      <div style={{ color: color || "white", opacity: 0.9 }}>{icon}</div>
      <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", lineHeight: 1 }}>
        {value}
      </div>
      <div
        style={{
          fontSize: "0.7rem",
          color: "rgba(255, 255, 255, 0.8)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>
    </motion.div>
  );
}

function MenuItem({ icon, label, onClick, danger }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "0.75rem 1rem",
        background: "transparent",
        border: "none",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        cursor: "pointer",
        fontSize: "0.875rem",
        fontWeight: 500,
        color: danger ? "#ef4444" : "#374151",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? "#fef2f2" : "#f9fafb";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {icon}
      {label}
    </button>
  );
}
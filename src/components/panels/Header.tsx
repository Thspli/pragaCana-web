// src/components/panels/Header.tsx
"use client";

import React from "react";
import { Bug, Plus, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  totals: {
    totalTalhoes: number;
    totalArmadilhas: number;
    totalPragas: number;
    areaTotal: number;
  };
  onNovoTalhao: () => void;
  onListaTalhoes: () => void;
  onMinhaLocalizacao: () => void;
  onCreateTestTalhao: () => void;
}

export function Header({
  totals,
  onNovoTalhao,
  onListaTalhoes,
  onMinhaLocalizacao,
  onCreateTestTalhao,
}: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header style={{ 
      background: "linear-gradient(to right, #15803d, #22c55e)", 
      borderBottom: "4px solid #14532d", 
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)" 
    }}>
      <div style={{ 
        padding: "1.25rem 2rem", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        flexWrap: "wrap", 
        gap: "1rem" 
      }}>
        <div>
          <h1 style={{ 
            fontSize: "1.875rem", 
            fontWeight: "bold", 
            color: "white", 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            margin: 0 
          }}>
            <Bug style={{ width: "2rem", height: "2rem" }} />
            Fazenda Santa Rita
          </h1>
          <p style={{ 
            color: "rgba(255,255,255,0.9)", 
            fontSize: "0.875rem", 
            marginTop: "0.25rem" 
          }}>
            Sistema de Monitoramento GPS - Cana-de-Açúcar
          </p>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Stats */}
          <motion.div
            onClick={onListaTalhoes}
            whileHover={{ scale: 1.05, y: -5 }}
            style={{ 
              textAlign: "center", 
              background: "rgba(255,255,255,0.2)", 
              padding: "0.75rem 1.25rem", 
              borderRadius: "0.5rem", 
              cursor: "pointer" 
            }}
          >
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white", margin: 0 }}>
              {totals.totalTalhoes}
            </p>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.9)", margin: 0 }}>
              Talhões
            </p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -5 }} style={{ 
            textAlign: "center", 
            background: "rgba(255,255,255,0.2)", 
            padding: "0.75rem 1.25rem", 
            borderRadius: "0.5rem" 
          }}>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white", margin: 0 }}>
              {totals.totalArmadilhas}
            </p>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.9)", margin: 0 }}>
              Armadilhas
            </p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -5 }} style={{ 
            textAlign: "center", 
            background: "rgba(255,255,255,0.2)", 
            padding: "0.75rem 1.25rem", 
            borderRadius: "0.5rem" 
          }}>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white", margin: 0 }}>
              {totals.areaTotal.toFixed(1)}ha
            </p>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.9)", margin: 0 }}>
              Área Total
            </p>
          </motion.div>

          {/* User info e Logout */}
          {user && (
            <>
              <div style={{ 
                background: "rgba(255,255,255,0.2)", 
                padding: "0.75rem 1.25rem", 
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <User size={18} style={{ color: "white" }} />
                <div>
                  <p style={{ 
                    fontSize: "0.875rem", 
                    fontWeight: "bold", 
                    color: "white", 
                    margin: 0,
                    lineHeight: 1.2
                  }}>
                    {user.nome}
                  </p>
                  <p style={{ 
                    fontSize: "0.7rem", 
                    color: "rgba(255,255,255,0.8)", 
                    margin: 0 
                  }}>
                    {user.fazenda || user.email}
                  </p>
                </div>
              </div>

              <motion.button
                onClick={logout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "rgba(220, 38, 38, 0.9)",
                  color: "white",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  border: "2px solid rgba(255,255,255,0.3)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <LogOut size={18} />
                Sair
              </motion.button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
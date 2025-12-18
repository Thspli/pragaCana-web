"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Bug, Target } from "lucide-react";
import { Talhao } from "../../hooks/useTalhoes";

interface ListaTalhoesModalProps {
  open: boolean;
  onClose: () => void;
  talhoes: Talhao[];
  onTalhaoClick?: (talhao: Talhao) => void;
}

export function ListaTalhoesModal({
  open,
  onClose,
  talhoes,
  onTalhaoClick,
}: ListaTalhoesModalProps) {
  if (!open) return null;

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "baixo":
        return { bg: "#dcfce7", color: "#15803d", label: "Baixa Infestação" };
      case "medio":
        return { bg: "#fef3c7", color: "#92400e", label: "Média Infestação" };
      case "alto":
        return { bg: "#fed7aa", color: "#9a3412", label: "Alta Infestação" };
      case "critico":
        return { bg: "#fecaca", color: "#7f1d1d", label: "Crítica" };
      default:
        return { bg: "#e5e7eb", color: "#374151", label: "Sem Status" };
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            padding: "2rem",
            backdropFilter: "blur(4px)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "1rem",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              width: "100%",
              maxWidth: "1200px",
              maxHeight: "85vh",
              overflow: "hidden",
              border: "2px solid #e0e7ff",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(to right, #15803d, #22c55e)",
                padding: "1.5rem 2rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2px solid #14532d",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "white",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <MapPin size={28} />
                  Meus Talhões
                </h2>
                <p
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "0.9rem",
                    marginTop: "0.25rem",
                  }}
                >
                  Total de {talhoes.length} talhão(ões) cadastrado(s)
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  padding: "0.625rem",
                  background: "rgba(255,255,255,0.2)",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderRadius: "0.625rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div
              style={{
                padding: "2rem",
                overflowY: "auto",
                flex: 1,
              }}
            >
              {talhoes.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "4rem 2rem",
                    color: "#6b7280",
                  }}
                >
                  <MapPin size={64} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                    Nenhum talhão cadastrado
                  </h3>
                  <p style={{ fontSize: "0.9rem" }}>
                    Comece desenhando um novo talhão no mapa!
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  {talhoes.map((talhao) => {
                    const statusInfo = getStatusColor(talhao.status);
                    return (
                      <motion.div
                        key={talhao.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        onClick={() => {
                          if (onTalhaoClick) {
                            onTalhaoClick(talhao);
                            onClose();
                          }
                        }}
                        style={{
                          background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
                          border: "2px solid #e0e7ff",
                          borderRadius: "0.75rem",
                          padding: "1.5rem",
                          cursor: onTalhaoClick ? "pointer" : "default",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        }}
                      >
                        {/* Card Header */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "1rem",
                            paddingBottom: "1rem",
                            borderBottom: "2px solid #f0f0f0",
                          }}
                        >
                          <h3
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: 700,
                              color: "#15803d",
                              margin: 0,
                              flex: 1,
                            }}
                          >
                            {talhao.nome}
                          </h3>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "#22c55e",
                              fontWeight: 700,
                              background: "#f0fdf4",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "0.5rem",
                              letterSpacing: "0.05em",
                            }}
                          >
                            #{talhao.id}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div
                          style={{
                            display: "inline-block",
                            padding: "0.5rem 1rem",
                            borderRadius: "0.5rem",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.02em",
                            background: statusInfo.bg,
                            color: statusInfo.color,
                            marginBottom: "1rem",
                          }}
                        >
                          {statusInfo.label}
                        </div>

                        {/* Stats */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem",
                            marginBottom: "1rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              color: "#14532d",
                              fontSize: "0.9rem",
                              fontWeight: 600,
                            }}
                          >
                            <MapPin size={18} style={{ color: "#22c55e", flexShrink: 0 }} />
                            <span>Área: {talhao.area?.toFixed(2) ?? "N/A"} ha</span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              color: "#14532d",
                              fontSize: "0.9rem",
                              fontWeight: 600,
                            }}
                          >
                            <Bug size={18} style={{ color: "#22c55e", flexShrink: 0 }} />
                            <span>Pragas: {talhao.totalPragas ?? 0}</span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              color: "#14532d",
                              fontSize: "0.9rem",
                              fontWeight: 600,
                            }}
                          >
                            <Target size={18} style={{ color: "#22c55e", flexShrink: 0 }} />
                            <span>Armadilhas: {talhao.armadilhasAtivas ?? 0}</span>
                          </div>

                          {talhao.ultimaColeta && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                color: "#14532d",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                              }}
                            >
                              <Calendar size={18} style={{ color: "#22c55e", flexShrink: 0 }} />
                              <span>
                                Última coleta:{" "}
                                {new Date(talhao.ultimaColeta).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div
                          style={{
                            marginTop: "auto",
                            paddingTop: "1rem",
                            borderTop: "2px solid #f0f0f0",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              color: "#6b7280",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                            }}
                          >
                            {talhao.center ? (
                              <>
                                Lat: {talhao.center[0].toFixed(5)}
                                <br />
                                Lng: {talhao.center[1].toFixed(5)}
                              </>
                            ) : (
                              <>Lat: N/A<br />Lng: N/A</>
                            )}
                          </span>
                          {onTalhaoClick && (
                            <span
                              style={{
                                color: "#15803d",
                                fontWeight: 700,
                                fontSize: "0.85rem",
                              }}
                            >
                              Ver no mapa →
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
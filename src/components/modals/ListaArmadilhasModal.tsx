// src/components/modals/ListaArmadilhasModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, ChevronLeft, ChevronRight, MapPin, Calendar, Camera, AlertCircle, CheckCircle } from "lucide-react";

interface Armadilha {
  id: number;
  nome: string;
  observacao?: string;
  foto?: string;
  dataFoto?: string;
  ausencia: boolean;
  latitude: number;
  longitude: number;
  talhaoId: number;
  criadoEm?: string;
}

interface Talhao {
  id: number;
  nome: string;
  area: number | null;
  status: "baixo" | "medio" | "alto" | "critico" | null;
  totalPragas: number | null;
  armadilhasAtivas: number | null;
}

interface ListaArmadilhasModalProps {
  open: boolean;
  onClose: () => void;
  talhoes: Talhao[];
  onArmadilhaClick?: (armadilha: Armadilha) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export function ListaArmadilhasModal({
  open,
  onClose,
  talhoes,
  onArmadilhaClick,
}: ListaArmadilhasModalProps) {
  const [currentTalhaoIndex, setCurrentTalhaoIndex] = useState(0);
  const [armadilhas, setArmadilhas] = useState<Armadilha[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const currentTalhao = talhoes[currentTalhaoIndex];

  // Busca armadilhas quando muda de talhão
  useEffect(() => {
    if (!open || !currentTalhao) return;

    const fetchArmadilhas = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const params = new URLSearchParams();
        params.set('talhaoId', String(currentTalhao.id));

        const res = await fetch(`${API_URL}/armadilhas?${params.toString()}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        if (!res.ok) {
          console.warn(`⚠️ Erro ao buscar armadilhas: ${res.status}`);
          setArmadilhas([]);
          return;
        }

        const data = await res.json();
        
        // Remove duplicatas e filtra por coordenadas válidas
        const uniqueArmadilhas = Array.from(
          new Map(data.map((a: any) => [a.id, a])).values()
        ) as Armadilha[];
        
        const armadilhasValidas = uniqueArmadilhas.filter(
          a => a.latitude != null && a.longitude != null
        );

        setArmadilhas(armadilhasValidas);
      } catch (err) {
        console.error('❌ Erro ao buscar armadilhas:', err);
        setArmadilhas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArmadilhas();
  }, [open, currentTalhao]);

  // Reset quando fecha
  useEffect(() => {
    if (!open) {
      setCurrentTalhaoIndex(0);
      setArmadilhas([]);
    }
  }, [open]);

  if (!open) return null;

  const handlePrevTalhao = () => {
    setCurrentTalhaoIndex((prev) => (prev > 0 ? prev - 1 : talhoes.length - 1));
  };

  const handleNextTalhao = () => {
    setCurrentTalhaoIndex((prev) => (prev < talhoes.length - 1 ? prev + 1 : 0));
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "baixo": return { bg: "#dcfce7", color: "#15803d" };
      case "medio": return { bg: "#fef3c7", color: "#92400e" };
      case "alto": return { bg: "#fed7aa", color: "#9a3412" };
      case "critico": return { bg: "#fecaca", color: "#7f1d1d" };
      default: return { bg: "#e5e7eb", color: "#374151" };
    }
  };

  const statusInfo = getStatusColor(currentTalhao?.status);

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
              border: "2px solid #fef3c7",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header com navegação entre talhões */}
            <div
              style={{
                background: "linear-gradient(to right, #f59e0b, #fbbf24)",
                padding: "1.5rem 2rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                borderBottom: "2px solid #d97706",
              }}
            >
              {/* Botão Anterior */}
              <button
                onClick={handlePrevTalhao}
                disabled={talhoes.length <= 1}
                style={{
                  padding: "0.625rem",
                  background: "rgba(255,255,255,0.2)",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderRadius: "0.625rem",
                  cursor: talhoes.length > 1 ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  opacity: talhoes.length > 1 ? 1 : 0.5,
                }}
              >
                <ChevronLeft size={24} />
              </button>

              {/* Info do Talhão Atual */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
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
                    <Target size={28} />
                    Armadilhas - {currentTalhao?.nome}
                  </h2>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      background: "rgba(255,255,255,0.2)",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "0.5rem",
                      fontWeight: 600,
                      color: "white",
                    }}
                  >
                    Talhão {currentTalhaoIndex + 1}/{talhoes.length}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    }}
                  >
                    {armadilhas.length} armadilha(s) cadastrada(s)
                  </span>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "0.5rem",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      background: statusInfo.bg,
                      color: statusInfo.color,
                    }}
                  >
                    {currentTalhao?.status?.toUpperCase() || "SEM STATUS"}
                  </div>
                </div>
              </div>

              {/* Botão Próximo */}
              <button
                onClick={handleNextTalhao}
                disabled={talhoes.length <= 1}
                style={{
                  padding: "0.625rem",
                  background: "rgba(255,255,255,0.2)",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderRadius: "0.625rem",
                  cursor: talhoes.length > 1 ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  opacity: talhoes.length > 1 ? 1 : 0.5,
                }}
              >
                <ChevronRight size={24} />
              </button>

              {/* Botão Fechar */}
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
              {loading ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "4px solid #f3f4f6",
                      borderTop: "4px solid #f59e0b",
                      borderRadius: "50%",
                      margin: "0 auto 1rem",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <p style={{ color: "#6b7280", fontWeight: 600 }}>
                    Carregando armadilhas...
                  </p>
                </div>
              ) : armadilhas.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "4rem 2rem",
                    color: "#6b7280",
                  }}
                >
                  <Target size={64} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                    Nenhuma armadilha cadastrada
                  </h3>
                  <p style={{ fontSize: "0.9rem" }}>
                    Adicione armadilhas clicando no mapa dentro do talhão {currentTalhao?.nome}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  {armadilhas.map((armadilha) => (
                    <motion.div
                      key={armadilha.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      onClick={() => {
                        if (onArmadilhaClick) {
                          onArmadilhaClick(armadilha);
                          onClose();
                        }
                      }}
                      style={{
                        background: "linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)",
                        border: armadilha.ausencia ? "2px solid #fca5a5" : "2px solid #fbbf24",
                        borderRadius: "0.75rem",
                        padding: "1.5rem",
                        cursor: onArmadilhaClick ? "pointer" : "default",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Background decoration */}
                      <div
                        style={{
                          position: "absolute",
                          top: -20,
                          right: -20,
                          width: 80,
                          height: 80,
                          background: armadilha.ausencia 
                            ? "radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)"
                            : "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)",
                          borderRadius: "50%",
                        }}
                      />

                      {/* Card Header */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "1rem",
                          paddingBottom: "1rem",
                          borderBottom: "2px solid #fef3c7",
                          position: "relative",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            color: "#92400e",
                            margin: 0,
                            flex: 1,
                          }}
                        >
                          {armadilha.nome || 'Armadilha'}
                        </h3>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "#f59e0b",
                            fontWeight: 700,
                            background: "#fef3c7",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "0.5rem",
                            letterSpacing: "0.05em",
                          }}
                        >
                          #{armadilha.id}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem 1rem",
                          borderRadius: "0.5rem",
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.02em",
                          background: armadilha.ausencia ? "#fee2e2" : "#dcfce7",
                          color: armadilha.ausencia ? "#991b1b" : "#14532d",
                          marginBottom: "1rem",
                        }}
                      >
                        {armadilha.ausencia ? (
                          <>
                            <AlertCircle size={16} />
                            Ausência
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Ativa
                          </>
                        )}
                      </div>

                      {/* Foto Preview */}
                      {armadilha.foto && (
                        <div
                          style={{
                            width: "100%",
                            height: "160px",
                            borderRadius: "0.5rem",
                            overflow: "hidden",
                            marginBottom: "1rem",
                            border: "2px solid #fef3c7",
                            position: "relative",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(armadilha.foto || null);
                          }}
                        >
                          <img
                            src={armadilha.foto}
                            alt="Foto armadilha"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                              padding: "1.5rem 0.75rem 0.75rem",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              fontSize: "0.75rem",
                            }}
                          >
                            <Camera size={14} />
                            Clique para ampliar
                          </div>
                        </div>
                      )}

                      {/* Observação */}
                      {armadilha.observacao && (
                        <div
                          style={{
                            background: "#fef3c7",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            marginBottom: "1rem",
                            fontSize: "0.875rem",
                            color: "#92400e",
                            lineHeight: 1.5,
                          }}
                        >
                          {armadilha.observacao}
                        </div>
                      )}

                      {/* Stats */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            color: "#92400e",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          <MapPin size={16} style={{ color: "#f59e0b", flexShrink: 0 }} />
                          <span>
                            {armadilha.latitude.toFixed(6)}, {armadilha.longitude.toFixed(6)}
                          </span>
                        </div>

                        {armadilha.dataFoto && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              color: "#92400e",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                          >
                            <Camera size={16} style={{ color: "#f59e0b", flexShrink: 0 }} />
                            <span>
                              {new Date(armadilha.dataFoto).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        )}

                        {armadilha.criadoEm && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              color: "#92400e",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                          >
                            <Calendar size={16} style={{ color: "#f59e0b", flexShrink: 0 }} />
                            <span>
                              Criada em {new Date(armadilha.criadoEm).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div
                        style={{
                          marginTop: "1rem",
                          paddingTop: "1rem",
                          borderTop: "2px solid #fef3c7",
                          textAlign: "right",
                        }}
                      >
                        {onArmadilhaClick && (
                          <span
                            style={{
                              color: "#f59e0b",
                              fontWeight: 700,
                              fontSize: "0.85rem",
                            }}
                          >
                            Ver detalhes →
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Modal de preview de imagem */}
          {previewImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 5000,
                padding: "2rem",
                cursor: "pointer",
              }}
            >
              <img
                src={previewImage}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  borderRadius: "0.75rem",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                }}
              />
            </motion.div>
          )}
        </motion.div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AnimatePresence>
  );
}
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  MapPin, 
  Calendar, 
  Bug, 
  Target, 
  FileText,
  BarChart3,
  Download,
  Edit,
  Trash2,
  Save,
  XCircle
} from "lucide-react";
import { Talhao } from "../../hooks/useTalhoes";

interface TalhaoPanelProps {
  talhao: Talhao | null;
  armadilhaRealCount?: number | null;
  onClose: () => void;
}

export function TalhaoPanel({ talhao, armadilhaRealCount, onClose }: TalhaoPanelProps) {
  const [activeTab, setActiveTab] = useState<"info" | "graficos" | "relatorios">("info");
  const [isEditing, setIsEditing] = useState(false);
  const [editedNome, setEditedNome] = useState("");
  const [editedStatus, setEditedStatus] = useState<"baixo" | "medio" | "alto" | "critico">("baixo");
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    if (talhao && isEditing) {
      setEditedNome(talhao.nome);
      setEditedStatus(talhao.status || "baixo");
    }
  }, [talhao, isEditing]);

  if (!talhao) return null;

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "baixo":
        return { bg: "#dcfce7", color: "#15803d", label: "Baixa Infestação", icon: "✅" };
      case "medio":
        return { bg: "#fef3c7", color: "#92400e", label: "Média Infestação", icon: "⚠️" };
      case "alto":
        return { bg: "#fed7aa", color: "#9a3412", label: "Alta Infestação", icon: "🔶" };
      case "critico":
        return { bg: "#fecaca", color: "#7f1d1d", label: "Crítica", icon: "🚨" };
      default:
        return { bg: "#e5e7eb", color: "#374151", label: "Sem Status", icon: "❓" };
    }
  };

  const statusInfo = getStatusColor(isEditing ? editedStatus : talhao.status);
  
  // 🔥 NOVO: Usa a contagem real se disponível, senão usa do banco
  const displayArmadilhaCount = armadilhaRealCount !== null && armadilhaRealCount !== undefined 
    ? armadilhaRealCount 
    : (talhao.armadilhasAtivas ?? 0);

  const handleEdit = async () => {
    if (!editedNome.trim()) {
      alert("⚠️ O nome não pode estar vazio!");
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`${API_URL}/talhoes/${talhao.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          nome: editedNome,
          status: editedStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar talhão");
      }

      alert("✅ Talhão atualizado com sucesso!");
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao editar talhão:", error);
      alert("❌ Erro ao atualizar talhão. Verifique o backend.");
    }
  };

  const handleDelete = async () => {
    const confirmacao = window.confirm(
      `⚠️ ATENÇÃO!\n\nTem certeza que deseja excluir o talhão "${talhao.nome}"?\n\nEsta ação não pode ser desfeita!`
    );

    if (!confirmacao) return;

    try {
      setIsDeleting(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`${API_URL}/talhoes/${talhao.id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar talhão");
      }

      alert("✅ Talhão excluído com sucesso!");
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Erro ao deletar talhão:", error);
      alert("❌ Erro ao excluir talhão. Verifique o backend.");
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "100%",
          maxWidth: "500px",
          height: "100vh",
          background: "white",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
          zIndex: 4000,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Header com Gradiente */}
        <div
          style={{
            background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
            padding: "2rem",
            color: "white",
            borderBottom: "4px solid #14532d",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "1rem",
            }}
          >
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <input
                  type="text"
                  value={editedNome}
                  onChange={(e) => setEditedNome(e.target.value)}
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    margin: 0,
                    marginBottom: "0.5rem",
                    background: "rgba(255,255,255,0.2)",
                    border: "2px solid rgba(255,255,255,0.5)",
                    borderRadius: "0.5rem",
                    padding: "0.5rem",
                    color: "white",
                    width: "100%",
                  }}
                  placeholder="Nome do talhão"
                />
              ) : (
                <h2
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    margin: 0,
                    marginBottom: "0.5rem",
                  }}
                >
                  {talhao.nome}
                </h2>
              )}
              <span
                style={{
                  fontSize: "0.85rem",
                  background: "rgba(255,255,255,0.2)",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                }}
              >
                ID: #{talhao.id}
              </span>
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
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Status Badge */}
          {isEditing ? (
            <select
              value={editedStatus}
              onChange={(e) => setEditedStatus(e.target.value as any)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.25rem",
                borderRadius: "0.75rem",
                fontWeight: 700,
                fontSize: "0.9rem",
                background: statusInfo.bg,
                color: statusInfo.color,
                border: `2px solid ${statusInfo.color}`,
                cursor: "pointer",
              }}
            >
              <option value="baixo">✅ Baixa Infestação</option>
              <option value="medio">⚠️ Média Infestação</option>
              <option value="alto">🔶 Alta Infestação</option>
              <option value="critico">🚨 Crítica</option>
            </select>
          ) : (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.25rem",
                borderRadius: "0.75rem",
                fontWeight: 700,
                fontSize: "0.9rem",
                background: statusInfo.bg,
                color: statusInfo.color,
                border: `2px solid ${statusInfo.color}`,
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{statusInfo.icon}</span>
              {statusInfo.label}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "2px solid #e5e7eb",
            background: "#f9fafb",
          }}
        >
          {[
            { id: "info", label: "Informações", icon: MapPin },
            { id: "graficos", label: "Gráficos", icon: BarChart3 },
            { id: "relatorios", label: "Relatórios", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: "1rem",
                  background: isActive ? "white" : "transparent",
                  border: "none",
                  borderBottom: isActive ? "3px solid #22c55e" : "3px solid transparent",
                  cursor: "pointer",
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? "#15803d" : "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  fontSize: "0.9rem",
                  transition: "all 0.2s",
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {/* Tab: Informações */}
          {activeTab === "info" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              {/* Estatísticas Principais - SEM DENSIDADE */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "1rem",
                }}
              >
                <StatCard
                  icon={<MapPin size={24} />}
                  label="Área Total"
                  value={`${talhao.area?.toFixed(2) ?? "N/A"} ha`}
                  color="#3b82f6"
                />
                <StatCard
                  icon={<Bug size={24} />}
                  label="Total Pragas"
                  value={talhao.totalPragas ?? 0}
                  color="#ef4444"
                />
                {/* 🔥 NOVO: Card de armadilhas com contagem real */}
                <StatCard
                  icon={<Target size={24} />}
                  label="Armadilhas"
                  value={displayArmadilhaCount}
                  color="#22c55e"
                  badge={armadilhaRealCount !== null && armadilhaRealCount !== undefined ? "" : undefined}
                />
              </div>

              {/* Coordenadas GPS */}
              <InfoSection title="📍 Coordenadas GPS">
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {talhao.center ? (
                    <>
                      <InfoRow label="Latitude" value={talhao.center[0].toFixed(6)} />
                      <InfoRow label="Longitude" value={talhao.center[1].toFixed(6)} />
                    </>
                  ) : (
                    <>
                      <InfoRow label="Latitude" value={"N/A"} />
                      <InfoRow label="Longitude" value={"N/A"} />
                    </>
                  )}
                  <InfoRow
                    label="Perímetro"
                    value={`${talhao.boundary?.length ?? 0} pontos`}
                  />
                </div>
              </InfoSection>

              {/* Histórico */}
              <InfoSection title="📅 Histórico">
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <InfoRow
                    label="Última Coleta"
                    value={
                      talhao.ultimaColeta
                        ? new Date(talhao.ultimaColeta).toLocaleDateString("pt-BR")
                        : "Sem registro"
                    }
                  />
                  <InfoRow
                    label="Status Atual"
                    value={statusInfo.label}
                    valueColor={statusInfo.color}
                  />
                </div>
              </InfoSection>

              {/* Pragas Detalhadas */}
              {talhao.pragas && talhao.pragas.length > 0 && (
                <InfoSection title="🐛 Pragas Detectadas">
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {talhao.pragas.map((praga, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.75rem",
                          background: "#f9fafb",
                          borderRadius: "0.5rem",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <span style={{ fontWeight: 600, color: "#374151" }}>
                          {praga.tipo}
                        </span>
                        <span
                          style={{
                            fontWeight: 700,
                            color: "#ef4444",
                            fontSize: "1.1rem",
                          }}
                        >
                          {praga.quantidade}
                        </span>
                      </div>
                    ))}
                  </div>
                </InfoSection>
              )}

              {/* Ações */}
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginTop: "1rem",
                  flexDirection: "column",
                }}
              >
                {isEditing ? (
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <ActionButton
                      icon={<Save size={18} />}
                      label="Salvar"
                      color="#22c55e"
                      onClick={handleEdit}
                      fullWidth
                    />
                    <ActionButton
                      icon={<XCircle size={18} />}
                      label="Cancelar"
                      color="#6b7280"
                      onClick={() => setIsEditing(false)}
                      fullWidth
                    />
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <ActionButton
                      icon={<Edit size={18} />}
                      label="Editar"
                      color="#3b82f6"
                      onClick={() => setIsEditing(true)}
                    />
                    <ActionButton
                      icon={<Trash2 size={18} />}
                      label={isDeleting ? "Excluindo..." : "Excluir"}
                      color="#ef4444"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Tab: Gráficos */}
          {activeTab === "graficos" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 2rem",
                  background: "#f9fafb",
                  borderRadius: "0.75rem",
                  border: "2px dashed #e5e7eb",
                }}
              >
                <BarChart3 size={64} style={{ margin: "0 auto 1rem", color: "#9ca3af" }} />
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
                  Gráficos Profissionais
                </h3>
                <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1rem" }}>
                  Em breve: gráficos de evolução de pragas, mapas de calor, análise temporal e muito mais!
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    textAlign: "left",
                    maxWidth: "350px",
                    margin: "0 auto",
                  }}
                >
                  <FeatureItem text="📊 Evolução temporal de infestação" />
                  <FeatureItem text="🗺️ Mapa de calor por área" />
                  <FeatureItem text="📈 Comparativo entre talhões" />
                  <FeatureItem text="🎯 Eficiência de armadilhas" />
                  <FeatureItem text="📉 Tendências e previsões" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab: Relatórios */}
          {activeTab === "relatorios" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 2rem",
                  background: "#f9fafb",
                  borderRadius: "0.75rem",
                  border: "2px dashed #e5e7eb",
                }}
              >
                <FileText size={64} style={{ margin: "0 auto 1rem", color: "#9ca3af" }} />
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
                  Relatórios Profissionais
                </h3>
                <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1rem" }}>
                  Sistema completo de relatórios exportáveis em PDF, Excel e dashboards interativos!
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    textAlign: "left",
                    maxWidth: "350px",
                    margin: "0 auto",
                  }}
                >
                  <FeatureItem text="📄 Relatório executivo em PDF" />
                  <FeatureItem text="📊 Exportar dados para Excel" />
                  <FeatureItem text="📸 Captura de tela do mapa" />
                  <FeatureItem text="📧 Envio automático por email" />
                  <FeatureItem text="🤖 Análise com IA (insights)" />
                </div>
              </div>

              <ActionButton
                icon={<Download size={18} />}
                label="Gerar Relatório Completo"
                color="#22c55e"
                fullWidth
                onClick={() => alert("Geração de relatório (em breve)")}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Componentes auxiliares
function StatCard({ icon, label, value, color, badge }: any) {
  return (
    <div
      style={{
        padding: "1rem",
        background: "white",
        borderRadius: "0.75rem",
        border: "2px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
      }}
    >
      {badge && (
        <div style={{
          position: "absolute",
          top: "0.5rem",
          right: "0.5rem",
          fontSize: "0.65rem",
          background: "#dcfce7",
          color: "#15803d",
          padding: "0.2rem 0.4rem",
          borderRadius: "0.25rem",
          fontWeight: 600,
        }}>
          {badge}
        </div>
      )}
      <div style={{ color }}>{icon}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function InfoSection({ title, children }: any) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "0.75rem",
        border: "2px solid #e5e7eb",
        padding: "1.25rem",
      }}
    >
      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1f2937", marginBottom: "1rem" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value, valueColor }: any) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.5rem 0",
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      <span style={{ fontSize: "0.875rem", color: "#6b7280", fontWeight: 600 }}>{label}:</span>
      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: valueColor || "#1f2937" }}>
        {value}
      </span>
    </div>
  );
}

function ActionButton({ icon, label, color, fullWidth, onClick, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        padding: "0.875rem 1.25rem",
        background: disabled ? "#9ca3af" : color,
        color: "white",
        border: "none",
        borderRadius: "0.625rem",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 700,
        fontSize: "0.9rem",
        width: fullWidth ? "100%" : "auto",
        transition: "transform 0.2s",
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function FeatureItem({ text }: any) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem",
        fontSize: "0.875rem",
        color: "#374151",
        fontWeight: 600,
      }}
    >
      {text}
    </div>
  );
}
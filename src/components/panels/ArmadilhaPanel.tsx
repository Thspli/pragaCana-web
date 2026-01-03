// src/components/panels/ArmadilhaPanel.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  MapPin, 
  Calendar, 
  Camera, 
  AlertCircle, 
  CheckCircle, 
  Edit, 
  Trash2, 
  Save, 
  XCircle, 
  Clock, 
  Navigation 
} from "lucide-react";

interface ArmadilhaPanelProps {
  armadilha: any | null;
  onClose: () => void;
}

export function ArmadilhaPanel({ armadilha, onClose }: ArmadilhaPanelProps) {
  const [activeTab, setActiveTab] = useState<"info" | "foto" | "historico">("info");
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    nome: armadilha?.nome || '',
    observacao: armadilha?.observacao || '',
    ausencia: armadilha?.ausencia || false,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  React.useEffect(() => {
    if (armadilha) {
      setEditedData({
        nome: armadilha.nome || '',
        observacao: armadilha.observacao || '',
        ausencia: armadilha.ausencia || false,
      });
    }
  }, [armadilha]);

  if (!armadilha) return null;

  const fotoUrl = armadilha.foto || null;
  const dataFoto = armadilha.dataFoto ? new Date(armadilha.dataFoto) : null;
  const criadoEm = armadilha.criadoEm ? new Date(armadilha.criadoEm) : null;

  const handleSave = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      const response = await fetch(`${API_URL}/armadilhas/${armadilha.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          nome: editedData.nome,
          observacao: editedData.observacao,
          ausencia: editedData.ausencia,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar armadilha");
      }

      alert("✅ Armadilha atualizada com sucesso!");
      setIsEditing(false);
      
      // Dispara evento para atualizar o mapa
      window.dispatchEvent(new CustomEvent('armadilha:changed', { 
        detail: { action: 'updated', armadilha: { ...armadilha, ...editedData } } 
      }));
      
      // Recarrega a página
      window.location.reload();
    } catch (error) {
      console.error("Erro ao editar armadilha:", error);
      alert("❌ Erro ao atualizar armadilha. Verifique o backend.");
    }
  };

  const handleDelete = async () => {
    const confirmacao = window.confirm(
      `⚠️ ATENÇÃO!\n\nTem certeza que deseja excluir a armadilha "${armadilha.nome}"?\n\nEsta ação não pode ser desfeita!`
    );

    if (!confirmacao) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      const response = await fetch(`${API_URL}/armadilhas/${armadilha.id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar armadilha");
      }

      alert("✅ Armadilha excluída com sucesso!");
      onClose();
      
      // Dispara evento para atualizar o mapa
      window.dispatchEvent(new CustomEvent('armadilha:changed', { 
        detail: { action: 'deleted', armadilha } 
      }));
      
      // Recarrega a página
      window.location.reload();
    } catch (error) {
      console.error("Erro ao deletar armadilha:", error);
      alert("❌ Erro ao excluir armadilha. Verifique o backend.");
    }
  };

  return (
    <AnimatePresence>
      {/* Overlay de fundo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 3999,
        }}
      />

      {/* Painel lateral */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '500px',
          height: '100vh',
          background: 'white',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
          zIndex: 4000,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header com gradiente */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            padding: '2rem',
            color: 'white',
            borderBottom: '4px solid #d97706',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Padrão de fundo decorativo */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem',
              position: 'relative',
            }}
          >
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.nome}
                  onChange={(e) => setEditedData({...editedData, nome: e.target.value})}
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    background: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.5)',
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                    color: 'white',
                    width: '100%',
                    marginBottom: '0.5rem',
                  }}
                  placeholder="Nome da armadilha"
                />
              ) : (
                <h2
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    margin: 0,
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  🪤 {armadilha.nome || 'Armadilha'}
                </h2>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.85rem',
                    background: 'rgba(255,255,255,0.2)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                  }}
                >
                  ID: #{armadilha.id}
                </span>
                <span
                  style={{
                    fontSize: '0.85rem',
                    background: 'rgba(255,255,255,0.2)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                  }}
                >
                  Talhão #{armadilha.talhaoId}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '0.625rem',
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '0.625rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Status Badge */}
          {isEditing ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editedData.ausencia}
                onChange={(e) => setEditedData({...editedData, ausencia: e.target.checked})}
                style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                Marcar como ausência
              </span>
            </label>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                background: armadilha.ausencia ? '#fee2e2' : '#dcfce7',
                color: armadilha.ausencia ? '#991b1b' : '#14532d',
                border: `2px solid ${armadilha.ausencia ? '#fca5a5' : '#86efac'}`,
              }}
            >
              {armadilha.ausencia ? (
                <>
                  <AlertCircle size={18} />
                  Ausência Detectada
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Presença Confirmada
                </>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '2px solid #e5e7eb',
            background: '#f9fafb',
          }}
        >
          {[
            { id: 'info', label: 'Informações', icon: MapPin },
            { id: 'foto', label: 'Foto', icon: Camera },
            { id: 'historico', label: 'Histórico', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: isActive ? 'white' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #f59e0b' : '3px solid transparent',
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#d97706' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {/* Tab: Informações */}
          {activeTab === 'info' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              {/* Observação */}
              <InfoSection title="📝 Observação">
                {isEditing ? (
                  <textarea
                    value={editedData.observacao}
                    onChange={(e) => setEditedData({...editedData, observacao: e.target.value})}
                    placeholder="Digite suas observações..."
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                ) : (
                  <p style={{ 
                    margin: 0, 
                    color: '#374151', 
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                  }}>
                    {armadilha.observacao || 'Nenhuma observação registrada.'}
                  </p>
                )}
              </InfoSection>

              {/* Coordenadas GPS */}
              <InfoSection title="📍 Coordenadas GPS">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <InfoRow 
                    icon={<Navigation size={18} style={{ color: '#f59e0b' }} />}
                    label="Latitude" 
                    value={armadilha.latitude?.toFixed(6) ?? 'N/A'} 
                  />
                  <InfoRow 
                    icon={<Navigation size={18} style={{ color: '#f59e0b' }} />}
                    label="Longitude" 
                    value={armadilha.longitude?.toFixed(6) ?? 'N/A'} 
                  />
                  <button
                    onClick={() => {
                      if (armadilha.latitude && armadilha.longitude) {
                        window.open(`https://www.google.com/maps?q=${armadilha.latitude},${armadilha.longitude}`, '_blank');
                      }
                    }}
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <MapPin size={18} />
                    Abrir no Google Maps
                  </button>
                </div>
              </InfoSection>

              {/* Datas */}
              <InfoSection title="📅 Registro">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dataFoto && (
                    <InfoRow 
                      icon={<Camera size={18} style={{ color: '#f59e0b' }} />}
                      label="Foto capturada" 
                      value={dataFoto.toLocaleString('pt-BR')} 
                    />
                  )}
                  {criadoEm && (
                    <InfoRow 
                      icon={<Clock size={18} style={{ color: '#f59e0b' }} />}
                      label="Armadilha criada" 
                      value={criadoEm.toLocaleString('pt-BR')} 
                    />
                  )}
                </div>
              </InfoSection>

              {/* Ações */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                {isEditing ? (
                  <>
                    <ActionButton
                      icon={<Save size={18} />}
                      label="Salvar"
                      color="#22c55e"
                      onClick={handleSave}
                      fullWidth
                    />
                    <ActionButton
                      icon={<XCircle size={18} />}
                      label="Cancelar"
                      color="#6b7280"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedData({
                          nome: armadilha.nome,
                          observacao: armadilha.observacao,
                          ausencia: armadilha.ausencia,
                        });
                      }}
                      fullWidth
                    />
                  </>
                ) : (
                  <>
                    <ActionButton
                      icon={<Edit size={18} />}
                      label="Editar"
                      color="#3b82f6"
                      onClick={() => setIsEditing(true)}
                      fullWidth
                    />
                    <ActionButton
                      icon={<Trash2 size={18} />}
                      label="Excluir"
                      color="#ef4444"
                      onClick={handleDelete}
                      fullWidth
                    />
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Tab: Foto */}
          {activeTab === 'foto' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              {fotoUrl ? (
                <>
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '400px',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      border: '2px solid #e5e7eb',
                      cursor: 'pointer',
                    }}
                    onClick={() => setPreviewImage(fotoUrl)}
                  >
                    <img
                      src={fotoUrl}
                      alt="Foto da armadilha"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                        padding: '2rem 1rem 1rem',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Camera size={18} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        Clique para ampliar
                      </span>
                    </div>
                  </div>
                  {dataFoto && (
                    <div
                      style={{
                        background: '#f0fdf4',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #bbf7d0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#15803d',
                      }}
                    >
                      <Calendar size={18} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        Capturada em: {dataFoto.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '400px',
                    background: '#f9fafb',
                    borderRadius: '0.75rem',
                    border: '2px dashed #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    color: '#9ca3af',
                  }}
                >
                  <Camera size={64} />
                  <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                    Nenhuma foto disponível
                  </p>
                  <p style={{ fontSize: '0.9rem', margin: 0 }}>
                    Aguardando captura de imagem
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab: Histórico */}
          {activeTab === 'historico' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 2rem',
                  background: '#f9fafb',
                  borderRadius: '0.75rem',
                  border: '2px dashed #e5e7eb',
                }}
              >
                <Clock size={64} style={{ margin: '0 auto 1rem', color: '#9ca3af' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  Histórico Completo
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Em breve: linha do tempo com todas as alterações e capturas!
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', maxWidth: '350px', margin: '0 auto' }}>
                  <FeatureItem text="📸 Histórico de fotos" />
                  <FeatureItem text="📝 Log de alterações" />
                  <FeatureItem text="📊 Estatísticas de captura" />
                  <FeatureItem text="🔔 Alertas e notificações" />
                </div>
              </div>
            </motion.div>
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
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5000,
            padding: '2rem',
            cursor: 'pointer',
          }}
        >
          <img
            src={previewImage}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: '0.75rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function InfoSection({ title, children }: any) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '0.75rem',
        border: '2px solid #e5e7eb',
        padding: '1.25rem',
      }}
    >
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1f2937', marginBottom: '1rem' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value, valueColor }: any) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        background: '#f9fafb',
        borderRadius: '0.5rem',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
        {icon}
        <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>{label}</span>
      </div>
      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: valueColor || '#1f2937' }}>
        {value}
      </span>
    </div>
  );
}

function ActionButton({ icon, label, color, fullWidth, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.875rem 1.25rem',
        background: color,
        color: 'white',
        border: 'none',
        borderRadius: '0.625rem',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '0.9rem',
        width: fullWidth ? '100%' : 'auto',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
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
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem',
        fontSize: '0.875rem',
        color: '#374151',
        fontWeight: 600,
      }}
    >
      {text}
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface NovoArmadilhaModalProps {
  open: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  talhaoId: number;
  talhaoNome?: string;
  onConfirm: (data: {
    nome: string;
    observacao?: string;
    dataFoto?: string | null;
    foto?: string | null;
    ausencia?: boolean;
    latitude: number;
    longitude: number;
    talhaoId: number;
    existingId?: number;
  }) => Promise<void> | void;
}

export function NovoArmadilhaModal({ open, onClose, lat, lng, talhaoId, talhaoNome, onConfirm }: NovoArmadilhaModalProps) {
  const [nome, setNome] = useState(`Armadilha`);
  const [observacao, setObservacao] = useState("");
  const [selectedFoto, setSelectedFoto] = useState<string | null>(null);
  const [ausencia, setAusencia] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fotosFromDb, setFotosFromDb] = useState<string[]>([]);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
  
  // 🔥 FIX: Reset state quando fecha o modal
  useEffect(() => {
    if (!open) {
      setNome("Armadilha");
      setObservacao("");
      setSelectedFoto(null);
      setAusencia(false);
      setFotosFromDb([]);
      setExistingId(null);
      setPreviewUrl(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    const fetchFotos = async () => {
      setPhotosLoading(true);
      try {
        const params = new URLSearchParams();
        if (talhaoId) params.set('talhaoId', String(talhaoId));
        
        console.log(`🔍 Buscando armadilhas do talhão ${talhaoId}...`);
        
        const res = await fetch(`${API_URL}/armadilhas?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          }
        });
        
        if (!res.ok) {
          console.warn(`⚠️ Erro ao buscar fotos: ${res.status}`);
          setFotosFromDb([]);
          return;
        }
        
        const items = await res.json();
        console.log(`✅ Encontradas ${items.length} armadilhas no talhão`);

        // 🔥 FIX: Remove duplicatas
        const uniqueItems = Array.from(
          new Map(items.map((i: any) => [i.id, i])).values()
        ) as any[];

        // Procura armadilhas próximas às coordenadas (distância pequena em graus)
        const threshold = 0.0008; // ~80m
        let nearest: any = null;
        
        for (const it of uniqueItems) {
          if (it.latitude == null || it.longitude == null) continue;
          const dLat = Math.abs(it.latitude - lat);
          const dLng = Math.abs(it.longitude - lng);
          if (dLat <= threshold && dLng <= threshold) {
            nearest = it;
            break;
          }
        }

        if (nearest) {
          console.log(`📍 Armadilha existente encontrada (ID: ${nearest.id})`);
          setExistingId(nearest.id);
          setNome(nearest.nome || "Armadilha");
          setObservacao(nearest.observacao || "");
          setAusencia(nearest.ausencia || false);
          
          if (nearest.foto) {
            setFotosFromDb([nearest.foto]);
            setSelectedFoto(nearest.foto);
          } else {
            setFotosFromDb([]);
            setSelectedFoto(null);
          }
        } else {
          console.log("✨ Nova armadilha (nenhuma próxima encontrada)");
          // Pega fotos de todas armadilhas do talhão
          const fotos = uniqueItems.filter((x: any) => x.foto).map((x: any) => x.foto);
          setFotosFromDb(fotos);
          setSelectedFoto(fotos[0] ?? null);
        }
      } catch (err) {
        console.error('❌ Erro ao buscar fotos:', err);
        setFotosFromDb([]);
        setSelectedFoto(null);
      } finally {
        setPhotosLoading(false);
      }
    };

    fetchFotos();
  }, [open, talhaoId, lat, lng, API_URL]);

  const handleSubmit = async () => {
    if (!nome.trim()) {
      alert('⚠️ Nome obrigatório');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        nome: nome.trim(),
        observacao: observacao || undefined,
        foto: selectedFoto || null,
        ausencia,
        latitude: lat,
        longitude: lng,
        talhaoId,
      };
      
      if (existingId) {
        payload.existingId = existingId;
        console.log(`📝 Atualizando armadilha existente (ID: ${existingId})`);
      } else {
        console.log(`✨ Criando nova armadilha`);
      }

      await onConfirm(payload);
      
      // 🔥 FIX: Fecha o modal ANTES de resetar o state
      onClose();
      
      console.log(`✅ Armadilha ${existingId ? 'atualizada' : 'criada'} com sucesso!`);
      
    } catch (err) {
      console.error('❌ Erro ao salvar armadilha:', err);
      alert('❌ Erro ao criar armadilha. Verifique o console.');
    } finally {
      setLoading(false);
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
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            padding: "1rem",
            backdropFilter: "blur(4px)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "0.75rem",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              width: "100%",
              maxWidth: "560px",
              border: "2px solid #e6fffa",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, color: "#065f46", fontSize: "1.25rem", fontWeight: 700 }}>
                {existingId ? "Editar Armadilha" : "Nova Armadilha"}
              </h3>
              <button onClick={onClose} style={{ background: "white", border: "2px solid #ecfccb", padding: "0.5rem", borderRadius: 8, cursor: "pointer", color: "#065f46" }}>
                <X size={18} />
              </button>
            </div>

            {existingId && (
              <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", padding: "0.75rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.875rem", color: "#92400e" }}>
                ⚠️ Você está editando uma armadilha existente (ID: {existingId})
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              <input 
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                placeholder="Nome da armadilha" 
                style={{ padding: "0.75rem", border: "2px solid #f0fdf4", borderRadius: 8 }} 
                disabled={loading}
              />
            </div>

            <textarea 
              value={observacao} 
              onChange={(e) => setObservacao(e.target.value)} 
              placeholder="Observação" 
              style={{ width: "100%", padding: "0.75rem", border: "2px solid #f0fdf4", borderRadius: 8, marginBottom: "0.75rem", minHeight: "80px" }}
              disabled={loading}
            />

            {/* Fotos vindas do banco */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, color: "#065f46" }}>
                Fotos disponíveis:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {photosLoading && (
                  <>
                    <div style={{ width: 120, height: 90, background: '#f3f4f6', borderRadius: 8, animation: "pulse 1.5s infinite" }} />
                    <div style={{ width: 120, height: 90, background: '#f3f4f6', borderRadius: 8, animation: "pulse 1.5s infinite" }} />
                  </>
                )}

                {!photosLoading && fotosFromDb.length === 0 && (
                  <div style={{ color: '#6b7280', display: 'flex', flexDirection: 'column', gap: 8, padding: "1rem", background: "#f9fafb", borderRadius: 8, width: "100%" }}>
                    <div style={{ fontSize: "0.875rem" }}>📷 Nenhuma foto encontrada neste talhão</div>
                    <button 
                      onClick={handleSubmit} 
                      disabled={loading}
                      style={{ 
                        padding: '8px 12px', 
                        background: '#059669', 
                        color: 'white', 
                        borderRadius: 6, 
                        border: 'none', 
                        cursor: loading ? 'not-allowed' : 'pointer', 
                        fontWeight: 700,
                        opacity: loading ? 0.6 : 1
                      }}
                    >
                      {loading ? "Salvando..." : "Salvar sem foto"}
                    </button>
                  </div>
                )}

                {fotosFromDb.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img
                      src={url}
                      alt={`foto-${idx}`}
                      style={{ 
                        width: 120, 
                        height: 90, 
                        objectFit: 'cover', 
                        borderRadius: 8, 
                        border: selectedFoto === url ? '3px solid #059669' : '1px solid #e6fffa', 
                        cursor: 'pointer',
                        transition: "all 0.2s"
                      }}
                      onClick={() => {
                        setSelectedFoto(url);
                        setPreviewUrl(url);
                      }}
                    />
                    {selectedFoto === url && (
                      <div style={{ 
                        position: 'absolute', 
                        top: 6, 
                        right: 6, 
                        background: '#059669', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: 6, 
                        fontSize: 11,
                        fontWeight: 700
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview overlay */}
            {previewUrl && (
              <div 
                onClick={() => setPreviewUrl(null)} 
                style={{ 
                  position: 'fixed', 
                  inset: 0, 
                  background: 'rgba(0,0,0,0.8)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  zIndex: 4000,
                  cursor: "pointer"
                }}
              >
                <img 
                  src={previewUrl} 
                  alt="preview" 
                  style={{ 
                    maxWidth: '90%', 
                    maxHeight: '80%', 
                    borderRadius: 8, 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.6)' 
                  }} 
                />
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <input 
                id="ausencia" 
                type="checkbox" 
                checked={ausencia} 
                onChange={(e) => setAusencia(e.target.checked)}
                disabled={loading}
                style={{ width: "18px", height: "18px", cursor: loading ? "not-allowed" : "pointer" }}
              />
              <label htmlFor="ausencia" style={{ fontSize: "0.95rem", color: "#374151", cursor: loading ? "not-allowed" : "pointer" }}>
                Marcar como ausência (sem pragas)
              </label>
            </div>

            <div style={{ background: "#ecfeff", padding: "0.75rem", borderRadius: 8, border: "1px solid #bffaf0", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.95rem", color: "#064e3b" }}>
                <strong>📍 Talhão:</strong> {talhaoNome ?? `#${talhaoId}`}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#065f46", marginTop: "0.25rem" }}>
                <strong>Coordenadas:</strong> {lat.toFixed(6)}, {lng.toFixed(6)}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button 
                onClick={onClose} 
                disabled={loading}
                style={{ 
                  padding: "0.75rem 1rem", 
                  borderRadius: 8, 
                  background: "white", 
                  border: "2px solid #fee2e2", 
                  color: "#b91c1c", 
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                style={{ 
                  padding: "0.75rem 1rem", 
                  borderRadius: 8, 
                  background: loading ? "#9ca3af" : "linear-gradient(135deg,#059669,#10b981)", 
                  color: "white", 
                  fontWeight: 700,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                {loading ? (
                  <>
                    <div style={{ 
                      width: 16, 
                      height: 16, 
                      border: "2px solid rgba(255,255,255,0.3)", 
                      borderTop: "2px solid white", 
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite"
                    }} />
                    Salvando...
                  </>
                ) : (
                  <>💾 {existingId ? "Atualizar" : "Salvar"} Armadilha</>
                )}
              </button>
            </div>

            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
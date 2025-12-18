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
  useEffect(() => {
    if (!open) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    const fetchFotos = async () => {
      setPhotosLoading(true);
      try {
        const params = new URLSearchParams();
        if (talhaoId) params.set('talhaoId', String(talhaoId));
        const res = await fetch(`${API_URL}/armadilhas?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          }
        });
        if (!res.ok) {
          setFotosFromDb([]);
          return;
        }
        const items = await res.json();

        // procura armadilhas próximas às coordenadas (distância pequena em graus)
        const threshold = 0.0008; // ~80m
        let nearest: any = null;
        for (const it of items) {
          if (it.latitude == null || it.longitude == null) continue;
          const dLat = Math.abs(it.latitude - lat);
          const dLng = Math.abs(it.longitude - lng);
          if (dLat <= threshold && dLng <= threshold) {
            nearest = it;
            break;
          }
        }

        if (nearest) {
          setExistingId(nearest.id);
          if (nearest.foto) {
            setFotosFromDb([nearest.foto]);
            setSelectedFoto(nearest.foto);
          } else {
            setFotosFromDb([]);
            setSelectedFoto(null);
          }
        } else {
          // pega fotos de todas armadilhas do talhão
          const fotos = items.filter((x: any) => x.foto).map((x: any) => x.foto);
          setFotosFromDb(fotos);
          setSelectedFoto(fotos[0] ?? null);
        }
      } catch (err) {
        console.error('Erro ao buscar fotos:', err);
        setFotosFromDb([]);
        setSelectedFoto(null);
      } finally {
        setPhotosLoading(false);
      }
    };

    fetchFotos();
  }, [open, talhaoId, lat, lng]);
  const handleSubmit = async () => {
    if (!nome.trim()) {
      alert('Nome obrigatório');
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
      if (existingId) payload.existingId = existingId;
      await onConfirm(payload);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao criar armadilha');
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
              <h3 style={{ margin: 0, color: "#065f46", fontSize: "1.25rem", fontWeight: 700 }}>Nova Armadilha</h3>
              <button onClick={onClose} style={{ background: "white", border: "2px solid #ecfccb", padding: "0.5rem", borderRadius: 8, cursor: "pointer", color: "#065f46" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da armadilha" style={{ padding: "0.75rem", border: "2px solid #f0fdf4", borderRadius: 8 }} />
            </div>

            <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Observação" style={{ width: "100%", padding: "0.75rem", border: "2px solid #f0fdf4", borderRadius: 8, marginBottom: "0.75rem" }} />

            {/* Fotos vindas do banco (mobile) */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Fotos disponíveis:</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {photosLoading && (
                  <>
                    <div style={{ width: 120, height: 90, background: '#f3f4f6', borderRadius: 8 }} />
                    <div style={{ width: 120, height: 90, background: '#f3f4f6', borderRadius: 8 }} />
                    <div style={{ width: 120, height: 90, background: '#f3f4f6', borderRadius: 8 }} />
                  </>
                )}

                {!photosLoading && fotosFromDb.length === 0 && (
                  <div style={{ color: '#6b7280', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div>Nenhuma foto encontrada</div>
                    <button onClick={handleSubmit} style={{ padding: '6px 10px', background: '#059669', color: 'white', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 700 }}>Salvar sem foto</button>
                  </div>
                )}

                {fotosFromDb.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img
                      src={url}
                      alt={`foto-${idx}`}
                      style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8, border: selectedFoto === url ? '3px solid #059669' : '1px solid #e6fffa', cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedFoto(url);
                        setPreviewUrl(url);
                      }}
                    />
                    {selectedFoto === url && (
                      <div style={{ position: 'absolute', top: 6, right: 6, background: '#059669', color: 'white', padding: '2px 6px', borderRadius: 6, fontSize: 12 }}>Selecionada</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview overlay */}
            {previewUrl && (
              <div onClick={() => setPreviewUrl(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
                <img src={previewUrl} alt="preview" style={{ maxWidth: '90%', maxHeight: '80%', borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }} />
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <input id="ausencia" type="checkbox" checked={ausencia} onChange={(e) => setAusencia(e.target.checked)} />
              <label htmlFor="ausencia">Ausência (sim)</label>
            </div>

            <div style={{ background: "#ecfeff", padding: "0.75rem", borderRadius: 8, border: "1px solid #bffaf0", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.95rem", color: "#064e3b" }}>Talhão: <strong>{talhaoNome ?? talhaoId}</strong></div>
              <div style={{ fontSize: "0.85rem", color: "#065f46" }}>Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button onClick={onClose} style={{ padding: "0.75rem 1rem", borderRadius: 8, background: "white", border: "2px solid #fee2e2", color: "#b91c1c", fontWeight: 600 }}>Cancelar</button>
              <button onClick={handleSubmit} disabled={loading} style={{ padding: "0.75rem 1rem", borderRadius: 8, background: "linear-gradient(135deg,#059669,#10b981)", color: "white", fontWeight: 700 }}>{loading ? 'Salvando...' : '💾 Salvar Armadilha'}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

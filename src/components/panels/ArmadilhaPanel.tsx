"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock } from "lucide-react";

interface ArmadilhaPanelProps {
  armadilha: any | null;
  onClose: () => void;
}

export function ArmadilhaPanel({ armadilha, onClose }: ArmadilhaPanelProps) {
  if (!armadilha) return null;

  const fotoUrl = armadilha.foto || null;
  const dataFoto = armadilha.dataFoto ? new Date(armadilha.dataFoto) : null;
  const criadoEm = armadilha.criadoEm ? new Date(armadilha.criadoEm) : null;

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
        <div style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eef2f7" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>{armadilha.nome || 'Armadilha'}</h3>
            <div style={{ fontSize: 12, color: '#6b7280' }}>ID: #{armadilha.id} • Talhão #{armadilha.talhaoId}</div>
          </div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, border: 'none', background: '#f8fafc', cursor: 'pointer' }}>
            <X />
          </button>
        </div>

        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {fotoUrl ? (
            <img src={fotoUrl} alt="foto-armadilha" style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: 8 }} />
          ) : (
            <div style={{ width: '100%', height: 200, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
              Sem foto
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#374151' }}>
            <Clock size={16} />
            <div style={{ fontSize: 13 }}>
              {dataFoto ? `Foto: ${dataFoto.toLocaleString('pt-BR')}` : criadoEm ? `Registrada em: ${criadoEm.toLocaleString('pt-BR')}` : 'Sem data disponível'}
            </div>
          </div>

          <div style={{ fontSize: 14, color: '#111827' }}>{armadilha.observacao || '—'}</div>

          <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#374151' }}>
            <div style={{ background: '#ecfeff', padding: '6px 10px', borderRadius: 8, border: '1px solid #bffaf0' }}>Ausência: <strong style={{ marginLeft: 6 }}>{armadilha.ausencia ? 'Sim' : 'Não'}</strong></div>
            <div style={{ background: '#fff7ed', padding: '6px 10px', borderRadius: 8, border: '1px solid #fed7aa' }}>Coordenadas: <strong style={{ marginLeft: 6 }}>{armadilha.latitude?.toFixed(6) ?? 'N/A'}, {armadilha.longitude?.toFixed(6) ?? 'N/A'}</strong></div>
          </div>

        </div>

      </motion.div>
    </AnimatePresence>
  );
}

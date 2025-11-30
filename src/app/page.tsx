"use client";

import React, { useState } from "react";
import { Header } from "../components/panels/Header";
import { useTalhoes, Talhao } from "../hooks/useTalhoes";
import { TalhaoMap, TempPolygon } from "../components/map/TalhaoMap";
import { NovoTalhaoModal } from "../components/modals/NovoTalhaoModal";

export default function Page() {
  const { talhoes, loading, error, getTotals, createTalhao } = useTalhoes();
  const totals = getTotals();

  const [tempPolygon, setTempPolygon] = useState<TempPolygon | null>(null);
  const [showNewTalhaoModal, setShowNewTalhaoModal] = useState(false);
  const [newTalhaoNome, setNewTalhaoNome] = useState("");
  const [newTalhaoStatus, setNewTalhaoStatus] =
    useState<"baixo" | "medio" | "alto" | "critico">("baixo");

  const [talhaoSelecionado, setTalhaoSelecionado] = useState<Talhao | null>(null);

  const handlePolygonCreated = (poly: TempPolygon) => {
    setTempPolygon(poly);
    setNewTalhaoNome(`Talhão ${talhoes.length + 1}`);
    setNewTalhaoStatus("baixo");
    setShowNewTalhaoModal(true);
  };

  const handleConfirmNovoTalhao = async () => {
    if (!tempPolygon || !newTalhaoNome.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    try {
      await createTalhao({
        nome: newTalhaoNome,
        area: tempPolygon.area,
        status: newTalhaoStatus,
        center: tempPolygon.center,
        boundary: tempPolygon.boundary,
      });

      setShowNewTalhaoModal(false);
      setTempPolygon(null);
      setNewTalhaoNome("");
      setNewTalhaoStatus("baixo");
      alert("✅ Talhão criado com sucesso!");
    } catch (err) {
      alert("❌ Erro ao salvar talhão. Verifique o backend.");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f0fdf4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #e2e8f0",
            borderTop: "4px solid #22c55e",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ color: "#15803d", fontWeight: 600 }}>
          Carregando talhões da API...
        </p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4" }}>
      {error && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#fef3c7",
            color: "#92400e",
            padding: "1rem 1.25rem",
            borderRadius: "0.5rem",
            border: "1px solid #f59e0b",
            zIndex: 3000,
            maxWidth: "400px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <Header
        totals={totals}
        onNovoTalhao={() => {
          // o botão do header pode futuramente acionar o mesmo fluxo do desenho,
          // por enquanto só loga
          console.log("Novo talhão via header");
        }}
        onListaTalhoes={() => {
          console.log("Abrir lista de talhões (a implementar)");
        }}
        onMinhaLocalizacao={() => {
          console.log("Centralizar usuário (a implementar)");
        }}
        onCreateTestTalhao={() => {
          console.log("Botão de teste API (opcional)");
        }}
      />

      <TalhaoMap
        talhoes={talhoes}
        onPolygonCreated={handlePolygonCreated}
        onTalhaoClick={(t) => setTalhaoSelecionado(t)}
      />

      <NovoTalhaoModal
        open={showNewTalhaoModal}
        onClose={() => setShowNewTalhaoModal(false)}
        tempPolygon={tempPolygon}
        nome={newTalhaoNome}
        status={newTalhaoStatus}
        onChangeNome={setNewTalhaoNome}
        onChangeStatus={setNewTalhaoStatus}
        onConfirm={handleConfirmNovoTalhao}
      />

      {/* talhaoSelecionado ainda não está sendo exibido em painel;
          isso entrará depois no TalhaoPanel.tsx */}
    </div>
  );
}

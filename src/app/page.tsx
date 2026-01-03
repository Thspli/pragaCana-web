"use client";

import React, { useState } from "react";
import { Header } from "../components/panels/Header"; // Header atualizado com glassmorphism
import { useTalhoes, Talhao } from "../hooks/useTalhoes";
import { TalhaoMap, TempPolygon } from "../components/map/TalhaoMap";
import { useArmadilhas } from "../hooks/useArmadilhas";
import { NovoTalhaoModal } from "../components/modals/NovoTalhaoModal";
import { NovoArmadilhaModal } from "../components/modals/NovoArmadilhaModal";
import { ListaTalhoesModal } from "../components/modals/ListaTalhoesModal";
import { ListaArmadilhasModal } from "../components/modals/ListaArmadilhasModal";
import { TutorialTalhao } from "../components/tutorial/TutorialTalhao";
import { TalhaoPanel } from "../components/panels/TalhaoPanel";
import { ArmadilhaPanel } from "../components/panels/ArmadilhaPanel";

export default function Page() {
  const { talhoes, loading, error, getTotals, createTalhao } = useTalhoes();
  const totals = getTotals();

  const [tempPolygon, setTempPolygon] = useState<TempPolygon | null>(null);
  const [showNewTalhaoModal, setShowNewTalhaoModal] = useState(false);
  const [newTalhaoNome, setNewTalhaoNome] = useState("");
  const [newTalhaoStatus, setNewTalhaoStatus] =
    useState<"baixo" | "medio" | "alto" | "critico">("baixo");

  const [talhaoSelecionado, setTalhaoSelecionado] = useState<Talhao | null>(null);
  const [armadilhaSelecionada, setArmadilhaSelecionada] = useState<any | null>(null);
  const [showListaTalhoes, setShowListaTalhoes] = useState(false);
  const [showListaArmadilhas, setShowListaArmadilhas] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const { createArmadilha, updateArmadilha } = useArmadilhas();

  const [armadilhaModalOpen, setArmadilhaModalOpen] = useState(false);
  const [pendingArmadilha, setPendingArmadilha] = useState<{ lat: number; lng: number; talhaoId?: number | null } | null>(null);
  
  const [armadilhaRealCount, setArmadilhaRealCount] = useState<number | null>(null);
  const [totalArmadilhasGlobal, setTotalArmadilhasGlobal] = useState<number>(0);

  React.useEffect(() => {
    const tutorialCompleted = localStorage.getItem('tutorial_talhao_completed');
    if (!tutorialCompleted && !loading && talhoes.length === 0) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, talhoes]);

  React.useEffect(() => {
    if (talhoes.length > 0) {
      fetchTotalArmadilhas();
    }
  }, [talhoes]);

  React.useEffect(() => {
    const handleArmadilhaChange = () => {
      console.log('🔄 Detectada mudança em armadilha, atualizando contador...');
      fetchTotalArmadilhas();
    };

    window.addEventListener('armadilha:changed', handleArmadilhaChange);
    
    return () => {
      window.removeEventListener('armadilha:changed', handleArmadilhaChange);
    };
  }, [talhoes]);

  const fetchTotalArmadilhas = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      let totalCount = 0;

      for (const talhao of talhoes) {
        const params = new URLSearchParams();
        params.set('talhaoId', String(talhao.id));

        const res = await fetch(`${API_URL}/armadilhas?${params.toString()}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        if (res.ok) {
          const armadilhas = await res.json();
          
          const uniqueArmadilhas = Array.from(
            new Map(armadilhas.map((a: any) => [a.id, a])).values()
          );
          
          const armadilhasValidas = uniqueArmadilhas.filter(
            (a: any) => a.latitude != null && a.longitude != null
          );

          totalCount += armadilhasValidas.length;
        }
      }

      console.log(`🎯 Total de armadilhas: ${totalCount}`);
      setTotalArmadilhasGlobal(totalCount);
      
    } catch (err) {
      console.error('❌ Erro ao buscar total de armadilhas:', err);
    }
  };

  const handleAddArmadilha = async (lat: number, lng: number, talhaoId?: number | null) => {
    if (!talhaoId) {
      alert('⚠️ A armadilha precisa estar dentro de um talhão. Clique dentro de um talhão para adicionar.');
      return;
    }

    setPendingArmadilha({ lat, lng, talhaoId });
    setArmadilhaModalOpen(true);
  };

  const handleConfirmArmadilha = async (data: any) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      if (data.existingId) {
        const id = data.existingId;
        const payload = { 
          nome: data.nome, 
          observacao: data.observacao, 
          foto: data.foto, 
          dataFoto: data.dataFoto, 
          ausencia: data.ausencia 
        };
        
        console.log(`📝 Atualizando armadilha ${id}...`);
        const updated = await updateArmadilha(id, payload, token);
        
        window.dispatchEvent(new CustomEvent('armadilha:changed', { 
          detail: { 
            action: 'updated', 
            armadilha: updated,
            talhaoId: data.talhaoId 
          } 
        }));
        
        console.log(`✅ Armadilha ${id} atualizada!`);
        
      } else {
        console.log(`✨ Criando nova armadilha...`);
        const created = await createArmadilha(data, token);
        
        window.dispatchEvent(new CustomEvent('armadilha:changed', { 
          detail: { 
            action: 'created', 
            armadilha: created,
            talhaoId: data.talhaoId 
          } 
        }));
        
        console.log(`✅ Nova armadilha criada (ID: ${created.id})!`);
      }
      
      if (talhaoSelecionado && talhaoSelecionado.id === data.talhaoId) {
        await fetchRealArmadilhaCount(data.talhaoId);
      }
      
      await fetchTotalArmadilhas();
      
      alert('✅ Armadilha salva com sucesso!');
      setArmadilhaModalOpen(false);
      setPendingArmadilha(null);
      
    } catch (err) {
      console.error('❌ Erro ao salvar armadilha:', err);
      alert('❌ Erro ao criar/atualizar armadilha. Verifique o console.');
    }
  };

  const fetchRealArmadilhaCount = async (talhaoId: number) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      const params = new URLSearchParams();
      params.set('talhaoId', String(talhaoId));
      
      console.log(`🔍 [PANEL] Buscando armadilhas do talhão ${talhaoId}...`);
      
      const res = await fetch(`${API_URL}/armadilhas?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      if (!res.ok) {
        console.warn(`⚠️ [PANEL] Erro ao buscar contagem de armadilhas: ${res.status}`);
        return;
      }
      
      const armadilhas = await res.json();
      
      const uniqueArmadilhas = Array.from(
        new Map(armadilhas.map((a: any) => [a.id, a])).values()
      );
      
      const armadilhasComCoordenadas = uniqueArmadilhas.filter(
        (a: any) => a.latitude != null && a.longitude != null
      );
      
      setArmadilhaRealCount(armadilhasComCoordenadas.length);
      
    } catch (err) {
      console.error('❌ [PANEL] Erro ao buscar contagem de armadilhas:', err);
    }
  };

  const handleTalhaoClick = (talhao: Talhao) => {
    setTalhaoSelecionado(talhao);
    setArmadilhaRealCount(null);
    fetchRealArmadilhaCount(talhao.id);
  };

  const handlePolygonCreated = (poly: TempPolygon) => {
    setTempPolygon(poly);
    setNewTalhaoNome(`Talhão ${talhoes.length + 1}`);
    setNewTalhaoStatus("baixo");
    setShowNewTalhaoModal(true);
  };

  const handleConfirmNovoTalhao = async () => {
    if (!tempPolygon || !newTalhaoNome.trim()) {
      alert("⚠️ Nome é obrigatório");
      return;
    }

    try {
      console.log("💾 Criando talhão:", newTalhaoNome);
      
      await createTalhao({
        nome: newTalhaoNome,
        area: tempPolygon.area,
        status: newTalhaoStatus,
        center: tempPolygon.center,
        boundary: tempPolygon.boundary,
      });

      console.log("✅ Talhão criado! Recarregando página...");

      setShowNewTalhaoModal(false);
      setTempPolygon(null);
      setNewTalhaoNome("");
      setNewTalhaoStatus("baixo");

      window.location.reload();

    } catch (err) {
      console.error("❌ Erro ao salvar:", err);
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

      {/* Header com Glassmorphism */}
      <Header
        totals={{
          ...totals,
          totalArmadilhas: totalArmadilhasGlobal
        }}
        onNovoTalhao={() => {
          console.log("Novo talhão via header");
        }}
        onListaTalhoes={() => {
          setShowListaTalhoes(true);
        }}
        onListaArmadilhas={() => {
          setShowListaArmadilhas(true);
        }}
        onMinhaLocalizacao={() => {
          console.log("Centralizar usuário");
        }}
        onCreateTestTalhao={() => {
          console.log("Botão de teste API");
        }}
      />

      <TalhaoMap
        talhoes={talhoes}
        onPolygonCreated={handlePolygonCreated}
        onTalhaoClick={handleTalhaoClick}
        onArmadilhaClick={(a) => setArmadilhaSelecionada(a)}
        onAddArmadilha={handleAddArmadilha}
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

      <ListaTalhoesModal
        open={showListaTalhoes}
        onClose={() => setShowListaTalhoes(false)}
        talhoes={talhoes}
        onTalhaoClick={(talhao) => {
          handleTalhaoClick(talhao);
          setShowListaTalhoes(false);
        }}
        onNovoTalhao={() => {
          setShowListaTalhoes(false);
          setShowTutorial(true);
        }}
      />

      <ListaArmadilhasModal
        open={showListaArmadilhas}
        onClose={() => setShowListaArmadilhas(false)}
        talhoes={talhoes}
        onArmadilhaClick={(armadilha) => {
          setArmadilhaSelecionada(armadilha);
          setShowListaArmadilhas(false);
        }}
      />

      <NovoArmadilhaModal
        open={armadilhaModalOpen}
        onClose={() => {
          setArmadilhaModalOpen(false);
          setPendingArmadilha(null);
        }}
        lat={pendingArmadilha?.lat ?? 0}
        lng={pendingArmadilha?.lng ?? 0}
        talhaoId={pendingArmadilha?.talhaoId ?? 0}
        talhaoNome={talhoes.find(t => t.id === pendingArmadilha?.talhaoId)?.nome}
        onConfirm={handleConfirmArmadilha}
      />

      <TalhaoPanel
        talhao={talhaoSelecionado}
        armadilhaRealCount={armadilhaRealCount}
        onClose={() => {
          setTalhaoSelecionado(null);
          setArmadilhaRealCount(null);
        }}
      />
      
      <ArmadilhaPanel 
        armadilha={armadilhaSelecionada} 
        onClose={() => setArmadilhaSelecionada(null)} 
      />

      <TutorialTalhao
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={() => {
          console.log("✅ Tutorial concluído!");
        }}
      />
    </div>
  );
}
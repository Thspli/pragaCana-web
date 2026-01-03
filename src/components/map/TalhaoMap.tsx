"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Talhao } from "../../hooks/useTalhoes";

export interface TempPolygon {
  boundary: [number, number][];
  center: [number, number];
  area: number;
}

interface TalhaoMapProps {
  talhoes: Talhao[];
  onPolygonCreated: (poly: TempPolygon) => void;
  onTalhaoClick?: (talhao: Talhao) => void;
  onAddArmadilha?: (lat: number, lng: number, talhaoId?: number | null) => void;
  onArmadilhaClick?: (armadilha: any) => void;
}

export function TalhaoMap({
  talhoes,
  onPolygonCreated,
  onTalhaoClick,
  onAddArmadilha,
  onArmadilhaClick,
}: TalhaoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [addingArmadilha, setAddingArmadilha] = useState(false);
  const armadilhaLayersRef = useRef<Map<number, any[]>>(new Map());
  const [armadilhaCountsByTalhao, setArmadilhaCountsByTalhao] = useState<Map<number, number>>(new Map());

  // 1. Carrega scripts Leaflet
  useEffect(() => {
    if ((window as any).L) {
      setScriptsLoaded(true);
      return;
    }

    const leafletCss = document.createElement("link");
    leafletCss.rel = "stylesheet";
    leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    leafletCss.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    leafletCss.crossOrigin = "";
    document.head.appendChild(leafletCss);

    const drawCss = document.createElement("link");
    drawCss.rel = "stylesheet";
    drawCss.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css";
    document.head.appendChild(drawCss);

    const leafletJs = document.createElement("script");
    leafletJs.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    leafletJs.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    leafletJs.crossOrigin = "";

    leafletJs.onload = () => {
      const drawJs = document.createElement("script");
      drawJs.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js";
      drawJs.onload = () => {
        console.log("✅ Scripts carregados");
        setScriptsLoaded(true);
      };
      document.body.appendChild(drawJs);
    };

    document.body.appendChild(leafletJs);

    if (!document.getElementById('armadilha-marker-styles')) {
      const style = document.createElement('style');
      style.id = 'armadilha-marker-styles';
      style.innerHTML = `
        .armadilha-bounce { animation: armadilha-pop 600ms cubic-bezier(.2,.8,.2,1); transform-origin: center bottom; }
        @keyframes armadilha-pop { 
          0% { transform: scale(0) translateY(20px); opacity: 0 } 
          60% { transform: scale(1.15) translateY(-5px); opacity: 1 } 
          100% { transform: scale(1) translateY(0); opacity: 1 } 
        }
        .armadilha-marker-container {
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
          transition: all 0.2s ease;
        }
        .armadilha-marker-container:hover {
          filter: drop-shadow(0 6px 12px rgba(0,0,0,0.4));
          transform: translateY(-2px);
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      if (document.head.contains(leafletCss)) document.head.removeChild(leafletCss);
      if (document.head.contains(drawCss)) document.head.removeChild(drawCss);
    };
  }, []);

  // 2. Inicializa mapa
  useEffect(() => {
    if (!scriptsLoaded || !mapContainerRef.current || mapInstanceRef.current) {
      return;
    }

    const L = (window as any).L;
    console.log("🗺️ Inicializando mapa...");

    if (mapInstanceRef.current?.map) {
      mapInstanceRef.current.map.remove();
    }

    const map = L.map(mapContainerRef.current, {
      center: [-22.028, -50.044],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri',
      maxZoom: 19,
    }).addTo(map);

    const drawnItems = L.featureGroup().addTo(map);

    mapInstanceRef.current = {
      map,
      drawnItems,
      layers: [],
    };

    setTimeout(() => {
      map.invalidateSize();
      setMapInitialized(true);
      console.log("✅ Mapa inicializado!");
    }, 500);

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [scriptsLoaded]);

  // 3. Sistema de desenho
  useEffect(() => {
    if (!mapInitialized || !mapInstanceRef.current) return;

    const L = (window as any).L;
    const { map, drawnItems } = mapInstanceRef.current;

    const drawControl = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polygon: drawing,
        rectangle: false,
        polyline: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItems,
        edit: false,
        remove: false,
      },
    });

    map.addControl(drawControl);

    const onCreated = (e: any) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);

      const latlngs = layer.getLatLngs()[0];
      const boundary: [number, number][] = latlngs.map((p: any) => [p.lat, p.lng]);
      const centerLatLng = layer.getBounds().getCenter();
      const center: [number, number] = [centerLatLng.lat, centerLatLng.lng];
      const area = L.GeometryUtil.geodesicArea(latlngs) / 10000;

      onPolygonCreated({ boundary, center, area });
      setDrawing(false);
      drawnItems.clearLayers();
    };

    map.on(L.Draw.Event.CREATED, onCreated);

    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.removeControl(drawControl);
    };
  }, [mapInitialized, drawing, onPolygonCreated]);

  // 3.b Modo adicionar armadilha
  useEffect(() => {
    if (!mapInitialized || !mapInstanceRef.current) return;

    const { map } = mapInstanceRef.current;

    const pointInPolygon = (point: [number, number], vs: [number, number][]) => {
      const x = point[0], y = point[1];
      let inside = false;
      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1];
        const xj = vs[j][0], yj = vs[j][1];
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi + 0.0) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    };

    const onMapClick = (e: any) => {
      const lat = e.latlng?.lat;
      const lng = e.latlng?.lng;
      if (lat == null || lng == null) return;

      let foundTalhaoId: number | null = null;
      try {
        for (const t of talhoes) {
          if (!t.boundary || !t.boundary.length) continue;
          if (pointInPolygon([lat, lng], t.boundary)) {
            foundTalhaoId = t.id;
            break;
          }
        }
      } catch (err) {
        console.warn('Erro ao detectar talhão:', err);
      }

      if (typeof onAddArmadilha === 'function') {
        onAddArmadilha(lat, lng, foundTalhaoId);
      }

      setAddingArmadilha(false);
    };

    if (addingArmadilha) {
      map.getContainer().style.cursor = 'crosshair';
      map.on('click', onMapClick);
    }

    return () => {
      try {
        map.getContainer().style.cursor = '';
        map.off('click', onMapClick);
      } catch (e) {}
    };
  }, [mapInitialized, addingArmadilha, talhoes, onAddArmadilha]);

  // 🔥 FIX: Função melhorada para buscar e renderizar armadilhas
  const fetchAndRenderArmadilhasForTalhao = useCallback(async (talhaoId: number) => {
    if (!mapInstanceRef.current) return 0;
    
    const { map } = mapInstanceRef.current;
    const L = (window as any).L;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      // Remove armadilhas antigas DESTE talhão específico
      const oldLayers = armadilhaLayersRef.current.get(talhaoId) || [];
      oldLayers.forEach((layer) => {
        try {
          map.removeLayer(layer);
        } catch (e) {}
      });
      armadilhaLayersRef.current.set(talhaoId, []);

      // Busca armadilhas
      const params = new URLSearchParams();
      params.set('talhaoId', String(talhaoId));
      
      console.log(`🔍 Buscando armadilhas do talhão ${talhaoId}...`);
      
      const res = await fetch(`${API_URL}/armadilhas?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) {
        console.warn(`⚠️ Erro ao buscar armadilhas do talhão ${talhaoId}: ${res.status}`);
        return 0;
      }

      const armadilhas = await res.json();
      
      console.log(`📦 [MAPA] Resposta bruta da API:`, armadilhas);
      console.log(`📦 [MAPA] Total retornado: ${armadilhas.length}`);
      
      // Log de IDs antes de remover duplicatas
      const ids = armadilhas.map((a: any) => a.id);
      console.log(`🔢 [MAPA] IDs retornados:`, ids);
      
      // Remove duplicatas baseado no ID
      const uniqueArmadilhas = Array.from(
        new Map(armadilhas.map((a: any) => [a.id, a])).values()
      );
      
      // Log de IDs depois de remover duplicatas
      const uniqueIds = uniqueArmadilhas.map((a: any) => a.id);
      console.log(`🔢 [MAPA] IDs únicos:`, uniqueIds);
      console.log(`✅ [MAPA] Contagem final: ${uniqueArmadilhas.length} armadilhas no talhão ${talhaoId}`);

      const newLayers: any[] = [];

      uniqueArmadilhas.forEach((a: any) => {
        if (a.latitude == null || a.longitude == null) {
          console.warn(`⚠️ Armadilha ${a.id} sem coordenadas`);
          return;
        }

        const isAusencia = a.ausencia || false;
        
        // 🔥 NOVO: Ícone profissional de armadilha
        const svg = `
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="armadilha-marker-container">
            <!-- Sombra -->
            <ellipse cx="16" cy="37" rx="8" ry="2" fill="rgba(0,0,0,0.2)"/>
            
            <!-- Pin principal -->
            <path d="M16 2C10.477 2 6 6.477 6 12C6 18.5 16 36 16 36C16 36 26 18.5 26 12C26 6.477 21.523 2 16 2Z" 
                  fill="${isAusencia ? '#94a3b8' : '#f59e0b'}" 
                  stroke="#ffffff" 
                  stroke-width="2"/>
            
            <!-- Ícone de armadilha -->
            ${isAusencia ? `
              <!-- X para ausência -->
              <line x1="12" y1="10" x2="20" y2="18" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="20" y1="10" x2="12" y2="18" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
            ` : `
              <!-- Armadilha ativa -->
              <rect x="12" y="9" width="8" height="10" rx="1" fill="#ffffff" opacity="0.9"/>
              <circle cx="16" cy="14" r="2.5" fill="#f59e0b"/>
              <line x1="16" y1="8" x2="16" y2="11" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
            `}
          </svg>
        `;
        
        const aIcon = L.divIcon({
          html: svg,
          className: 'armadilha-icon',
          iconSize: [32, 40],
          iconAnchor: [16, 40],
          popupAnchor: [0, -40]
        });

        const amarker = L.marker([a.latitude, a.longitude], { icon: aIcon }).addTo(map);

        const popupHtml = `
          <div style="min-width:180px;font-family:system-ui,-apple-system,sans-serif">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <div style="width:10px;height:10px;border-radius:50%;background:${isAusencia ? '#94a3b8' : '#f59e0b'}"></div>
              <strong style="font-size:14px;color:#111">${a.nome || 'Armadilha'}</strong>
            </div>
            ${a.observacao ? `<div style="font-size:12px;color:#444;margin-bottom:6px">${a.observacao}</div>` : ''}
            <div style="font-size:11px;color:#666;display:flex;flex-direction:column;gap:4px;padding-top:6px;border-top:1px solid #e5e7eb">
              <div><strong>Status:</strong> ${isAusencia ? '❌ Ausência' : '✅ Ativa'}</div>
              <div><strong>ID:</strong> #${a.id}</div>
            </div>
          </div>
        `;
        
        amarker.bindPopup(popupHtml);

        if (typeof onArmadilhaClick === 'function') {
          try {
            amarker.on('click', () => onArmadilhaClick(a));
          } catch (e) {
            try {
              (amarker as any).openPopup();
            } catch (err) {}
          }
        }

        try {
          const el = (amarker as any).getElement && (amarker as any).getElement();
          if (el && el.classList) {
            el.classList.add('armadilha-bounce');
          }
        } catch (e) {}

        newLayers.push(amarker);
      });

      // Salva as novas layers
      armadilhaLayersRef.current.set(talhaoId, newLayers);
      
      console.log(`✅ ${newLayers.length} armadilhas renderizadas para talhão ${talhaoId}`);
      
      // 🔥 FIX: Retorna a contagem real de armadilhas
      return newLayers.length;

    } catch (err) {
      console.error(`❌ Erro ao buscar armadilhas para talhão ${talhaoId}:`, err);
      return 0;
    }
  }, [onArmadilhaClick]);

  // 4. Renderiza talhões
  useEffect(() => {
    if (!mapInitialized || !mapInstanceRef.current) {
      console.log("⏳ Aguardando mapa inicializar para renderizar talhões...");
      return;
    }

    console.log("🎨 RENDERIZANDO", talhoes.length, "TALHÕES");

    const L = (window as any).L;
    const { map, layers } = mapInstanceRef.current;

    // Limpa TODAS as layers antigas
    layers.forEach((layer: any) => {
      try {
        map.removeLayer(layer);
      } catch (e) {}
    });
    mapInstanceRef.current.layers = [];

    if (!talhoes.length) {
      console.log("📭 Nenhum talhão para renderizar");
      return;
    }

    // 🔥 FIX: Primeiro busca a contagem real de armadilhas
    (async () => {
      const newCounts = new Map<number, number>();
      
      for (const talhao of talhoes) {
        const count = await fetchAndRenderArmadilhasForTalhao(talhao.id);
        newCounts.set(talhao.id, count);
      }
      
      setArmadilhaCountsByTalhao(newCounts);
      
      // Agora renderiza os talhões com as contagens corretas
      talhoes.forEach((talhao) => {
        if (!talhao.boundary?.length || !talhao.center) return;

        const color = getStatusColor(talhao.status);
        const realCount = newCounts.get(talhao.id) || 0;

        // Polígono
        const polygon = L.polygon(talhao.boundary, {
          color,
          fillColor: color,
          fillOpacity: 0.4,
          weight: 2,
        }).addTo(map);

        if (onTalhaoClick) {
          polygon.on("click", () => onTalhaoClick(talhao));
        }

        mapInstanceRef.current.layers.push(polygon);

        // 🔥 FIX: Label com contador REAL de armadilhas
        const labelHtml = `
          <div style="border:2px solid ${color};background:rgba(255,255,255,0.95);padding:6px 10px;border-radius:6px;font-size:11px;font-weight:600;text-align:center;box-shadow:0 2px 4px rgba(0,0,0,0.12);white-space:nowrap;">
            <div style="color:#15803d;font-weight:700;">${talhao.nome}</div>
            <div style="display:flex;gap:8px;align-items:center;justify-content:center;font-size:11px;color:#374151;margin-top:4px;">
              <div>${talhao.totalPragas ?? 0} pragas</div>
              <div style="background:#ecfeff;border:1px solid #bffaf0;padding:3px 8px;border-radius:999px;font-weight:700;color:#065f46;font-size:11px;">${realCount} 🪤</div>
            </div>
          </div>
        `;

        const labelIcon = L.divIcon({
          className: 'talhao-label',
          html: labelHtml,
          iconSize: [120, 45],
          iconAnchor: [60, 22],
        });

        const marker = L.marker(talhao.center, {
          icon: labelIcon,
          interactive: false,
        }).addTo(map);

        mapInstanceRef.current.layers.push(marker);
      });

      // Centraliza no último talhão
      const ultimo = talhoes[talhoes.length - 1];
      const hasValidCenter = (() => {
        if (!ultimo || !ultimo.center) return false;
        const c: any = ultimo.center;
        if (Array.isArray(c)) return c.length === 2 && c[0] != null && c[1] != null;
        return c && typeof c.lat === 'number' && typeof c.lng === 'number';
      })();

      if (hasValidCenter) {
        try {
          map.setView(ultimo.center, 17, { animate: true });
        } catch (e) {
          console.warn('Não foi possível centralizar no talhão:', e);
        }
      }
    })();

  }, [mapInitialized, talhoes, onTalhaoClick, fetchAndRenderArmadilhasForTalhao]);

  // Event listener para mudanças em armadilhas
  useEffect(() => {
    const onArmadilhaChanged = async (ev: any) => {
      console.log("🔄 Evento armadilha:changed recebido", ev?.detail);
      
      const detail = ev?.detail;
      if (!detail) {
        console.log("🔄 Atualizando todas as armadilhas...");
        const newCounts = new Map<number, number>();
        for (const t of talhoes) {
          const count = await fetchAndRenderArmadilhasForTalhao(t.id);
          newCounts.set(t.id, count);
        }
        setArmadilhaCountsByTalhao(newCounts);
        return;
      }

      const talhaoId = detail.armadilha?.talhaoId || detail.talhaoId;
      if (talhaoId) {
        console.log(`🔄 Atualizando armadilhas do talhão ${talhaoId}...`);
        const count = await fetchAndRenderArmadilhasForTalhao(talhaoId);
        setArmadilhaCountsByTalhao(prev => {
          const newMap = new Map(prev);
          newMap.set(talhaoId, count);
          return newMap;
        });
      }
    };

    window.addEventListener('armadilha:changed', onArmadilhaChanged as any);

    return () => {
      window.removeEventListener('armadilha:changed', onArmadilhaChanged as any);
    };
  }, [talhoes, fetchAndRenderArmadilhasForTalhao]);

  // Cleanup
  useEffect(() => {
    return () => {
      armadilhaLayersRef.current.forEach((layers) => {
        layers.forEach((l) => {
          try {
            mapInstanceRef.current?.map?.removeLayer(l);
          } catch (e) {}
        });
      });
      armadilhaLayersRef.current.clear();
    };
  }, []);

  const getStatusColor = (status: string | null): string => {
    switch (status) {
      case "baixo": return "#22c55e";
      case "medio": return "#eab308";
      case "alto": return "#f97316";
      case "critico": return "#dc2626";
      default: return "#6b7280";
    }
  };

  return (
    <div style={{ padding: "1.5rem", paddingTop: "1rem" }}>
      <div style={{ 
        marginBottom: "0.75rem", 
        display: "flex", 
        alignItems: "center", 
        gap: "1rem" 
      }}>
        <button
          onClick={() => setDrawing(!drawing)}
          disabled={!mapInitialized}
          style={{
            background: !mapInitialized ? "#94a3b8" : drawing ? "#dc2626" : "#22c55e",
            color: "white",
            fontWeight: 600,
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: mapInitialized ? "pointer" : "not-allowed",
            opacity: mapInitialized ? 1 : 0.6,
          }}
        >
          {!mapInitialized
            ? "⏳ Carregando..."
            : drawing
            ? "❌ Cancelar desenho"
            : "✏️ Novo talhão (desenhar)"}
        </button>
        <button
          onClick={() => setAddingArmadilha(!addingArmadilha)}
          disabled={!mapInitialized}
          style={{
            background: !mapInitialized ? "#94a3b8" : addingArmadilha ? "#ef4444" : "#10b981",
            color: "white",
            fontWeight: 600,
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: mapInitialized ? "pointer" : "not-allowed",
            opacity: mapInitialized ? 1 : 0.6,
          }}
        >
          {!mapInitialized
            ? "⏳"
            : addingArmadilha
            ? "❌ Cancelar armadilha"
            : "➕ Adicionar armadilha"}
        </button>
        
        {mapInitialized && talhoes.length > 0 && (
          <span style={{ color: "#15803d", fontWeight: 600 }}>
            📍 {talhoes.length} talhão(ões) no mapa
          </span>
        )}
      </div>

      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "520px",
          border: "2px solid #22c55e",
          borderRadius: "0.75rem",
          overflow: "hidden",
          background: "#d4d4d4",
          position: "relative",
        }}
      >
        {!mapInitialized && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              background: "white",
              padding: "1.5rem 2rem",
              borderRadius: "0.75rem",
              boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #e2e8f0",
                borderTop: "4px solid #22c55e",
                borderRadius: "50%",
                margin: "0 auto 1rem",
                animation: "spin 1s linear infinite",
              }}
            />
            <p style={{ color: "#15803d", fontWeight: 600, margin: 0 }}>
              🛰️ Carregando mapa satélite...
            </p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}
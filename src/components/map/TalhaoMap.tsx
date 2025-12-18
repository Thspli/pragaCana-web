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

  // 1. Carrega scripts Leaflet
  useEffect(() => {
    // Verifica se já foi carregado
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

    // inject simple CSS for marker animation (only once)
    if (!document.getElementById('armadilha-marker-styles')) {
      const style = document.createElement('style');
      style.id = 'armadilha-marker-styles';
      style.innerHTML = `
        .armadilha-bounce { animation: armadilha-pop 600ms cubic-bezier(.2,.8,.2,1); transform-origin: center; }
        @keyframes armadilha-pop { 0% { transform: scale(0); opacity: 0 } 60% { transform: scale(1.15); opacity: 1 } 100% { transform: scale(1); opacity: 1 } }
      `;
      document.head.appendChild(style);
    }

    return () => {
      if (document.head.contains(leafletCss)) document.head.removeChild(leafletCss);
      if (document.head.contains(drawCss)) document.head.removeChild(drawCss);
    };
  }, []);

  // 2. Inicializa mapa (SÓ DEPOIS DOS SCRIPTS)
  useEffect(() => {
    if (!scriptsLoaded || !mapContainerRef.current || mapInstanceRef.current) {
      return;
    }

    const L = (window as any).L;
    console.log("🗺️ Inicializando mapa...");

    // CRÍTICO: Remove qualquer instância anterior
    if (mapInstanceRef.current?.map) {
      mapInstanceRef.current.map.remove();
    }

    const map = L.map(mapContainerRef.current, {
      center: [-22.028, -50.044],
      zoom: 15,
      zoomControl: true,
    });

    // Camada de satélite
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri',
      maxZoom: 19,
    }).addTo(map);

    const drawnItems = L.featureGroup().addTo(map);

    mapInstanceRef.current = {
      map,
      drawnItems,
      layers: [],
      armadilhaLayers: [],
    };

    // Aguarda tiles carregarem
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

  // 3.b Modo adicionar armadilha: captura clique único no mapa e detecta talhão
  useEffect(() => {
    if (!mapInitialized || !mapInstanceRef.current) return;

    const { map } = mapInstanceRef.current;

    const pointInPolygon = (point: [number, number], vs: [number, number][]) => {
      // ray-casting algorithm for point in polygon
      const x = point[0], y = point[1];
      let inside = false;
      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1];
        const xj = vs[j][0], yj = vs[j][1];

        const intersect = ((yi > y) !== (yj > y)) &&
          (x < (xj - xi) * (y - yi) / (yj - yi + 0.0) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    };

    const onMapClick = (e: any) => {
      const lat = e.latlng?.lat;
      const lng = e.latlng?.lng;
      if (lat == null || lng == null) return;

      // detecta se o ponto está dentro de algum talhão
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
  }, [mapInitialized, addingArmadilha]);

  // 4. Renderiza talhões (FORÇA ATUALIZAÇÃO QUANDO MUDA)
  useEffect(() => {
    if (!mapInitialized || !mapInstanceRef.current) {
      console.log("⏳ Aguardando mapa inicializar para renderizar talhões...");
      return;
    }

    console.log("🎨 RENDERIZANDO", talhoes.length, "TALHÕES - FORÇANDO ATUALIZAÇÃO");

    const L = (window as any).L;
    const { map, layers } = mapInstanceRef.current;

    // Limpa TODAS as layers antigas
    layers.forEach((layer: any) => {
      try {
        map.removeLayer(layer);
      } catch (e) {
        console.warn("Layer já removida:", e);
      }
    });
    mapInstanceRef.current.layers = [];

    // Se não tem talhões, retorna
    if (!talhoes.length) {
      console.log("📭 Nenhum talhão para renderizar");
      return;
    }

    talhoes.forEach((talhao) => {
      if (!talhao.boundary?.length || !talhao.center) return;

      const color = getStatusColor(talhao.status);

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

      // Label (inclui contador de armadilhas)
      const labelHtml = `
        <div style="border:2px solid ${color};background:rgba(255,255,255,0.95);padding:6px 10px;border-radius:6px;font-size:11px;font-weight:600;text-align:center;box-shadow:0 2px 4px rgba(0,0,0,0.12);white-space:nowrap;">
          <div style="color:#15803d;font-weight:700;">${talhao.nome}</div>
          <div style="display:flex;gap:8px;align-items:center;justify-content:center;font-size:11px;color:#374151;margin-top:4px;">
            <div>${talhao.totalPragas ?? 0} pragas</div>
            <div style="background:#ecfeff;border:1px solid #bffaf0;padding:3px 8px;border-radius:999px;font-weight:700;color:#065f46;font-size:11px;">${talhao.armadilhasAtivas ?? 0} 🪤</div>
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

    const fetchAndRenderArmadilhasForTalhao = async (talhaoId: number) => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

        // remove existing armadilha layers for this talhao
        mapInstanceRef.current.armadilhaLayers = mapInstanceRef.current.armadilhaLayers || [];
        mapInstanceRef.current.armadilhaLayers.forEach((l: any) => {
          try { map.removeLayer(l); } catch (e) {}
        });
        mapInstanceRef.current.armadilhaLayers = [];

        const params = new URLSearchParams();
        params.set('talhaoId', String(talhaoId));
        const res = await fetch(`${API_URL}/armadilhas?${params.toString()}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) return;
        const armadilhas = await res.json();
        armadilhas.forEach((a: any) => {
          if (a.latitude == null || a.longitude == null) return;
          const color = a.ausencia ? '#9ca3af' : '#f59e0b';
          const svg = ` <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C12 2 18 7 18 11C18 15 14.4183 20.1213 12 22C9.58172 20.1213 6 15 6 11C6 7 12 2 12 2Z" fill="${color}" stroke="#064e3b" stroke-width="0.5"/><circle cx="12" cy="10" r="2" fill="#064e3b"/></svg>`;
          const aIcon = L.divIcon({ html: svg, className: 'armadilha-icon', iconSize: [28, 28], iconAnchor: [14, 28] });
          const amarker = L.marker([a.latitude, a.longitude], { icon: aIcon }).addTo(map);
          const popupHtml = `<div style="min-width:160px"><strong>${a.nome || 'Armadilha'}</strong><div style="font-size:12px;color:#444">${a.observacao || ''}</div><div style=\"font-size:12px;color:#666;margin-top:6px\">Ausência: ${a.ausencia ? 'Sim' : 'Não'}</div></div>`;
          amarker.bindPopup(popupHtml);
          // quando clicada, abre o painel de armadilha se o handler foi fornecido
          if (typeof onArmadilhaClick === 'function') {
            try {
              amarker.on('click', () => onArmadilhaClick(a));
            } catch (e) {
              // fallback para abrir popup
              try { (amarker as any).openPopup(); } catch (err) {}
            }
          }
          // add bounce animation class to marker element
          try {
            const el = (amarker as any).getElement && (amarker as any).getElement();
            if (el && el.classList) {
              el.classList.add('armadilha-bounce');
            }
          } catch (e) {}
          mapInstanceRef.current.armadilhaLayers.push(amarker);
        });
      } catch (err) {
        console.warn('Erro ao buscar armadilhas para talhão', talhaoId, err);
      }
    };

    // render all talhões armadilhas
    (async () => {
      try {
        for (const t of talhoes) {
          await fetchAndRenderArmadilhasForTalhao(t.id);
        }
      } catch (err) {
        console.warn('Erro ao renderizar armadilhas:', err);
      }
    })();

    // real-time update: escuta evento global
    const onArmadilhaChanged = (ev: any) => {
      const detail = ev?.detail;
      if (!detail) {
        // refresh all
        talhoes.forEach((t) => fetchAndRenderArmadilhasForTalhao(t.id));
        return;
      }
      const talhaoId = detail.armadilha?.talhaoId || detail.talhaoId;
      if (talhaoId) fetchAndRenderArmadilhasForTalhao(talhaoId);
      else talhoes.forEach((t) => fetchAndRenderArmadilhasForTalhao(t.id));
    };
    window.addEventListener('armadilha:changed', onArmadilhaChanged as any);

    // Centraliza no último talhão (verifica centro válido)
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
  }, [mapInitialized, talhoes, onTalhaoClick]);

  // cleanup for armadilha event listener when component unmounts
  useEffect(() => {
    return () => {
      try {
        (mapInstanceRef.current?.armadilhaLayers || []).forEach((l: any) => {
          try { mapInstanceRef.current.map.removeLayer(l); } catch (e) {}
        });
      } catch (e) {}
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
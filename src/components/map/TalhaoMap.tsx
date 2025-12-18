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
}

export function TalhaoMap({
  talhoes,
  onPolygonCreated,
  onTalhaoClick,
}: TalhaoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [drawing, setDrawing] = useState(false);

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

      // Label
      const labelHtml = `
        <div style="
          border: 2px solid ${color};
          background: rgba(255,255,255,0.95);
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          white-space: nowrap;
        ">
          <div style="color: #15803d; font-weight: 700;">${talhao.nome}</div>
          <div style="color: #666; font-size: 10px;">${talhao.totalPragas ?? 0} pragas</div>
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

    // Centraliza no último talhão (verifica centro válido)
    const ultimo = talhoes[talhoes.length - 1];
    const hasValidCenter = (() => {
      if (!ultimo || !ultimo.center) return false;
      const c = ultimo.center;
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
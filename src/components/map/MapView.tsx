"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useTalhoes } from "../../hooks/useTalhoes";
import { useMap } from "../../hooks/useMap";

interface MapViewProps {
  mapRef: React.RefObject<HTMLDivElement>;
  drawingMode: boolean;
  showSatellite: boolean;
  isFullscreen: boolean;
  onTalhaoSelect: (talhao: any) => void;
}

export function MapView({
  mapRef,
  drawingMode,
  showSatellite,
  isFullscreen,
  onTalhaoSelect,
}: MapViewProps) {
  const { mapLoaded, userLocation, renderTalhoesOnMap, centerOnUser } = useMap(mapRef, showSatellite);
  const { talhoes } = useTalhoes();

  // Render talhões no mapa (SIMPLIFICADO)
  useEffect(() => {
    if (talhoes.length > 0 && renderTalhoesOnMap) {
      renderTalhoesOnMap(talhoes, onTalhaoSelect);
    }
  }, [talhoes, renderTalhoesOnMap, onTalhaoSelect]);

  // Carrega Leaflet Draw CSS/JS
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{ 
      flex: 1, 
      padding: isFullscreen ? 0 : "1.5rem" 
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          background: "white", 
          borderRadius: "0.75rem", 
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)", 
          height: "100%", 
          overflow: "hidden", 
          border: "2px solid #bbf7d0", 
          position: "relative" 
        }}
      >
        <div 
          ref={mapRef} 
          style={{ width: "100%", height: "100%", minHeight: "400px" }} 
        />

        {/* Map Controls */}
        <div style={{ 
          position: "absolute", 
          top: "1rem", 
          right: "1rem", 
          display: "flex", 
          flexDirection: "column", 
          gap: "0.5rem", 
          zIndex: 1000 
        }}>
          <button 
            style={{ 
              background: drawingMode ? "#dc2626" : "#22c55e", 
              color: "white", 
              fontWeight: 600, 
              padding: "0.5rem 1rem", 
              borderRadius: "0.5rem", 
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)", 
              border: `2px solid ${drawingMode ? "#ef4444" : "#86efac"}`, 
              cursor: "pointer", 
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            {drawingMode ? "❌ Cancelar" : "✏️ Novo Talhão"}
          </button>

          {userLocation && (
            <button 
              onClick={centerOnUser}
              style={{ 
                background: "#3b82f6", 
                color: "white", 
                fontWeight: 600, 
                padding: "0.5rem 1rem", 
                borderRadius: "0.5rem", 
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)", 
                border: "2px solid #2563eb", 
                cursor: "pointer", 
                fontSize: "0.875rem", 
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              📍 Minha Localização
            </button>
          )}
        </div>

        {/* Total Pragas */}
        <div style={{ 
          position: "absolute", 
          bottom: "1rem", 
          left: "1rem", 
          background: "white", 
          padding: "0.5rem 1rem", 
          borderRadius: "0.5rem", 
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)", 
          border: "2px solid #86efac", 
          zIndex: 1000 
        }}>
          <span style={{ color: "#15803d", fontWeight: "bold" }}>
            Total de Pragas: {talhoes.reduce((acc, t) => acc + (t.totalPragas || 0), 0)}
          </span>
        </div>

        {/* Legend */}
        <div style={{ 
          position: "absolute", 
          bottom: "1rem", 
          right: "1rem", 
          background: "white", 
          padding: "0.75rem", 
          borderRadius: "0.5rem", 
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)", 
          border: "2px solid #86efac", 
          zIndex: 1000, 
          display: "flex", 
          gap: "0.75rem", 
          flexWrap: "wrap" 
        }}>
          {[
            { color: "#22c55e", label: "Baixa" },
            { color: "#eab308", label: "Média" },
            { color: "#f97316", label: "Alta" },
            { color: "#dc2626", label: "Crítica" },
          ].map((item, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "1rem", height: "1rem", borderRadius: "50%", background: item.color, border: "2px solid white" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#15803d" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

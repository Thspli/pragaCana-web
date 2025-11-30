"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [drawing, setDrawing] = useState(false);

  // Carrega Leaflet + Draw
  useEffect(() => {
    const leafletCss = document.createElement("link");
    leafletCss.rel = "stylesheet";
    leafletCss.href =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
    document.head.appendChild(leafletCss);

    const drawCss = document.createElement("link");
    drawCss.rel = "stylesheet";
    drawCss.href =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css";
    document.head.appendChild(drawCss);

    const leafletJs = document.createElement("script");
    leafletJs.src =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
    leafletJs.async = true;

    leafletJs.onload = () => {
      const drawJs = document.createElement("script");
      drawJs.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js";
      drawJs.async = true;
      drawJs.onload = () => setMapReady(true);
      document.body.appendChild(drawJs);
    };

    document.body.appendChild(leafletJs);

    return () => {
      [leafletCss, drawCss].forEach(
        (el) => document.head.contains(el) && document.head.removeChild(el)
      );
      document.body.contains(leafletJs) && document.body.removeChild(leafletJs);
    };
  }, []);

  // Cria mapa base (satélite Esri)
  useEffect(() => {
    if (!mapReady || !mapRef.current || !(window as any).L?.tileLayer) return;
    if (mapInstanceRef.current) return; // já existe

    const L = (window as any).L;
    const map = L.map(mapRef.current).setView([-22.028, -50.044], 15);

    const satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
        maxZoom: 19,
      }
    );

    satellite.addTo(map);

    mapInstanceRef.current = {
      map,
      layers: [] as any[],
    };

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapReady]);

  // Desenho com Leaflet.Draw
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !(window as any).L?.Draw) return;

    const L = (window as any).L;
    const { map } = mapInstanceRef.current;

    const drawnItems = L.featureGroup().addTo(map);

    const drawControl = new L.Control.Draw({
      position: "topleft",
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
        remove: true,
      },
    });

    map.addControl(drawControl);

    const onCreated = (e: any) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);

      const latlngs = layer.getLatLngs()[0] as any;
      const boundary: [number, number][] = latlngs.map((p: any) => [
        p.lat,
        p.lng,
      ]);

      const centerLatLng = layer.getBounds().getCenter();
      const center: [number, number] = [centerLatLng.lat, centerLatLng.lng];

      const area = (window as any).L.GeometryUtil.geodesicArea(latlngs) / 10000;

      onPolygonCreated({ boundary, center, area });
      setDrawing(false);
    };

    map.on(L.Draw.Event.CREATED, onCreated);

    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  }, [mapReady, drawing, onPolygonCreated]);

  // Renderiza talhões existentes no mapa
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).L) {
      console.log("🔴 TalhaoMap: sem mapa ainda, não desenha");
      return;
    }
    if (!talhoes || talhoes.length === 0) {
      console.log("🟡 TalhaoMap: talhoes vazio, nada pra desenhar");
      return;
    }

    console.log("🟢 REDESENHANDO TALHOES NO MAPA:", talhoes.length);

    const L = (window as any).L;
    const { map, layers } = mapInstanceRef.current;

    // limpa layers antigos
    layers.forEach((layer: any) => map.removeLayer(layer));
    mapInstanceRef.current.layers = [];

    const talhoesGroup = L.featureGroup().addTo(map);

    talhoes.forEach((talhao) => {
      if (!talhao.boundary?.length || !talhao.center) return;

      console.log(
        "🧩 Desenhando talhão:",
        talhao.nome,
        talhao.center,
        talhao.boundary.length
      );

      const color = getStatusColor(talhao.status);

      const polygon = L.polygon(talhao.boundary, {
        color,
        fillColor: color,
        fillOpacity: 0.4,
        weight: 2,
      }).addTo(map);

      if (onTalhaoClick) {
        polygon.on("click", () => onTalhaoClick(talhao));
      }

      talhoesGroup.addLayer(polygon);
      mapInstanceRef.current.layers.push(polygon);

      const labelIcon = L.divIcon({
        className: "talhao-label",
        html: `<div style="border-color: ${color}; background: rgba(255,255,255,0.9); padding: 4px 8px; border-radius: 6px; border: 2px solid ${color}; font-size: 11px;">
                 <strong>${talhao.nome}</strong><br/>
                 <span>${talhao.totalPragas ?? 0} pragas</span>
               </div>`,
        iconSize: [120, 40],
        iconAnchor: [60, 20],
      });

      const marker = L.marker(talhao.center, {
        icon: labelIcon,
        interactive: false,
        bubblingMouseEvents: false,
      }).addTo(map);

      mapInstanceRef.current.layers.push(marker);
    });

    // Centraliza SEMPRE no último talhão
    const ultimo = talhoes[talhoes.length - 1];
    if (ultimo && ultimo.center) {
      console.log("🎯 Centralizando no talhão:", ultimo.nome, ultimo.center);
      map.setView(ultimo.center, 18);
    }
  }, [talhoes, onTalhaoClick]);

  const getStatusColor = (status: string | null): string => {
    switch (status) {
      case "baixo":
        return "#22c55e";
      case "medio":
        return "#eab308";
      case "alto":
        return "#f97316";
      case "critico":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  return (
    <div style={{ padding: "1.5rem", paddingTop: "1rem" }}>
      <div style={{ marginBottom: "0.75rem" }}>
        <button
          onClick={() => setDrawing((prev) => !prev)}
          style={{
            background: drawing ? "#dc2626" : "#22c55e",
            color: "white",
            fontWeight: 600,
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          {drawing ? "❌ Cancelar desenho" : "✏️ Novo talhão (desenhar)"}
        </button>
      </div>

      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "520px",
          border: "2px solid #22c55e",
          borderRadius: "0.75rem",
          overflow: "hidden",
        }}
      />
    </div>
  );
}

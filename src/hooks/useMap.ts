"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface MapInstance {
  map: any;
  osmLayer: any;
  satelliteLayer: any;
  layers: any[];
}

export function useMap(
  mapRef: React.RefObject<HTMLDivElement | null>,
  showSatellite: boolean
) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const mapInstanceRef = useRef<MapInstance | null>(null);

  // Carrega Leaflet + cria mapa
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const L = (window as any).L;
    if (!L) return;

    const centerCoords: [number, number] = [-22.028, -50.044];
    const map = L.map(mapRef.current, { zoomControl: true }).setView(centerCoords, 14);

    const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    });

    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "© Esri", maxZoom: 19 }
    );

    if (showSatellite) {
      satelliteLayer.addTo(map);
    } else {
      osmLayer.addTo(map);
    }

    mapInstanceRef.current = { map, osmLayer, satelliteLayer, layers: [] };
    setMapLoaded(true);

    // Geolocalização
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation([position.coords.latitude, position.coords.longitude]),
        (error) => console.log("Geolocalização não disponível", error)
      );
    }

    return () => {
      map.remove();
    };
  }, [mapRef, mapLoaded, showSatellite]);

  // Carrega Leaflet CSS/JS
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
    script.async = true;
    script.onload = () => {
      // Trigger map creation
      setTimeout(() => setMapLoaded(true), 100);
    };
    document.body.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const centerOnUser = useCallback(() => {
    if (userLocation && mapInstanceRef.current?.map) {
      mapInstanceRef.current.map.setView(userLocation, 16);
    }
  }, [userLocation]);

  const getMapInstance = () => mapInstanceRef.current;

  const renderTalhoesOnMap = useCallback((talhoes: any[], onTalhaoSelect: (talhao: any) => void) => {
    const mapInstance = getMapInstance();
    if (!mapInstance?.map) return;

    const L = (window as any).L;
    const { map, layers = [] } = mapInstance;

    // Limpa layers antigas
    layers.forEach((layer: any) => map.removeLayer(layer));
    mapInstance.layers = [];

    const talhoesGroup = L.featureGroup().addTo(map);

    talhoes.forEach((talhao: any) => {
      if (!talhao.boundary?.length || !talhao.center) return;
      
      const color = getStatusColor(talhao.status);
      const polygon = L.polygon(talhao.boundary, {
        color,
        fillColor: color,
        fillOpacity: 0.4,
        weight: 2,
      }).addTo(map);

      polygon.on("click", () => onTalhaoSelect(talhao));
      mapInstance.layers.push(polygon);

      const labelIcon = L.divIcon({
        className: "talhao-label",
        html: `<div style="border-color: ${color};"><strong>${talhao.nome}</strong><span>${talhao.totalPragas ?? 0} Pragas</span></div>`,
        iconSize: [120, 40],
        iconAnchor: [60, 20],
      });

      const marker = L.marker(talhao.center, {
        icon: labelIcon,
        interactive: false,
        bubblingMouseEvents: false,
      }).addTo(map);
      mapInstance.layers.push(marker);
    });

    if (talhoesGroup.getLayers().length > 0) {
      const bounds = talhoesGroup.getBounds();
      map.fitBounds(bounds.pad(0.1));
    }

    // User location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: "user-marker",
        html: `<div style="position: relative;"><div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      const userMarker = L.marker(userLocation, { icon: userIcon }).addTo(map);
      userMarker.bindPopup('<div style="text-align: center;"><strong>📍 Você está aqui</strong></div>');
      mapInstance.layers.push(userMarker);
    }
  }, [userLocation]);

  const getStatusColor = (status: string | null): string => {
    switch (status) {
      case "baixo": return "#22c55e";
      case "medio": return "#eab308";
      case "alto": return "#f97316";
      case "critico": return "#dc2626";
      default: return "#6b7280";
    }
  };

  return {
    mapLoaded,
    userLocation,
    mapInstanceRef,
    centerOnUser,
    getMapInstance,
    renderTalhoesOnMap,
  };
}

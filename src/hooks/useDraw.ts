"use client";

import { useState, useEffect } from "react";
import { useMap } from "./useMap";

export interface TempPolygon {
  boundary: [number, number][];
  center: [number, number];
  area: number;
}

export function useDraw(mapRef: React.RefObject<HTMLDivElement>) {
  const [drawingMode, setDrawingMode] = useState(false);
  const [tempPolygon, setTempPolygon] = useState<TempPolygon | null>(null);
  const { mapLoaded, getMapInstance } = useMap(mapRef, false);

  const toggleDrawingMode = () => {
    setDrawingMode(!drawingMode);
    setTempPolygon(null);
  };

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !(window as any).L?.Draw) return;

    const L = (window as any).L;
    const mapInstance = getMapInstance();
    if (!mapInstance?.map) return;

    const { map } = mapInstance;
    const drawnItems = L.featureGroup().addTo(map);

    const drawControl = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polygon: drawingMode,
        rectangle: false,
        polyline: false,
        circle: false,
        marker: false,
        circlemarker: false
      },
      edit: {
        featureGroup: drawnItems,
        edit: false,
        remove: true
      }
    });
    map.addControl(drawControl);

    // Evento de desenho completo
    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      
      const latlngs = layer.getLatLngs()[0] as any;
      const boundary: [number, number][] = latlngs.map((p: any) => [p.lat, p.lng]);
      const center = layer.getBounds().getCenter().toArray() as [number, number];
      const area = L.GeometryUtil.geodesicArea(latlngs) / 10000; // m² → ha

      setTempPolygon({ boundary, center, area });
      setDrawingMode(false);
    });

    return () => {
      map.removeControl(drawControl);
      map.off(L.Draw.Event.CREATED);
    };
  }, [mapLoaded, drawingMode]);

  return {
    drawingMode,
    tempPolygon,
    toggleDrawingMode,
    setTempPolygon,
  };
}

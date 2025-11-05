"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Bug,
  Calendar,
  Target,
  X,
  Navigation,
  Maximize2,
  Minimize2,
  FileText,
} from "lucide-react";

interface Talhao {
  id: string;
  nome: string;
  area: number;
  status: "baixo" | "medio" | "alto" | "critico";
  ultimaColeta: string;
  totalPragas: number;
  armadilhasAtivas: number;
  center: [number, number];
  boundary: [number, number][];
  pragas: {
    tipo: string;
    quantidade: number;
  }[];
}

const App: React.FC = () => {
  const [talhaoSelecionado, setTalhaoSelecionado] = useState<Talhao | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showSatellite, setShowSatellite] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [reportText, setReportText] = useState("");
  const [showAllTalhoes, setShowAllTalhoes] = useState(false);
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  const talhoes: Talhao[] = [
    {
      id: "T-01",
      nome: "Talhão 01 - Real",
      area: 42.5,
      status: "baixo",
      ultimaColeta: "2024-11-01",
      totalPragas: 23,
      armadilhasAtivas: 4,
      center: [-22.02815, -50.0441],
      boundary: [
        [-22.026892832885068, -50.04581682855081],
        [-22.029137619047873, -50.04358982257756],
        [-22.02928727019402, -50.04343252475786],
        [-22.02955587441754, -50.043043419625405],
        [-22.02932947946296, -50.04248873784033],
        [-22.029072386447382, -50.042617059745766],
        [-22.02889587455509, -50.04272882398601],
        [-22.02862343185447, -50.04295649188265],
        [-22.02785214756541, -50.04361051965955],
        [-22.0271307435315, -50.04425212918676],
        [-22.027038649135207, -50.044380451092195],
        [-22.026919693783995, -50.04464951315214],
        [-22.026877483796696, -50.044993084705794],
        [-22.026850622889754, -50.045419444585434],
        [-22.026892832885068, -50.04581682855081],
      ],
      pragas: [
        { tipo: "Diatraea saccharalis", quantidade: 15 },
        { tipo: "Migdolus fryanus", quantidade: 8 },
      ],
    },
    {
      id: "T-02",
      nome: "Talhão 02 - Real",
      area: 38.2,
      status: "critico",
      ultimaColeta: "2024-11-02",
      totalPragas: 187,
      armadilhasAtivas: 5,
      center: [-22.027815040973962, -50.04296772649306],
      boundary: [
        [-22.026874839776468, -50.045849105641764],
        [-22.026848126230647, -50.045400384572446],
        [-22.026871023555444, -50.04496401362445],
        [-22.02691300197644, -50.044655260595704],
        [-22.027019856083, -50.04440002475778],
        [-22.027168688454097, -50.044210656233275],
        [-22.02793574511388, -50.043527282862385],
        [-22.02903862029558, -50.04260514048178],
        [-22.02935536140643, -50.04246517244184],
        [-22.029141656638444, -50.041687114808724],
        [-22.02841276830523, -50.041962934181726],
        [-22.02788613460997, -50.042333437816325],
        [-22.0266496825853, -50.04301269448095],
        [-22.02672219087269, -50.04529746689644],
        [-22.02677561800803, -50.045791471742774],
        [-22.026874839776468, -50.045849105641764],
      ],
      pragas: [
        { tipo: "Diatraea saccharalis", quantidade: 142 },
        { tipo: "Migdolus fryanus", quantidade: 32 },
        { tipo: "Sphenophorus levis", quantidade: 13 },
      ],
    },
    {
      id: "T-03",
      nome: "Talhão 03 - Real",
      area: 45.8,
      status: "medio",
      ultimaColeta: "2024-10-31",
      totalPragas: 67,
      armadilhasAtivas: 4,
      center: [-22.02787, -50.04200],
      boundary: [
        [-22.02664370551281, -50.042988461469804],
        [-22.027094019556884, -50.0427579258745],
        [-22.027655001996877, -50.04246563967334],
        [-22.028048070002185, -50.042210403836066],
        [-22.02825032787169, -50.04206631908923],
        [-22.028441136916484, -50.041930467756174],
        [-22.028605232490946, -50.041864600443404],
        [-22.028883812912625, -50.041765799474234],
        [-22.029143311990737, -50.041658765090716],
        [-22.02895250389095, -50.04101244208309],
        [-22.02847929869553, -50.041247094385284],
        [-22.028231246953197, -50.04139117913212],
        [-22.027132181697752, -50.041860483736485],
        [-22.02682688428034, -50.0420251520184],
        [-22.02659791078483, -50.04218158688656],
        [-22.02664370551281, -50.042988461469804],
      ],
      pragas: [
        { tipo: "Diatraea saccharalis", quantidade: 48 },
        { tipo: "Migdolus fryanus", quantidade: 19 },
      ],
    },
    {
      id: "T-04",
      nome: "Talhão 04 - Real",
      area: 51.3,
      status: "baixo",
      ultimaColeta: "2024-11-03",
      totalPragas: 31,
      armadilhasAtivas: 6,
      center: [-22.02779, -50.04093],
      boundary: [
        [-22.026594574615856, -50.0421635827918],
        [-22.026850261667306, -50.04200714792364],
        [-22.027010542867927, -50.04191658036828],
        [-22.02733492093124, -50.041780729035224],
        [-22.02760205524939, -50.0416654612379],
        [-22.028109609066206, -50.041439042350135],
        [-22.028479778747496, -50.041249673825604],
        [-22.028632425757948, -50.041167339683994],
        [-22.028685852172657, -50.04113440602765],
        [-22.02877362409494, -50.04111382249255],
        [-22.028956800106215, -50.04101090481652],
        [-22.02865532279546, -50.039701791972476],
        [-22.0284187198977, -50.0398294098911],
        [-22.028166851864356, -50.03997761134548],
        [-22.027987491021065, -50.04004759536511],
        [-22.027560077032703, -50.04017109657687],
        [-22.027048705031305, -50.04032341473811],
        [-22.026693796511182, -50.04044279924233],
        [-22.026506801341867, -50.04050866655575],
        [-22.026594574615856, -50.0421635827918],
      ],
      pragas: [
        { tipo: "Diatraea saccharalis", quantidade: 21 },
        { tipo: "Sphenophorus levis", quantidade: 10 },
      ],
    },
    {
      id: "T-05",
      nome: "Talhão 05 - Real",
      area: 47.6,
      status: "alto",
      ultimaColeta: "2024-11-02",
      totalPragas: 143,
      armadilhasAtivas: 5,
      center: [-22.02756, -50.03975],
      boundary: [
        [-22.02650540848768, -50.04050951757813],
        [-22.026956733264186, -50.04035487605188],
        [-22.027285661335412, -50.0402505148013],
        [-22.027762928157372, -50.040114845175765],
        [-22.028175698166265, -50.039965260716826],
        [-22.028475600620368, -50.039791325299404],
        [-22.028652961988627, -50.039714793715575],
        [-22.028469151112205, -50.038991222378996],
        [-22.028111202931342, -50.039140806837906],
        [-22.02786612077213, -50.039269519047025],
        [-22.027662960239425, -50.03932169967234],
        [-22.027472669480915, -50.039373032219544],
        [-22.027130207560745, -50.03943225354075],
        [-22.02687139991052, -50.039480194610746],
        [-22.02665703362011, -50.039559156372036],
        [-22.026458352378384, -50.03965221844871],
        [-22.02650540848768, -50.04050951757813],
      ],
      pragas: [
        { tipo: "Diatraea saccharalis", quantidade: 98 },
        { tipo: "Migdolus fryanus", quantidade: 45 },
      ],
    },
    {
      id: "T-06",
      nome: "Talhão 06 - Real",
      area: 39.4,
      status: "medio",
      ultimaColeta: "2024-11-01",
      totalPragas: 72,
      armadilhasAtivas: 4,
      center: [-22.0275, -50.0391],
      boundary: [
        [-22.026463022307667, -50.039630404198334],
        [-22.02662723808521, -50.0395607075703],
        [-22.02687221536543, -50.03948520288827],
        [-22.02711450017152, -50.03943293041587],
        [-22.027397165254214, -50.03937775391785],
        [-22.027835968027304, -50.03927320897489],
        [-22.028029794585706, -50.039183184161914],
        [-22.02819670057643, -50.03910187142861],
        [-22.02846859539852, -50.03900313453693],
        [-22.028387834614776, -50.03866336346999],
        [-22.028105171509466, -50.03873306009896],
        [-22.02778751134565, -50.03882889296412],
        [-22.027477926602955, -50.038950862065434],
        [-22.026705307813728, -50.03929353715799],
        [-22.026511479441695, -50.03938065794438],
        [-22.026468406434276, -50.039479394836064],
        [-22.026463022307667, -50.039630404198334],
      ],
      pragas: [
        { tipo: "Diatraea saccharalis", quantidade: 54 },
        { tipo: "Migdolus fryanus", quantidade: 18 },
      ],
    },
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "baixo": return "#22c55e";
      case "medio": return "#eab308";
      case "alto": return "#f97316";
      case "critico": return "#dc2626";
      default: return "#6b7280";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "baixo": return "Baixa Infestação";
      case "medio": return "Média Infestação";
      case "alto": return "Alta Infestação";
      case "critico": return "Infestação Crítica";
      default: return "Desconhecido";
    }
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.body.appendChild(script);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.log("Geolocalização não disponível", error)
      );
    }

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const L = (window as any).L;
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

    mapInstanceRef.current = { map, osmLayer, satelliteLayer };

    const talhoesGroup = L.featureGroup().addTo(map);

    talhoes.forEach((talhao) => {
      const color = getStatusColor(talhao.status);
      const polygon = L.polygon(talhao.boundary, {
        color,
        fillColor: color,
        fillOpacity: 0.4,
        weight: 2,
      }).addTo(map);

      polygon.on("click", () => setTalhaoSelecionado(talhao));
      talhoesGroup.addLayer(polygon);

      const labelIcon = L.divIcon({
        className: "talhao-label",
        html: `<div style="border-color: ${color};"><strong>${talhao.nome}</strong><span>${talhao.totalPragas} Pragas</span></div>`,
        iconSize: [120, 40],
        iconAnchor: [60, 20],
      });

      L.marker(talhao.center, {
        icon: labelIcon,
        interactive: false,
        bubblingMouseEvents: false,
      }).addTo(map);
    });

    if (talhoesGroup.getLayers().length > 0) {
      const bounds = talhoesGroup.getBounds();
      map.fitBounds(bounds.pad(0.1));
    }

    if (userLocation) {
      const userIcon = L.divIcon({
        className: "user-marker",
        html: `<div style="position: relative;"><div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker(userLocation, { icon: userIcon }).addTo(map).bindPopup('<div style="text-align: center;"><strong>📍 Você está aqui</strong></div>');
    }

    return () => map.remove();
  }, [mapLoaded, showSatellite, userLocation]);

  const toggleSatellite = () => setShowSatellite(!showSatellite);
  const centerOnUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.map.setView(userLocation, 16);
    }
  };
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const totalArmadilhas = talhoes.reduce((acc, t) => acc + t.armadilhasAtivas, 0);
  const totalPragas = talhoes.reduce((acc, t) => acc + t.totalPragas, 0);
  const areaTotal = talhoes.reduce((acc, t) => acc + t.area, 0);

  const handleSelectTalhao = (talhao: Talhao) => {
    setTalhaoSelecionado(talhao);
    setShowAllTalhoes(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.map.setView(talhao.center, 16);
    }
  };

  const handleSaveReport = () => {
    if (!talhaoSelecionado) return;
    console.log("Relatório:", talhaoSelecionado.nome, reportText);
    alert(`Relatório para "${talhaoSelecionado.nome}" salvo!`);
    setIsCreatingReport(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4" }}>
      <header style={{ background: "linear-gradient(to right, #15803d, #22c55e)", borderBottom: "4px solid #14532d", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <div style={{ padding: "1.25rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "white", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
              <Bug style={{ width: "2rem", height: "2rem" }} />
              Fazenda Santa Rita
            </h1>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Sistema de Monitoramento GPS - Cana-de-Açúcar
            </p>
          </div>

          <div style={{ display: "flex", gap: "1.5rem" }}>
            <motion.div
              onClick={() => setShowAllTalhoes(true)}
              whileHover={{ scale: 1.05, y: -5 }}
              style={{ textAlign: "center", background: "rgba(255,255,255,0.2)", padding: "0.75rem 1.25rem", borderRadius: "0.5rem", cursor: "pointer" }}
            >
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white", margin: 0 }}>{talhoes.length}</p>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.9)", margin: 0 }}>Talhões</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05, y: -5 }} style={{ textAlign: "center", background: "rgba(255,255,255,0.2)", padding: "0.75rem 1.25rem", borderRadius: "0.5rem" }}>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white", margin: 0 }}>{totalArmadilhas}</p>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.9)", margin: 0 }}>Armadilhas</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05, y: -5 }} style={{ textAlign: "center", background: "rgba(255,255,255,0.2)", padding: "0.75rem 1.25rem", borderRadius: "0.5rem" }}>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white", margin: 0 }}>{areaTotal.toFixed(1)}ha</p>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.9)", margin: 0 }}>Área Total</p>
            </motion.div>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", height: isFullscreen ? "100vh" : "calc(100vh - 110px)", overflowX: "hidden" }}>
        <div style={{ flex: 1, padding: isFullscreen ? 0 : "1.5rem" }}>
          <div style={{ background: "white", borderRadius: "0.75rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", height: "100%", overflow: "hidden", border: "2px solid #bbf7d0", position: "relative" }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: "400px" }} />

            <div style={{ position: "absolute", top: "1rem", right: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", zIndex: 1000 }}>
              <button onClick={toggleSatellite} style={{ background: "white", color: "#15803d", fontWeight: 600, padding: "0.5rem 1rem", borderRadius: "0.5rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", border: "2px solid #86efac", cursor: "pointer", fontSize: "0.875rem" }}>
                {showSatellite ? "🗺️ Mapa" : "🛰️ Satélite"}
              </button>

              {userLocation && (
                <button onClick={centerOnUser} style={{ background: "#3b82f6", color: "white", fontWeight: 600, padding: "0.5rem 1rem", borderRadius: "0.5rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", border: "2px solid #2563eb", cursor: "pointer", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Navigation style={{ width: "1rem", height: "1rem" }} />
                  Minha Localização
                </button>
              )}

              <button onClick={toggleFullscreen} style={{ background: "white", color: "#15803d", fontWeight: 600, padding: "0.5rem 1rem", borderRadius: "0.5rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", border: "2px solid #86efac", cursor: "pointer", fontSize: "0.875rem" }}>
                {isFullscreen ? <Minimize2 style={{ width: "1rem", height: "1rem" }} /> : <Maximize2 style={{ width: "1rem", height: "1rem" }} />}
              </button>
            </div>

            <div style={{ position: "absolute", bottom: "1rem", left: "1rem", background: "white", padding: "0.5rem 1rem", borderRadius: "0.5rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", border: "2px solid #86efac", zIndex: 1000 }}>
              <span style={{ color: "#15803d", fontWeight: "bold" }}>Total de Pragas: {totalPragas}</span>
            </div>

            <div style={{ position: "absolute", bottom: "1rem", right: "1rem", background: "white", padding: "0.75rem", borderRadius: "0.5rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", border: "2px solid #86efac", zIndex: 1000, display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
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
          </div>
        </div>

        <AnimatePresence>
          {talhaoSelecionado && !isFullscreen && (
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ width: "28rem", background: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)", borderLeft: "6px solid #22c55e", padding: "2rem", overflowY: "auto", boxShadow: "-8px 0 24px rgba(0,0,0,0.08)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "2px solid #e0e7ff" }}>
                <div>
                  <h2 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#15803d", lineHeight: 1.2, margin: 0 }}>{talhaoSelecionado.nome}</h2>
                  <p style={{ fontSize: "0.8rem", color: "#22c55e", fontWeight: 600, marginTop: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>ID: {talhaoSelecionado.id}</p>
                </div>
                <button onClick={() => setTalhaoSelecionado(null)} style={{ padding: "0.625rem", background: "white", border: "2px solid #dcfce7", borderRadius: "0.625rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#15803d" }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div style={{ display: "inline-block", padding: "0.75rem 1.5rem", borderRadius: "0.75rem", fontWeight: 700, color: "white", fontSize: "0.95rem", letterSpacing: "0.02em", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", textTransform: "uppercase", background: getStatusColor(talhaoSelecionado.status) }}>
                  {getStatusLabel(talhaoSelecionado.status)}
                </div>

                <div style={{ display: "grid", gap: "1rem" }}>
                  {[
                    { icon: <MapPin />, text: `${talhaoSelecionado.area.toFixed(1)} ha` },
                    { icon: <Calendar />, text: `Última Coleta: ${talhaoSelecionado.ultimaColeta}` },
                    { icon: <Bug />, text: `Total de Pragas: ${talhaoSelecionado.totalPragas}` },
                    { icon: <Target />, text: `Armadilhas Ativas: ${talhaoSelecionado.armadilhasAtivas}` },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "white", borderRadius: "0.75rem", border: "2px solid #e0e7ff", transition: "all 0.3s" }}>
                      <div style={{ width: "1.5rem", height: "1.5rem", color: "#22c55e" }}>{item.icon}</div>
                      <span style={{ fontSize: "0.95rem", color: "#14532d", fontWeight: 600 }}>{item.text}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#15803d", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ display: "inline-block", width: "4px", height: "1.25rem", background: "linear-gradient(to right, #15803d, #22c55e)", borderRadius: "2px" }}></span>
                    Espécies Encontradas
                  </h3>
                  {talhaoSelecionado.pragas.map((p, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.125rem", background: "white", borderRadius: "0.75rem", borderLeft: "4px solid #22c55e", marginBottom: "0.75rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "2px solid transparent" }}
                    >
                      <span style={{ fontStyle: "italic", color: "#15803d", fontWeight: 600, fontSize: "0.9rem" }}>{p.tipo}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "white", fontWeight: 700, padding: "0.5rem 1rem", borderRadius: "0.5rem", fontSize: "0.85rem", minWidth: "100px", textAlign: "center" }}>
                        {p.quantidade} indivíduos
                      </span>
                    </motion.div>
                  ))}
                </div>

                <button onClick={() => setIsCreatingReport(true)} style={{ width: "100%", padding: "1rem", background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)", color: "white", fontWeight: 700, fontSize: "1rem", borderRadius: "0.75rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", boxShadow: "0 4px 12px rgba(21,128,61,0.25)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "1rem" }}>
                  <FileText style={{ width: "1rem", height: "1rem" }} /> Novo Relatório
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAllTalhoes && !isFullscreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllTalhoes(false)}
              style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "1rem", backdropFilter: "blur(4px)" }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                style={{ background: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "95%", maxWidth: "1200px", maxHeight: "85vh", overflowY: "auto", border: "2px solid #e0e7ff" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "2px solid #e0e7ff" }}>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#15803d", margin: 0 }}>Todos os Talhões ({talhoes.length})</h3>
                  <button onClick={() => setShowAllTalhoes(false)} style={{ padding: "0.625rem", background: "white", border: "2px solid #dcfce7", borderRadius: "0.625rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#15803d" }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
                  {talhoes.map((talhao, index) => (
                    <motion.div
                      key={talhao.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      onClick={() => handleSelectTalhao(talhao)}
                      style={{ background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)", border: "2px solid #e0e7ff", borderRadius: "0.75rem", padding: "1.5rem", cursor: "pointer", display: "flex", flexDirection: "column", gap: "1rem" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "0.75rem", borderBottom: "2px solid #f0f0f0" }}>
                        <h4 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#15803d", margin: 0, flex: 1 }}>{talhao.nome}</h4>
                        <span style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 700, background: "#f0fdf4", padding: "0.25rem 0.75rem", borderRadius: "0.5rem", letterSpacing: "0.05em" }}>{talhao.id}</span>
                      </div>

                      <div style={{ display: "inline-block", padding: "0.5rem 1rem", borderRadius: "0.5rem", fontWeight: 700, color: "white", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.02em", textAlign: "center", background: getStatusColor(talhao.status) }}>
                        {getStatusLabel(talhao.status)}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#14532d", fontSize: "0.9rem", fontWeight: 600 }}>
                          <MapPin size={16} style={{ color: "#22c55e", flexShrink: 0 }} />
                          <span>{talhao.area.toFixed(1)} ha</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#14532d", fontSize: "0.9rem", fontWeight: 600 }}>
                          <Bug size={16} style={{ color: "#22c55e", flexShrink: 0 }} />
                          <span>{talhao.totalPragas} pragas</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#14532d", fontSize: "0.9rem", fontWeight: 600 }}>
                          <Target size={16} style={{ color: "#22c55e", flexShrink: 0 }} />
                          <span>{talhao.armadilhasAtivas} armadilhas</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#14532d", fontSize: "0.9rem", fontWeight: 600 }}>
                          <Calendar size={16} style={{ color: "#22c55e", flexShrink: 0 }} />
                          <span>{talhao.ultimaColeta}</span>
                        </div>
                      </div>

                      <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "2px solid #f0f0f0", textAlign: "right" }}>
                        <span style={{ color: "#15803d", fontWeight: 700, fontSize: "0.9rem" }}>Ver detalhes →</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCreatingReport && talhaoSelecionado && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "1rem", backdropFilter: "blur(4px)" }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{ background: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "100%", maxWidth: "600px", border: "2px solid #e0e7ff" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "2px solid #e0e7ff" }}>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#15803d", margin: 0 }}>Relatório - {talhaoSelecionado.nome}</h3>
                  <button onClick={() => setIsCreatingReport(false)} style={{ padding: "0.625rem", background: "white", border: "2px solid #dcfce7", borderRadius: "0.625rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#15803d" }}>
                    <X size={20} />
                  </button>
                </div>

                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Descreva o que foi observado neste talhão..."
                  style={{ width: "100%", minHeight: "220px", padding: "1rem", border: "2px solid #e0e7ff", borderRadius: "0.75rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: "0.95rem", color: "#14532d", background: "#f9fdf7", resize: "vertical", marginBottom: "1.5rem" }}
                />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                  <button onClick={() => setIsCreatingReport(false)} style={{ padding: "0.75rem 1.75rem", background: "white", color: "#dc2626", border: "2px solid #fecaca", fontWeight: 700, borderRadius: "0.75rem", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.9rem" }}>
                    Cancelar
                  </button>
                  <button onClick={handleSaveReport} style={{ padding: "0.75rem 1.75rem", background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)", color: "white", border: "none", fontWeight: 700, borderRadius: "0.75rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(21,128,61,0.25)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.9rem" }}>
                    Salvar Relatório
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .talhao-label > div {
          background: white;
          padding: 0.5rem;
          border-radius: 0.5rem;
          border: 2px solid;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          text-align: center;
          pointer-events: none;
        }
        .talhao-label strong {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #15803d;
        }
        .talhao-label span {
          display: block;
          font-size: 0.7rem;
          color: #666;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default App;
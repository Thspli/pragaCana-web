"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Bug,
  AlertTriangle,
  Calendar,
  Target,
  X,
  Navigation,
  Maximize2,
  Minimize2,
  FileText,
} from "lucide-react";
import styles from "./page.module.css";

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
  const [talhaoSelecionado, setTalhaoSelecionado] = useState<Talhao | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showSatellite, setShowSatellite] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [reportText, setReportText] = useState("");

  // [MODIFICADO] Atualizamos os dados com 'center' e 'boundary'
  const talhoes: Talhao[] = [
    {
      id: 'T-01',
      nome: 'Talhão 01 - Real', // (Mude o nome se quiser)
      area: 42.5, // (Mude a área se quiser)
      status: 'baixo', // (Mude o status se quiser)
      ultimaColeta: '2024-11-01',
      totalPragas: 23,
      armadilhasAtivas: 4,
      center: [-22.02815, -50.0441], // [SEU NOVO CENTRO] (calculado)
      boundary: [ // [SUA NOVA ÁREA]
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
        [-22.026892832885068, -50.04581682855081]
      ],
      pragas: [
        { tipo: 'Diatraea saccharalis', quantidade: 15 },
        { tipo: 'Migdolus fryanus', quantidade: 8 }
      ]
    },

      {
        id: 'T-02',
        nome: 'Talhão 02 - Real', // (Mude o nome)
        area: 38.2, // (Mude a área)
        status: 'critico', // (Mude o status)
        ultimaColeta: '2024-11-02',
        totalPragas: 187,
        armadilhasAtivas: 5,
        center: [ -22.027775780134633,  -50.04297484035021,], // [SEU NOVO CENTRO] (calculado)
        boundary: [ // [SUA NOVA ÁREA]
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
          [-22.026874839776468, -50.045849105641764]
        ],
        pragas: [
          { tipo: 'Diatraea saccharalis', quantidade: 142 },
          { tipo: 'Migdolus fryanus', quantidade: 32 },
          { tipo: 'Sphenophorus levis', quantidade: 13 }
        ]
      },
      {
        id: 'T-03',
        nome: 'Talhão 03 - Real', // (Mude o nome)
        area: 45.8, // (Mude a área)
        status: 'medio', // (Mude o status)
        ultimaColeta: '2024-10-31',
        totalPragas: 67,
        armadilhasAtivas: 4,
        center: [-22.02787, -50.04200], // [SEU NOVO CENTRO] (calculado)
        boundary: [ // [SUA NOVA ÁREA]
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
          [-22.02664370551281, -50.042988461469804]
        ],
        pragas: [
          { tipo: 'Diatraea saccharalis', quantidade: 48 },
          { tipo: 'Migdolus fryanus', quantidade: 19 }
        ]
      },
      
      {
        id: 'T-04',
        nome: 'Talhão 04 - Real', // (Mude o nome)
        area: 51.3, // (Mude a área)
        status: 'baixo', // (Mude o status)
        ultimaColeta: '2024-11-03',
        totalPragas: 31,
        armadilhasAtivas: 6,
        center: [-22.02779, -50.04093], // [SEU NOVO CENTRO] (calculado)
        boundary: [ // [SUA NOVA ÁREA]
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
          [-22.026594574615856, -50.0421635827918]
        ],
        pragas: [
          { tipo: 'Diatraea saccharalis', quantidade: 21 },
          { tipo: 'Sphenophorus levis', quantidade: 10 }
        ]
      },
      
      {
        id: 'T-05',
        nome: 'Talhão 05 - Real', // (Mude o nome)
        area: 47.6, // (Mude a área)
        status: 'alto', // (Mude o status)
        ultimaColeta: '2024-11-02',
        totalPragas: 143,
        armadilhasAtivas: 5,
        center: [-22.02756, -50.03975], // [SEU NOVO CENTRO] (calculado)
        boundary: [ // [SUA NOVA ÁREA]
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
          [-22.02650540848768, -50.04050951757813]
        ],
        pragas: [
          { tipo: 'Diatraea saccharalis', quantidade: 98 },
          { tipo: 'Migdolus fryanus', quantidade: 45 }
        ]
      },
      
      
      {
        id: 'T-06',
        nome: 'Talhão 06 - Real', // (Mude o nome)
        area: 39.4, // (Mude a área)
        status: 'medio', // (Mude o status)
        ultimaColeta: '2024-11-01',
        totalPragas: 72,
        armadilhasAtivas: 4,
        center: [-22.0275, -50.0391], // [SEU NOVO CENTRO] (calculado)
        boundary: [ // [SUA NOVA ÁREA]
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
          [-22.026463022307667, -50.039630404198334]
        ],
        pragas: [
          { tipo: 'Diatraea saccharalis', quantidade: 54 },
          { tipo: 'Migdolus fryanus', quantidade: 18 }
        ]
      },
  ];      

  const getStatusColor = (status: string): string => {
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

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "baixo":
        return "Baixa Infestação";
      case "medio":
        return "Média Infestação";
      case "alto":
        return "Alta Infestação";
      case "critico":
        return "Infestação Crítica";
      default:
        return "Desconhecido";
    }
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.body.appendChild(script);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log("Geolocalização não disponível", error);
        }
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
    const centerCoords: [number, number] = [-22.315, -49.06];

    const map = L.map(mapRef.current, {
      zoomControl: true,
    }).setView(centerCoords, 14);

    const osmLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }
    );

    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "© Esri",
        maxZoom: 19,
      }
    );

    if (showSatellite) {
      satelliteLayer.addTo(map);
    } else {
      osmLayer.addTo(map);
    }

    mapInstanceRef.current = { map, osmLayer, satelliteLayer };

    talhoes.forEach((talhao) => {
      const color = getStatusColor(talhao.status);

      const polygon = L.polygon(talhao.boundary, {
        color,
        fillColor: color,
        fillOpacity: 0.4,
        weight: 2,
      }).addTo(map);

      polygon.on("click", () => {
        setTalhaoSelecionado(talhao);
      });

      const labelIcon = L.divIcon({
        className: "talhao-label",
        html: `
          <div style="border-color: ${color};">
            <strong>${talhao.nome}</strong>
            <span>${talhao.totalPragas} Pragas</span>
          </div>
        `,
        iconSize: [120, 40],
        iconAnchor: [60, 20],
      });

      L.marker(talhao.center, {
        icon: labelIcon,
        interactive: false,
        bubblingMouseEvents: false,
      }).addTo(map);
    });

    if (userLocation) {
      const userIcon = L.divIcon({
        className: "user-marker",
        html: `
          <div style="position: relative;">
            <div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker(userLocation, { icon: userIcon })
        .addTo(map)
        .bindPopup(
          '<div style="text-align: center;"><strong>📍 Você está aqui</strong></div>'
        );
    }

    return () => {
      map.remove();
    };
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

  const headerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const headerItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const pestListVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const pestItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const handleOpenReportModal = () => {
    setReportText("");
    setIsCreatingReport(true);
  };

  const handleCloseReportModal = () => {
    setIsCreatingReport(false);
  };

  const handleSaveReport = () => {
    if (!talhaoSelecionado) return;

    console.log("--- NOVO RELATÓRIO ---");
    console.log("Talhão:", talhaoSelecionado.nome);
    console.log("ID:", talhaoSelecionado.id);
    console.log("Relatório:", reportText);
    console.log("-----------------------");

    alert(`Relatório para "${talhaoSelecionado.nome}" salvo com sucesso!`);

    handleCloseReportModal();
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: { opacity: 0, scale: 0.9 },
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.appHeader}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.headerTitle}>
              <Bug className={styles.headerIcon} />
              Fazenda Santa Rita
            </h1>
            <p className={styles.headerSubtitle}>
              Sistema de Monitoramento GPS - Cana-de-Açúcar
            </p>
          </div>

          <motion.div
            className={styles.statsGrid}
            variants={headerContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className={styles.statCard}
              variants={headerItemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <p className={styles.statValue}>{talhoes.length}</p>
              <p className={styles.statLabel}>Talhões</p>
            </motion.div>

            <motion.div
              className={styles.statCard}
              variants={headerItemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <p className={styles.statValue}>{totalArmadilhas}</p>
              <p className={styles.statLabel}>Armadilhas</p>
            </motion.div>

            <motion.div
              className={styles.statCard}
              variants={headerItemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <p className={styles.statValue}>{areaTotal.toFixed(1)}ha</p>
              <p className={styles.statLabel}>Área Total</p>
            </motion.div>
          </motion.div>
        </div>
      </header>

      <div
        className={`${styles.mainLayout} ${isFullscreen ? styles.fullscreen : ""}`}
      >
        <div className={styles.mapContainer}>
          <div className={styles.mapWrapper}>
            <div ref={mapRef} className={styles.map} />

            <div className={styles.mapControls}>
              <button onClick={toggleSatellite} className={styles.controlButton}>
                {showSatellite ? "🗺️ Mapa" : "🛰️ Satélite"}
              </button>

              {userLocation && (
                <button
                  onClick={centerOnUser}
                  className={`${styles.controlButton} ${styles.locationButton}`}
                >
                  <Navigation className={styles.buttonIcon} />
                  Minha Localização
                </button>
              )}

              <button
                onClick={toggleFullscreen}
                className={styles.controlButton}
              >
                {isFullscreen ? (
                  <Minimize2 className={styles.buttonIcon} />
                ) : (
                  <Maximize2 className={styles.buttonIcon} />
                )}
              </button>
            </div>

            <div className={styles.totalBadge}>
              <span>Total de Pragas: {totalPragas}</span>
            </div>

            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.green}`}></div>
                <span>Baixa</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.yellow}`}></div>
                <span>Média</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.orange}`}></div>
                <span>Alta</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.red}`}></div>
                <span>Crítica</span>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {talhaoSelecionado && !isFullscreen && (
            <motion.aside
              className={styles.sidebar}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className={styles.sidebarHeader}>
                <div>
                  <h2 className={styles.sidebarTitle}>
                    {talhaoSelecionado.nome}
                  </h2>
                  <p className={styles.sidebarId}>ID: {talhaoSelecionado.id}</p>
                </div>
                <button
                  onClick={() => setTalhaoSelecionado(null)}
                  className={styles.closeButton}
                >
                  <X size={20} />
                </button>
              </div>

              <div className={styles.sidebarContent}>
                <div
                  className={styles.statusBadge}
                  style={{
                    backgroundColor: getStatusColor(talhaoSelecionado.status),
                  }}
                >
                  {getStatusLabel(talhaoSelecionado.status)}
                </div>

                <div className={styles.sidebarStats}>
                  <div className={styles.statItem}>
                    <MapPin className={styles.statIcon} />
                    <span>{talhaoSelecionado.area.toFixed(1)} ha</span>
                  </div>
                  <div className={styles.statItem}>
                    <Calendar className={styles.statIcon} />
                    <span>Última Coleta: {talhaoSelecionado.ultimaColeta}</span>
                  </div>
                  <div className={styles.statItem}>
                    <Bug className={styles.statIcon} />
                    <span>Total de Pragas: {talhaoSelecionado.totalPragas}</span>
                  </div>
                  <div className={styles.statItem}>
                    <Target className={styles.statIcon} />
                    <span>
                      Armadilhas Ativas: {talhaoSelecionado.armadilhasAtivas}
                    </span>
                  </div>
                </div>

                <motion.div
                  className={styles.pragasList}
                  variants={pestListVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h3>Espécies Encontradas</h3>
                  {talhaoSelecionado.pragas.map((p, index) => (
                    <motion.div
                      key={index}
                      className={styles.pragaItem}
                      variants={pestItemVariants}
                    >
                      <span className={styles.pragaTipo}>{p.tipo}</span>
                      <span className={styles.pragaQuantidade}>
                        {p.quantidade} indivíduos
                      </span>
                    </motion.div>
                  ))}
                </motion.div>

                <button
                  onClick={handleOpenReportModal}
                  className={styles.reportButton}
                >
                  <FileText className={styles.buttonIcon} /> Novo Relatório
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCreatingReport && talhaoSelecionado && (
            <motion.div
              className={styles.modalBackdrop}
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.div
                className={styles.modalContent}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className={styles.modalHeader}>
                  <h3>
                    Relatório - {talhaoSelecionado.nome}
                  </h3>
                  <button
                    onClick={handleCloseReportModal}
                    className={styles.closeButton}
                  >
                    <X size={20} />
                  </button>
                </div>

                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Descreva o que foi observado neste talhão..."
                  className={styles.modalTextarea}
                />

                <div className={styles.modalActions}>
                  <button
                    onClick={handleCloseReportModal}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveReport}
                    className={styles.saveButton}
                  >
                    Salvar Relatório
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
  
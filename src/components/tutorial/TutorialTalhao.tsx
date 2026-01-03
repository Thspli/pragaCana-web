// src/components/tutorial/TutorialTalhao.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Check, MapPin, MousePointer, Edit, Save } from "lucide-react";

interface TutorialTalhaoProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: "Bem-vindo ao Tutorial!",
    description: "Vamos aprender a criar seu primeiro talhão em poucos passos simples.",
    icon: "👋",
    image: null,
    highlight: null,
  },
  {
    id: 2,
    title: "Localize o Botão de Desenho",
    description: 'Encontre o botão verde "✏️ Novo talhão (desenhar)" logo abaixo do mapa.',
    icon: "🔍",
    image: null,
    highlight: "draw-button",
  },
  {
    id: 3,
    title: "Clique para Iniciar",
    description: "Clique no botão para ativar o modo de desenho. O botão ficará vermelho.",
    icon: "🖱️",
    image: null,
    highlight: "draw-button",
  },
  {
    id: 4,
    title: "Desenhe o Perímetro",
    description: "Clique nos pontos do mapa para desenhar o contorno do seu talhão. Clique no primeiro ponto novamente para fechar o polígono.",
    icon: "✏️",
    image: null,
    highlight: "map",
  },
  {
    id: 5,
    title: "Preencha os Dados",
    description: "Após desenhar, um modal aparecerá. Preencha o nome do talhão e escolha o status de infestação.",
    icon: "📝",
    image: null,
    highlight: null,
  },
  {
    id: 6,
    title: "Salve seu Talhão",
    description: 'Clique em "💾 Salvar Talhão" para finalizar. Pronto! Seu talhão aparecerá no mapa.',
    icon: "✅",
    image: null,
    highlight: null,
  },
];

export function TutorialTalhao({ open, onClose, onComplete }: TutorialTalhaoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (currentStep === steps.length - 1) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [currentStep]);

  if (!open) return null;

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      onClose();
      localStorage.setItem('tutorial_talhao_completed', 'true');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('tutorial_talhao_completed', 'true');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay com blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              zIndex: 4000,
            }}
            onClick={handleSkip}
          />

          {/* Modal do Tutorial */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              zIndex: 4001,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: "1.5rem",
                boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
                width: "100%",
                maxHeight: "90vh",
                overflow: "auto",
                border: "3px solid #22c55e",
              }}
            >
              {/* Header */}
              <div
                style={{
                  background: "linear-gradient(135deg, #15803d, #22c55e)",
                  padding: "2rem",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decoração de fundo */}
                <div
                  style={{
                    position: "absolute",
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                    borderRadius: "50%",
                  }}
                />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "3rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {step.icon}
                    </div>
                    <h2
                      style={{
                        fontSize: "1.75rem",
                        fontWeight: 700,
                        margin: 0,
                        marginBottom: "0.5rem",
                      }}
                    >
                      {step.title}
                    </h2>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "rgba(255,255,255,0.2)",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      Etapa {currentStep + 1} de {steps.length}
                    </div>
                  </div>
                  <button
                    onClick={handleSkip}
                    style={{
                      padding: "0.5rem",
                      background: "rgba(255,255,255,0.2)",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Barra de progresso */}
                <div
                  style={{
                    marginTop: "1.5rem",
                    height: "6px",
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "3px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    style={{
                      height: "100%",
                      background: "white",
                      borderRadius: "3px",
                    }}
                  />
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "2rem" }}>
                {/* Descrição */}
                <p
                  style={{
                    fontSize: "1.125rem",
                    lineHeight: 1.7,
                    color: "#374151",
                    marginBottom: "2rem",
                    fontWeight: 500,
                  }}
                >
                  {step.description}
                </p>

                {/* Ilustração visual por etapa */}
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "2px dashed #bbf7d0",
                    borderRadius: "1rem",
                    padding: "2rem",
                    marginBottom: "2rem",
                    textAlign: "center",
                  }}
                >
                  {currentStep === 0 && (
                    <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🗺️</div>
                  )}
                  {currentStep === 1 && (
                    <div>
                      <Edit size={64} style={{ color: "#22c55e", margin: "0 auto 1rem" }} />
                      <div
                        style={{
                          display: "inline-block",
                          background: "#22c55e",
                          color: "white",
                          padding: "0.75rem 1.5rem",
                          borderRadius: "0.5rem",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        ✏️ Novo talhão (desenhar)
                      </div>
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div>
                      <MousePointer size={64} style={{ color: "#22c55e", margin: "0 auto 1rem" }} />
                      <p style={{ color: "#15803d", fontWeight: 600, fontSize: "1rem" }}>
                        Clique no botão verde para ativar
                      </p>
                    </div>
                  )}
                  {currentStep === 3 && (
                    <div>
                      <MapPin size={64} style={{ color: "#22c55e", margin: "0 auto 1rem" }} />
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "2rem",
                          marginTop: "1rem",
                        }}
                      >
                        <span>📍</span>
                        <span style={{ fontSize: "1.5rem" }}>→</span>
                        <span>📍</span>
                        <span style={{ fontSize: "1.5rem" }}>→</span>
                        <span>📍</span>
                        <span style={{ fontSize: "1.5rem" }}>→</span>
                        <span>📍</span>
                      </div>
                      <p style={{ color: "#15803d", fontWeight: 600, fontSize: "0.9rem", marginTop: "1rem" }}>
                        Clique em pelo menos 3 pontos no mapa
                      </p>
                    </div>
                  )}
                  {currentStep === 4 && (
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "2.5rem", textAlign: "center", marginBottom: "1rem" }}>📝</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div
                          style={{
                            background: "white",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            border: "2px solid #e5e7eb",
                            fontSize: "0.9rem",
                            color: "#6b7280",
                          }}
                        >
                          Nome: <strong style={{ color: "#15803d" }}>Talhão 01</strong>
                        </div>
                        <div
                          style={{
                            background: "white",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            border: "2px solid #e5e7eb",
                            fontSize: "0.9rem",
                            color: "#6b7280",
                          }}
                        >
                          Status: <strong style={{ color: "#15803d" }}>Baixa Infestação</strong>
                        </div>
                      </div>
                    </div>
                  )}
                  {currentStep === 5 && (
                    <div>
                      {showConfetti && <ConfettiEffect />}
                      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
                      <p style={{ color: "#15803d", fontWeight: 700, fontSize: "1.25rem" }}>
                        Parabéns! Você está pronto!
                      </p>
                      <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                        Agora você pode começar a monitorar suas pragas
                      </p>
                    </div>
                  )}
                </div>

                {/* Dicas extras */}
                {currentStep === 3 && (
                  <div
                    style={{
                      background: "#fef3c7",
                      border: "2px solid #fbbf24",
                      borderRadius: "0.75rem",
                      padding: "1rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "1.25rem" }}>💡</span>
                      <div>
                        <strong style={{ color: "#92400e", fontSize: "0.9rem" }}>Dica:</strong>
                        <p style={{ color: "#92400e", fontSize: "0.875rem", margin: "0.25rem 0 0 0" }}>
                          Para fechar o polígono, clique no primeiro ponto novamente ou clique duas vezes no último ponto.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer com navegação */}
              <div
                style={{
                  padding: "1.5rem 2rem",
                  background: "#f9fafb",
                  borderTop: "2px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <button
                  onClick={handleSkip}
                  style={{
                    padding: "0.75rem 1.25rem",
                    background: "white",
                    border: "2px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    color: "#6b7280",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  Pular Tutorial
                </button>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {!isFirstStep && (
                    <button
                      onClick={handlePrev}
                      style={{
                        padding: "0.75rem 1.25rem",
                        background: "white",
                        border: "2px solid #22c55e",
                        borderRadius: "0.5rem",
                        color: "#15803d",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.9rem",
                      }}
                    >
                      <ChevronLeft size={18} />
                      Anterior
                    </button>
                  )}

                  <button
                    onClick={handleNext}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: "linear-gradient(135deg, #15803d, #22c55e)",
                      border: "none",
                      borderRadius: "0.5rem",
                      color: "white",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.9rem",
                      boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                    }}
                  >
                    {isLastStep ? (
                      <>
                        <Check size={18} />
                        Começar Agora
                      </>
                    ) : (
                      <>
                        Próximo
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Componente de confete simples
function ConfettiEffect() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * 100 - 50 + "%",
            y: -20,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: "120%",
            rotate: Math.random() * 720 - 360,
            opacity: 0,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            width: "10px",
            height: "10px",
            background: ["#22c55e", "#15803d", "#fbbf24", "#3b82f6"][i % 4],
            borderRadius: "2px",
          }}
        />
      ))}
    </div>
  );
}
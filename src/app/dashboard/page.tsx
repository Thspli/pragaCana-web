// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Bug,
  Target,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowLeft,
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTalhoes } from "@/hooks/useTalhoes";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { talhoes, loading } = useTalhoes();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  // Dados mock para os gráficos (depois você integra com dados reais)
  const pragasHistorico = [
    { mes: "Jan", pragas: 120, armadilhas: 45 },
    { mes: "Fev", pragas: 180, armadilhas: 52 },
    { mes: "Mar", pragas: 240, armadilhas: 48 },
    { mes: "Abr", pragas: 200, armadilhas: 55 },
    { mes: "Mai", pragas: 150, armadilhas: 60 },
    { mes: "Jun", pragas: 100, armadilhas: 58 },
  ];

  const statusDistribution = [
    { name: "Baixa", value: talhoes.filter(t => t.status === "baixo").length, color: "#22c55e" },
    { name: "Média", value: talhoes.filter(t => t.status === "medio").length, color: "#eab308" },
    { name: "Alta", value: talhoes.filter(t => t.status === "alto").length, color: "#f97316" },
    { name: "Crítica", value: talhoes.filter(t => t.status === "critico").length, color: "#ef4444" },
  ];

  const talhoesPorArea = talhoes.map(t => ({
    nome: t.nome,
    area: t.area || 0,
    pragas: t.totalPragas || 0,
  })).sort((a, b) => b.pragas - a.pragas).slice(0, 5);

  const totals = {
    totalTalhoes: talhoes.length,
    totalPragas: talhoes.reduce((acc, t) => acc + (t.totalPragas || 0), 0),
    totalArmadilhas: talhoes.reduce((acc, t) => acc + (t.armadilhasAtivas || 0), 0),
    areaTotal: talhoes.reduce((acc, t) => acc + (t.area || 0), 0),
  };

  // Cálculo de tendências (mock)
  const tendenciaPragas = -12; // -12% em relação ao mês anterior
  const tendenciaArmadilhas = +8; // +8% em relação ao mês anterior

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "4px solid #e5e7eb", borderTop: "4px solid #22c55e", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#6b7280", fontWeight: 600 }}>Carregando dashboard...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "white",
              border: "2px solid #e5e7eb",
              padding: "0.625rem 1rem",
              borderRadius: "0.75rem",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "1rem",
            }}
          >
            <ArrowLeft size={18} />
            Voltar ao Mapa
          </motion.button>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#1f2937",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <BarChart3 size={32} style={{ color: "#22c55e" }} />
            Dashboard Analytics
          </motion.h1>
          <p style={{ color: "#6b7280", fontSize: "0.95rem", marginTop: "0.5rem" }}>
            Visão geral e análise de dados em tempo real
          </p>
        </div>

        {/* Period Selector */}
        <div style={{ display: "flex", gap: "0.5rem", background: "white", padding: "0.25rem", borderRadius: "0.75rem", border: "2px solid #e5e7eb" }}>
          {(["week", "month", "year"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              style={{
                padding: "0.5rem 1rem",
                background: selectedPeriod === period ? "linear-gradient(135deg, #15803d, #22c55e)" : "transparent",
                color: selectedPeriod === period ? "white" : "#6b7280",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
            >
              {period === "week" ? "Semana" : period === "month" ? "Mês" : "Ano"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <KPICard
          icon={<MapPin size={24} />}
          label="Total de Talhões"
          value={totals.totalTalhoes}
          trend={null}
          color="#3b82f6"
          delay={0}
        />
        <KPICard
          icon={<Bug size={24} />}
          label="Total de Pragas"
          value={totals.totalPragas}
          trend={tendenciaPragas}
          color="#ef4444"
          delay={0.1}
        />
        <KPICard
          icon={<Target size={24} />}
          label="Armadilhas Ativas"
          value={totals.totalArmadilhas}
          trend={tendenciaArmadilhas}
          color="#22c55e"
          delay={0.2}
        />
        <KPICard
          icon={<Activity size={24} />}
          label="Área Total"
          value={`${totals.areaTotal.toFixed(1)} ha`}
          trend={null}
          color="#f59e0b"
          delay={0.3}
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Line Chart - Evolução de Pragas */}
        <ChartCard title="Evolução de Pragas" subtitle="Últimos 6 meses" icon={<TrendingUp size={20} />}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={pragasHistorico}>
              <defs>
                <linearGradient id="colorPragas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorArmadilhas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#9ca3af" style={{ fontSize: "0.75rem" }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: "0.75rem" }} />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "0.875rem" }} />
              <Area type="monotone" dataKey="pragas" stroke="#ef4444" strokeWidth={2} fill="url(#colorPragas)" name="Pragas" />
              <Area type="monotone" dataKey="armadilhas" stroke="#22c55e" strokeWidth={2} fill="url(#colorArmadilhas)" name="Armadilhas" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pie Chart - Distribuição de Status */}
        <ChartCard title="Status dos Talhões" subtitle="Distribuição atual" icon={<PieChartIcon size={20} />}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bar Chart - Top 5 Talhões */}
      <ChartCard title="Top 5 Talhões com Maior Infestação" subtitle="Ordenado por número de pragas" icon={<AlertTriangle size={20} />}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={talhoesPorArea}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="nome" stroke="#9ca3af" style={{ fontSize: "0.75rem" }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: "0.75rem" }} />
            <Tooltip
              contentStyle={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "0.875rem" }} />
            <Bar dataKey="pragas" fill="#ef4444" name="Pragas" radius={[8, 8, 0, 0]} />
            <Bar dataKey="area" fill="#22c55e" name="Área (ha)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          background: "white",
          borderRadius: "1rem",
          padding: "1.5rem",
          border: "2px solid #e5e7eb",
          marginTop: "1.5rem",
        }}
      >
        <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#1f2937", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Calendar size={20} style={{ color: "#22c55e" }} />
          Atividades Recentes
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <ActivityItem
            icon={<CheckCircle size={18} style={{ color: "#22c55e" }} />}
            title="Nova armadilha cadastrada"
            description="Talhão 3 - Setor Norte"
            time="5 minutos atrás"
          />
          <ActivityItem
            icon={<AlertTriangle size={18} style={{ color: "#f59e0b" }} />}
            title="Alerta de infestação média"
            description="Talhão 7 - Verificar armadilhas"
            time="1 hora atrás"
          />
          <ActivityItem
            icon={<Bug size={18} style={{ color: "#ef4444" }} />}
            title="Pico de pragas detectado"
            description="Talhão 2 - 45 pragas identificadas"
            time="3 horas atrás"
          />
          <ActivityItem
            icon={<CheckCircle size={18} style={{ color: "#22c55e" }} />}
            title="Relatório mensal gerado"
            description="Maio 2025 - Download disponível"
            time="1 dia atrás"
          />
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function KPICard({ icon, label, value, trend, color, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      style={{
        background: "white",
        borderRadius: "1rem",
        padding: "1.5rem",
        border: "2px solid #e5e7eb",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div
          style={{
            background: `${color}15`,
            padding: "0.75rem",
            borderRadius: "0.75rem",
            display: "flex",
            color,
          }}
        >
          {icon}
        </div>
        {trend !== null && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: trend > 0 ? "#22c55e" : "#ef4444",
            }}
          >
            {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: "2rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.25rem" }}>
        {value}
      </div>
      <div style={{ fontSize: "0.875rem", color: "#6b7280", fontWeight: 500 }}>{label}</div>
    </motion.div>
  );
}

function ChartCard({ title, subtitle, icon, children }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "white",
        borderRadius: "1rem",
        padding: "1.5rem",
        border: "2px solid #e5e7eb",
      }}
    >
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <div style={{ color: "#22c55e" }}>{icon}</div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#1f2937", margin: 0 }}>{title}</h3>
        </div>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>{subtitle}</p>
      </div>
      {children}
    </motion.div>
  );
}

function ActivityItem({ icon, title, description, time }: any) {
  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        padding: "0.875rem",
        background: "#f9fafb",
        borderRadius: "0.75rem",
        transition: "all 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#f3f4f6";
        e.currentTarget.style.transform = "translateX(4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#f9fafb";
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <div style={{ marginTop: "0.125rem" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#1f2937" }}>{title}</p>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280", marginTop: "0.125rem" }}>{description}</p>
      </div>
      <div style={{ fontSize: "0.75rem", color: "#9ca3af", whiteSpace: "nowrap" }}>{time}</div>
    </div>
  );
}
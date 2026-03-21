"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import AdminSidebar from "@/app/components/AdminSidebar";
import StatCard from "@/app/components/StatCard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

type MonthlyTotal = { mes: number; ano: number; total: number; quantidade: number };
type DashboardStats = {
  mesAtual: { total: number; quantidade: number };
  mesAnterior: { total: number; quantidade: number };
  totalMembros: number;
};
type ReportData = { monthlyTotals: MonthlyTotal[]; dashboardStats: DashboardStats };

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function DashboardPage() {
  const { data, isLoading } = useSWR<ReportData>("/api/relatorios/mensal", fetcher);
  const [chartData, setChartData] = useState<{ name: string; total: number; qtd: number }[]>([]);

  useEffect(() => {
    if (!data?.monthlyTotals) return;
    setChartData(
      data.monthlyTotals.map((m) => ({
        name: `${MESES[m.mes - 1]}/${String(m.ano).slice(2)}`,
        total: Number(m.total),
        qtd: m.quantidade,
      })),
    );
  }, [data]);

  const stats = data?.dashboardStats;
  const diff = stats
    ? stats.mesAtual.total - stats.mesAnterior.total
    : 0;
  const trendDir =
    diff > 0 ? "up" : diff < 0 ? "down" : "neutral";
  const trendLabel = stats
    ? `${diff >= 0 ? "+" : ""}${formatBRL(diff)} vs mês anterior`
    : "";

  return (
    <div className="flex" style={{ minHeight: "100vh", backgroundColor: "var(--cream)" }}>
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bold text-2xl" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>
            ✠ Painel de Controle
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
            Visão geral dos dízimos da Comunidade Santa Madalena
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
            Carregando...
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Arrecadado este mês"
                value={formatBRL(stats?.mesAtual.total ?? 0)}
                icon="💰"
                trend={trendDir}
                trendLabel={trendLabel}
              />
              <StatCard
                title="Contribuições este mês"
                value={String(stats?.mesAtual.quantidade ?? 0)}
                subtitle="registros de dízimo"
                icon="📋"
              />
              <StatCard
                title="Arrecadado mês anterior"
                value={formatBRL(stats?.mesAnterior.total ?? 0)}
                subtitle={`${stats?.mesAnterior.quantidade ?? 0} contribuições`}
                icon="📅"
              />
              <StatCard
                title="Membros ativos"
                value={String(stats?.totalMembros ?? 0)}
                subtitle="cadastrados na comunidade"
                icon="👥"
              />
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Bar chart */}
              <div
                className="rounded-xl p-6"
                style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)" }}
              >
                <h2 className="font-bold mb-1" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>
                  Arrecadação Mensal
                </h2>
                <p className="text-xs mb-4" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                  Últimos 12 meses
                </p>
                {chartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                    Nenhum dado disponível
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0e8dc" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b5c4e", fontFamily: "sans-serif" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#6b5c4e", fontFamily: "sans-serif" }} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(v) => formatBRL(Number(v))}
                        contentStyle={{ fontFamily: "sans-serif", fontSize: 12, borderColor: "var(--cream-dark)" }}
                      />
                      <Bar dataKey="total" fill="var(--burgundy)" radius={[4, 4, 0, 0]} name="Arrecadado" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Line chart */}
              <div
                className="rounded-xl p-6"
                style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)" }}
              >
                <h2 className="font-bold mb-1" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>
                  Quantidade de Contribuintes
                </h2>
                <p className="text-xs mb-4" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                  Evolução mensal
                </p>
                {chartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                    Nenhum dado disponível
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0e8dc" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b5c4e", fontFamily: "sans-serif" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#6b5c4e", fontFamily: "sans-serif" }} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontFamily: "sans-serif", fontSize: 12, borderColor: "var(--cream-dark)" }} />
                      <Legend wrapperStyle={{ fontFamily: "sans-serif", fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="qtd"
                        stroke="var(--gold-dark)"
                        strokeWidth={2}
                        dot={{ fill: "var(--gold-dark)", r: 4 }}
                        name="Contribuintes"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

"use client";
import { useState } from "react";
import useSWR from "swr";
import AdminSidebar from "@/app/components/AdminSidebar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const MESES_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const PIE_COLORS = ["#800020", "#C9A84C", "#4a0012", "#A8893A", "#D4B85A", "#6B1A2A"];

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function RelatoriosPage() {
  const now = new Date();
  const [mes, setMes] = useState(String(now.getMonth() + 1));
  const [ano, setAno] = useState(String(now.getFullYear()));
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: report } = useSWR(
    `/api/relatorios/mensal`,
    fetcher,
  );

  const { data: tithes = [] } = useSWR(
    `/api/dizimo?mes=${mes}&ano=${ano}`,
    fetcher,
  );

  const total = tithes.reduce((s: number, t: { valor: number }) => s + Number(t.valor), 0);

  // Group by payment method for pie chart
  const byMethod: Record<string, number> = {};
  for (const t of tithes) {
    const method = (t as { forma_pagamento: string }).forma_pagamento;
    byMethod[method] = (byMethod[method] || 0) + Number(t.valor);
  }
  const pieData = Object.entries(byMethod).map(([name, value]) => ({ name, value }));

  // Monthly bar data
  const monthlyData = report?.monthlyTotals?.map((m: { mes: number; ano: number; total: string; quantidade: number }) => ({
    name: `${MESES_SHORT[m.mes - 1]}/${String(m.ano).slice(2)}`,
    total: parseFloat(m.total),
    qtd: m.quantidade,
  })) || [];

  const anos = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  async function handleDownload(type: "pdf" | "excel") {
    setDownloading(type);
    try {
      const res = await fetch(`/api/relatorios/${type}?mes=${mes}&ano=${ano}`);
      if (!res.ok) throw new Error("Erro ao gerar relatório");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-dizimo-${MESES[parseInt(mes) - 1]}-${ano}.${type === "pdf" ? "pdf" : "xlsx"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Erro ao gerar relatório. Tente novamente.");
    }
    setDownloading(null);
  }

  return (
    <div className="flex" style={{ minHeight: "100vh", backgroundColor: "var(--cream)" }}>
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bold text-2xl" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>
            Relatórios
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
            Visualize dados consolidados e exporte relatórios em PDF ou Excel
          </p>
        </div>

        {/* Filters + Download */}
        <div className="flex items-end gap-3 mb-8 flex-wrap">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Mês</label>
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm"
              style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "#fff", fontFamily: "sans-serif" }}
            >
              {MESES.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Ano</label>
            <select
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm"
              style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "#fff", fontFamily: "sans-serif" }}
            >
              {anos.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => handleDownload("pdf")}
            disabled={downloading === "pdf"}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: "var(--burgundy)", color: "#fff", fontFamily: "sans-serif" }}
          >
            {downloading === "pdf" ? "Gerando..." : "Baixar PDF"}
          </button>
          <button
            onClick={() => handleDownload("excel")}
            disabled={downloading === "excel"}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: "var(--gold-dark)", color: "#fff", fontFamily: "sans-serif" }}
          >
            {downloading === "excel" ? "Gerando..." : "Baixar Excel"}
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl p-5" style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)" }}>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Total do Mês</div>
            <div className="font-bold text-xl" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>{formatBRL(total)}</div>
          </div>
          <div className="rounded-xl p-5" style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)" }}>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Contribuições</div>
            <div className="font-bold text-xl" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>{tithes.length}</div>
          </div>
          <div className="rounded-xl p-5" style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)" }}>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Ticket Médio</div>
            <div className="font-bold text-xl" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>
              {tithes.length > 0 ? formatBRL(total / tithes.length) : "R$ 0,00"}
            </div>
          </div>
          <div className="rounded-xl p-5" style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)" }}>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Formas de Pagto</div>
            <div className="font-bold text-xl" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>{pieData.length}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly bar chart */}
          <div className="rounded-xl p-6" style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)" }}>
            <h3 className="font-bold text-sm mb-4" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>
              Arrecadação Mensal (Últimos 12 meses)
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--cream-dark)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickFormatter={(v) => `R$${v}`} />
                <Tooltip formatter={(value) => formatBRL(Number(value))} />
                <Bar dataKey="total" fill="var(--burgundy)" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart by method */}
          <div className="rounded-xl p-6" style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)" }}>
            <h3 className="font-bold text-sm mb-4" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>
              Distribuição por Forma de Pagamento — {MESES[parseInt(mes) - 1]}/{ano}
            </h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatBRL(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-sm" style={{ color: "var(--text-muted)" }}>
                Sem dados para este período.
              </div>
            )}
          </div>
        </div>

        {/* Detailed table */}
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--cream-dark)", backgroundColor: "#fff" }}>
          <div className="px-6 py-4" style={{ backgroundColor: "var(--burgundy)" }}>
            <h3 className="font-bold text-sm text-white" style={{ fontFamily: "Georgia, serif" }}>
              Detalhamento — {MESES[parseInt(mes) - 1]} de {ano}
            </h3>
          </div>
          {tithes.length === 0 ? (
            <div className="py-12 text-center text-sm" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
              Nenhum registro neste período.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--cream-dark)" }}>
                  {["Contribuinte", "Valor", "Forma de Pagto", "Observação", "Data"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tithes.map((t: { id: string; nome_contribuinte: string; valor: number; forma_pagamento: string; observacao: string | null; created_at: string }, i: number) => (
                  <tr key={t.id} style={{ borderTop: i > 0 ? "1px solid var(--cream-dark)" : undefined }}>
                    <td className="px-4 py-3 font-medium text-sm" style={{ color: "var(--text-dark)", fontFamily: "sans-serif" }}>{t.nome_contribuinte}</td>
                    <td className="px-4 py-3 font-bold text-sm" style={{ color: "var(--burgundy)", fontFamily: "sans-serif" }}>{formatBRL(Number(t.valor))}</td>
                    <td className="px-4 py-3 text-sm capitalize" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>{t.forma_pagamento}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>{t.observacao || "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>{new Date(t.created_at).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid var(--cream-dark)", backgroundColor: "var(--cream)" }}>
                  <td className="px-4 py-3 font-bold text-sm" style={{ color: "var(--burgundy)", fontFamily: "sans-serif" }}>TOTAL</td>
                  <td className="px-4 py-3 font-bold text-sm" style={{ color: "var(--burgundy)", fontFamily: "sans-serif" }}>{formatBRL(total)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
